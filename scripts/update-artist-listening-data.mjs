import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import vm from 'node:vm';

const ARTISTS_PATH = path.resolve('src/features/lineup/data/artists.ts');
const PREVIEWS_PATH = path.resolve('src/features/lineup/data/artist-previews.ts');
const REQUEST_HEADERS = {
  'User-Agent': 'lolla-itinerario/1.0 (+https://github.com/mfaundez/ordenador)',
  Accept: 'application/json',
};
const MUSIC_CONTEXT_PATTERN =
  /\b(banda|grupo|cantante|musico|músico|rapero|rapper|dj|productor|duo|dúo|solista|compositor|music|musician|singer|artist|hip hop|rock|pop|electro|house|techno|folk|jazz|serie|television|televisión|programa)\b/i;
const COUNTRY_BY_ISO = {
  AR: 'Argentina',
  AU: 'Australia',
  CL: 'Chile',
  CU: 'Cuba',
  ES: 'España',
  KR: 'Corea del Sur',
  MX: 'México',
  NZ: 'Nueva Zelanda',
  UK: 'Reino Unido',
  US: 'Estados Unidos',
};

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function quote(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function quoteOrNull(value) {
  return value ? quote(value) : 'null';
}

function upscaleArtworkUrl(url, size = 600) {
  if (!url) {
    return null;
  }

  return String(url).replace(/\/\d+x\d+bb\./, `/${size}x${size}bb.`);
}

function buildSpotifySearchUrl(query) {
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}

function buildYoutubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function parseArtists(artistsSource) {
  const artists = [];
  const regex =
    /\{\s*id:\s*(\d+),\s*name:\s*'([^']+)',[\s\S]*?genre:\s*'([^']+)'[\s\S]*?\}/g;

  let match = regex.exec(artistsSource);
  while (match) {
    artists.push({
      id: Number(match[1]),
      name: match[2],
      genre: match[3],
    });
    match = regex.exec(artistsSource);
  }

  return artists;
}

function readBaselineSongsFromGit() {
  try {
    const gitPath = 'src/features/lineup/data/artist-previews.ts';
    const baselineSource = execFileSync('git', ['show', `HEAD:${gitPath}`], {
      encoding: 'utf8',
    });
    const songsByArtist = {};
    const blockRegex =
      /\s*(\d+):\s*\{[\s\S]*?songs:\s*\[([\s\S]*?)\],\s*styleDescription:/g;

    let blockMatch = blockRegex.exec(baselineSource);
    while (blockMatch) {
      const artistId = Number(blockMatch[1]);
      const songsSection = blockMatch[2];
      const parsedSongs = vm.runInNewContext(`[${songsSection}]`);

      if (Array.isArray(parsedSongs)) {
        songsByArtist[artistId] = parsedSongs
          .map((song) => {
            if (typeof song === 'string') {
              return song;
            }

            if (song && typeof song.title === 'string') {
              return song.title;
            }

            return null;
          })
          .filter((song) => typeof song === 'string')
          .slice(0, 3);
      }

      blockMatch = blockRegex.exec(baselineSource);
    }

    return songsByArtist;
  } catch {
    return {};
  }
}

function artistMatchScore(targetArtist, candidateArtist) {
  const normalizedTarget = normalizeText(targetArtist);
  const normalizedCandidate = normalizeText(candidateArtist);

  if (!normalizedTarget || !normalizedCandidate) {
    return 0;
  }

  if (normalizedTarget === normalizedCandidate) {
    return 80;
  }

  let score = 0;
  const targetTokens = normalizedTarget.split(' ').filter((token) => token.length > 2);

  for (const token of targetTokens) {
    if (normalizedCandidate.includes(token)) {
      score += 10;
    }
  }

  if (normalizedTarget.includes(normalizedCandidate)) {
    score += 8;
  }

  if (normalizedCandidate.includes(normalizedTarget)) {
    score += 8;
  }

  return score;
}

function pickBestSongResult(results, artistName, songTitle) {
  const normalizedSongTitle = normalizeText(songTitle);
  const songTokens = normalizedSongTitle
    .split(' ')
    .filter((token) => token.length > 2)
    .slice(0, 8);

  let bestResult = null;
  let bestScore = -1;

  for (const result of results) {
    if (!result?.trackName) {
      continue;
    }

    const normalizedTrackName = normalizeText(result.trackName);
    let score = 0;

    if (normalizedTrackName === normalizedSongTitle) {
      score += 70;
    }

    if (normalizedTrackName.includes(normalizedSongTitle)) {
      score += 35;
    }

    for (const token of songTokens) {
      if (normalizedTrackName.includes(token)) {
        score += 6;
      }
    }

    score += artistMatchScore(artistName, result.artistName ?? '');

    if (result.previewUrl) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestResult = result;
    }
  }

  return bestResult;
}

function pickBestArtistResult(results, artistName) {
  let bestResult = null;
  let bestScore = -1;

  for (const result of results) {
    if (!result?.artistName) {
      continue;
    }

    const score = artistMatchScore(artistName, result.artistName);
    if (score > bestScore) {
      bestScore = score;
      bestResult = result;
    }
  }

  return bestResult;
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, { headers: REQUEST_HEADERS });
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function dedupeSongs(results) {
  const seen = new Set();
  const unique = [];

  for (const result of results) {
    const trackName = String(result?.trackName ?? '').trim();
    if (!trackName) {
      continue;
    }

    const normalized = normalizeText(trackName);
    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    unique.push(trackName);
  }

  return unique;
}

function isFallbackSongTitle(songTitle) {
  return normalizeText(songTitle).startsWith('track recomendado');
}

function isMeaningfulTitle(songTitle) {
  return Boolean(songTitle && !isFallbackSongTitle(songTitle));
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function compactText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function trimSentence(value, maxLength = 220) {
  const text = compactText(value);
  if (text.length <= maxLength) {
    return text;
  }

  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}…`;
}

function includesMusicContext(value) {
  return MUSIC_CONTEXT_PATTERN.test(String(value ?? ''));
}

function isSingleTokenArtistName(artistName) {
  return normalizeText(artistName).split(' ').filter(Boolean).length === 1;
}

function scoreWikipediaSearchResult(artistName, result) {
  const title = String(result?.title ?? '');
  const snippet = compactText(result?.snippet ?? '');
  let score = artistMatchScore(artistName, title);

  if (includesMusicContext(snippet)) {
    score += 14;
  }

  if (title.includes('(') && title.includes(')')) {
    score += 5;
  }

  if (/desambiguaci[oó]n|disambiguation/i.test(snippet)) {
    score -= 30;
  }

  return score;
}

function buildWikipediaSummaryText(artistName, pageSummary) {
  const title = compactText(pageSummary?.title ?? artistName);
  const description = compactText(pageSummary?.description ?? '');
  const extract = compactText(pageSummary?.extract ?? '');
  const firstExtractSentence = extract.split(/(?<=[.!?])\s+/)[0] ?? '';

  if (description) {
    if (
      normalizeText(description).startsWith(normalizeText(title)) ||
      /^es\b/i.test(description)
    ) {
      return trimSentence(description);
    }
    return trimSentence(`${title} es ${description}.`);
  }

  if (firstExtractSentence) {
    return trimSentence(firstExtractSentence);
  }

  return trimSentence(`${artistName} tiene presencia activa en plataformas musicales.`);
}

async function resolveWikipediaProfileByLanguage(artistName, language) {
  const searchUrl = `https://${language}.wikipedia.org/w/api.php?action=query&list=search&srlimit=8&format=json&utf8=1&srsearch=${encodeURIComponent(
    `${artistName} música`,
  )}`;
  const payload = await fetchJson(searchUrl);
  const results = Array.isArray(payload?.query?.search) ? payload.query.search : [];
  const candidates = results
    .map((result) => ({
      result,
      score: scoreWikipediaSearchResult(artistName, result),
    }))
    .filter(({ score }) => score >= 18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  for (const candidate of candidates) {
    const title = String(candidate.result?.title ?? '').trim();
    if (!title) {
      continue;
    }

    const summaryUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title,
    )}`;
    const summaryPayload = await fetchJson(summaryUrl);

    if (!summaryPayload || summaryPayload?.type === 'disambiguation') {
      continue;
    }

    const summaryTitle = compactText(summaryPayload.title ?? title);
    const fullText = `${compactText(summaryPayload.description ?? '')} ${compactText(
      summaryPayload.extract ?? '',
    )}`.trim();
    const titleScore = artistMatchScore(artistName, summaryTitle);
    const hasMusicContext = includesMusicContext(fullText);
    const singleTokenName = isSingleTokenArtistName(artistName);

    if (titleScore < (singleTokenName ? 40 : 24)) {
      continue;
    }

    if (!hasMusicContext && singleTokenName) {
      continue;
    }

    return {
      source: language === 'es' ? 'Wikipedia ES' : 'Wikipedia EN',
      sourceUrl:
        summaryPayload?.content_urls?.desktop?.page ??
        `https://${language}.wikipedia.org/wiki/${encodeURIComponent(summaryTitle)}`,
      summary: buildWikipediaSummaryText(artistName, summaryPayload),
    };
  }

  return null;
}

function normalizeMusicBrainzType(type) {
  const normalized = normalizeText(type);
  if (normalized === 'group') {
    return 'banda';
  }
  if (normalized === 'person') {
    return 'artista solista';
  }
  if (normalized === 'duo') {
    return 'dúo';
  }
  return null;
}

function normalizeCountryCode(countryCode) {
  const normalizedCode = compactText(countryCode).toUpperCase();
  return COUNTRY_BY_ISO[normalizedCode] ?? normalizedCode;
}

function buildMusicBrainzSummary(artistName, artist) {
  const type = normalizeMusicBrainzType(artist?.type);
  const country = normalizeCountryCode(artist?.country ?? '');
  const tags = Array.isArray(artist?.tags)
    ? artist.tags
        .filter((tag) => typeof tag?.name === 'string' && Number(tag?.count ?? 0) > 0)
        .sort((a, b) => Number(b.count) - Number(a.count))
        .slice(0, 2)
        .map((tag) => String(tag.name))
    : [];

  const parts = [];
  if (type) {
    parts.push(type);
  }
  if (country) {
    parts.push(`asociado a ${country}`);
  }
  if (tags.length > 0) {
    parts.push(`con etiquetas ${tags.join(' / ')}`);
  }

  if (parts.length === 0) {
    return trimSentence(`${artistName} aparece registrado como artista musical en MusicBrainz.`);
  }

  return trimSentence(`${artistName} aparece en MusicBrainz como ${parts.join(', ')}.`);
}

async function resolveMusicBrainzProfile(artistName) {
  const query = encodeURIComponent(`artist:${artistName}`);
  const url = `https://musicbrainz.org/ws/2/artist/?query=${query}&fmt=json&limit=6`;
  const payload = await fetchJson(url);
  const results = Array.isArray(payload?.artists) ? payload.artists : [];
  const ranked = results
    .map((artist) => ({
      artist,
      apiScore: Number(artist?.score ?? 0),
      nameScore: artistMatchScore(artistName, String(artist?.name ?? '')),
    }))
    .filter(({ apiScore, nameScore }) => apiScore >= 70 && nameScore >= 24)
    .sort((a, b) => b.apiScore + b.nameScore - (a.apiScore + a.nameScore));
  const best = ranked[0]?.artist;

  if (!best) {
    return null;
  }

  return {
    source: 'MusicBrainz',
    sourceUrl: best?.id ? `https://musicbrainz.org/artist/${best.id}` : null,
    summary: buildMusicBrainzSummary(artistName, best),
  };
}

async function resolveArtistProfile(artistName) {
  const spanishWikiProfile = await resolveWikipediaProfileByLanguage(artistName, 'es');
  if (spanishWikiProfile) {
    return spanishWikiProfile;
  }

  const englishWikiProfile = await resolveWikipediaProfileByLanguage(artistName, 'en');
  if (englishWikiProfile) {
    return englishWikiProfile;
  }

  return await resolveMusicBrainzProfile(artistName);
}

function buildDeezerArtistQueries(artistName) {
  const queries = [`artist:\"${artistName}\"`, artistName];
  const normalizedTokens = normalizeText(artistName)
    .split(' ')
    .filter((token) => token.length > 2);
  const uniqueTokens = [...new Set(normalizedTokens)];

  if (uniqueTokens.length === 1) {
    queries.push(uniqueTokens[0]);
  }

  return uniqueStrings(queries);
}

async function resolveTopSongTitles(artistName) {
  const iTunesTitles = await resolveTopSongTitlesFromItunes(artistName);
  if (iTunesTitles.length >= 3) {
    return iTunesTitles.slice(0, 3);
  }
  const deezerTitles = await resolveTopSongTitlesFromDeezer(artistName);
  return uniqueStrings([...iTunesTitles, ...deezerTitles]).slice(0, 3);
}

async function resolveTopSongTitlesFromItunes(artistName) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=song&country=CL&limit=50`;
  const payload = await fetchJson(url);
  const results = Array.isArray(payload?.results) ? payload.results : [];

  const exactOrCloseArtistResults = results
    .map((result) => ({
      result,
      score: artistMatchScore(artistName, String(result?.artistName ?? '')),
    }))
    .filter(({ score }) => score >= 10)
    .sort((a, b) => b.score - a.score)
    .map(({ result }) => result);

  const candidatePool =
    exactOrCloseArtistResults.length > 0 ? exactOrCloseArtistResults : results;
  const uniqueSongs = dedupeSongs(candidatePool);

  return uniqueSongs.slice(0, 3);
}

async function resolveTopSongTitlesFromDeezer(artistName) {
  const rankedTracks = [];
  const queries = buildDeezerArtistQueries(artistName);

  for (const query of queries) {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;
    const payload = await fetchJson(url);
    const results = Array.isArray(payload?.data) ? payload.data : [];

    rankedTracks.push(
      ...results
        .map((result) => ({
          result,
          score: artistMatchScore(artistName, String(result?.artist?.name ?? '')),
        }))
        .filter(({ result, score }) => score >= 25 && typeof result?.title === 'string')
        .sort((a, b) => b.score - a.score)
        .map(({ result }) => ({ trackName: result.title })),
    );
  }

  return dedupeSongs(rankedTracks).slice(0, 3);
}

function pickBestDeezerTrackResult(results, artistName, songTitle) {
  const isFallbackTitle = isFallbackSongTitle(songTitle);
  const normalizedSongTitle = normalizeText(songTitle);
  const songTokens = normalizedSongTitle
    .split(' ')
    .filter((token) => token.length > 2)
    .slice(0, 8);

  let bestResult = null;
  let bestScore = -1;

  for (const result of results) {
    const title = String(result?.title ?? '').trim();
    const artist = String(result?.artist?.name ?? '').trim();
    if (!title || !artist) {
      continue;
    }

    const normalizedTrackName = normalizeText(title);
    let score = artistMatchScore(artistName, artist);

    if (!isFallbackTitle && normalizedTrackName === normalizedSongTitle) {
      score += 70;
    }

    if (!isFallbackTitle && normalizedTrackName.includes(normalizedSongTitle)) {
      score += 35;
    }

    if (!isFallbackTitle) {
      for (const token of songTokens) {
        if (normalizedTrackName.includes(token)) {
          score += 6;
        }
      }
    }

    if (result?.preview) {
      score += 8;
    }

    if (score > bestScore) {
      bestScore = score;
      bestResult = result;
    }
  }

  if (bestScore < (isFallbackTitle ? 30 : 40)) {
    return null;
  }

  return bestResult;
}

async function resolveSongFromDeezer(artistName, songTitle) {
  const queries = isFallbackSongTitle(songTitle)
    ? buildDeezerArtistQueries(artistName)
    : uniqueStrings([`${artistName} ${songTitle}`, `artist:\"${artistName}\" ${songTitle}`]);
  const results = [];

  for (const query of queries) {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;
    const payload = await fetchJson(url);
    const queryResults = Array.isArray(payload?.data) ? payload.data : [];
    results.push(...queryResults);
  }

  const bestResult = pickBestDeezerTrackResult(results, artistName, songTitle);

  return {
    previewUrl: bestResult?.preview ?? null,
  };
}

async function resolveSong(artistName, songTitle) {
  const query = `${artistName} ${songTitle}`;
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&country=CL&limit=25`;
  const payload = await fetchJson(url);
  const results = Array.isArray(payload?.results) ? payload.results : [];
  const bestResult = pickBestSongResult(results, artistName, songTitle);
  const deezerResult = bestResult?.previewUrl
    ? null
    : await resolveSongFromDeezer(artistName, songTitle);

  return {
    title: songTitle,
    previewUrl: bestResult?.previewUrl ?? deezerResult?.previewUrl ?? null,
    links: {
      appleMusic: bestResult?.trackViewUrl ?? null,
      spotify: buildSpotifySearchUrl(`${artistName} ${songTitle}`),
      youtube: buildYoutubeSearchUrl(`${artistName} ${songTitle}`),
    },
  };
}

async function resolveArtistAppleMusicLink(artistName) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=musicArtist&country=CL&limit=8`;
  const payload = await fetchJson(url);
  const results = Array.isArray(payload?.results) ? payload.results : [];
  const bestResult = pickBestArtistResult(results, artistName);

  return bestResult?.artistLinkUrl ?? null;
}

async function resolveArtistImageUrl(artistName) {
  const iTunesImage = await resolveArtistImageUrlFromItunes(artistName);
  if (iTunesImage) {
    return iTunesImage;
  }

  const audioDbImage = await resolveArtistImageUrlFromAudioDb(artistName);
  if (audioDbImage) {
    return audioDbImage;
  }

  const deezerImage = await resolveArtistImageUrlFromDeezer(artistName);
  if (deezerImage) {
    return deezerImage;
  }

  return null;
}

async function resolveArtistImageUrlFromItunes(artistName) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=song&country=CL&limit=30`;
  const payload = await fetchJson(url);
  const results = Array.isArray(payload?.results) ? payload.results : [];

  const bestMatch = results
    .map((result) => ({
      result,
      score: artistMatchScore(artistName, String(result?.artistName ?? '')),
    }))
    .filter(({ result, score }) => score >= 30 && result?.artworkUrl100)
    .sort((a, b) => b.score - a.score)[0]?.result;

  const exactMatch =
    results.find(
      (result) =>
        result?.artworkUrl100 &&
        normalizeText(String(result?.artistName ?? '')) === normalizeText(artistName),
    ) ?? null;
  const artworkUrl = bestMatch?.artworkUrl100 ?? exactMatch?.artworkUrl100 ?? null;

  return upscaleArtworkUrl(artworkUrl, 600);
}

async function resolveArtistImageUrlFromAudioDb(artistName) {
  const url = `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(artistName)}`;
  const payload = await fetchJson(url);
  const results = Array.isArray(payload?.artists) ? payload.artists : [];

  const bestMatch = results
    .map((result) => ({
      result,
      score: artistMatchScore(artistName, String(result?.strArtist ?? '')),
    }))
    .filter(
      ({ result, score }) => score >= 30 && (result?.strArtistThumb || result?.strArtistFanart),
    )
    .sort((a, b) => b.score - a.score)[0]?.result;

  return bestMatch?.strArtistThumb ?? bestMatch?.strArtistFanart ?? null;
}

async function resolveArtistImageUrlFromDeezer(artistName) {
  const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`;
  const payload = await fetchJson(url);
  const results = Array.isArray(payload?.data) ? payload.data : [];

  const bestMatch = results
    .map((result) => ({
      result,
      score: artistMatchScore(artistName, String(result?.name ?? '')),
    }))
    .filter(
      ({ result, score }) =>
        score >= 30 &&
        (result?.picture_xl || result?.picture_big || result?.picture_medium || result?.picture),
    )
    .sort((a, b) => b.score - a.score)[0]?.result;

  return (
    bestMatch?.picture_xl ??
    bestMatch?.picture_big ??
    bestMatch?.picture_medium ??
    bestMatch?.picture ??
    null
  );
}

function buildStyleDescription(artistName, genre) {
  return `${artistName} aparece en el lineup en la línea ${genre.toLowerCase()}. Fuente: lineup oficial.`;
}

function buildStyleDescriptionFromProfile(artistName, genre, profile) {
  if (!profile?.summary) {
    return buildStyleDescription(artistName, genre);
  }

  const profileSummary = trimSentence(profile.summary, 190);
  if (normalizeText(profileSummary).includes(normalizeText(artistName))) {
    return trimSentence(
      `${profileSummary} Para esta guía, lo ubicamos en ${genre.toLowerCase()}. Fuente: ${profile.source}.`,
      240,
    );
  }

  return trimSentence(
    `${artistName}: ${profileSummary} Para esta guía, lo ubicamos en ${genre.toLowerCase()}. Fuente: ${profile.source}.`,
    240,
  );
}

function buildVerdict(artistName, genre, profile) {
  const genreLabel = genre.toLowerCase();
  if (profile?.summary) {
    return trimSentence(
      `Si te interesa ${genreLabel} y te calza el perfil real de ${artistName}, este show es una buena opción para priorizar en la jornada.`,
      220,
    );
  }

  return trimSentence(
    `Si te interesa ${genreLabel}, vale una escucha rápida previa para decidir si priorizar este show.`,
    200,
  );
}

function renderSong(song) {
  return `      {\n        title: ${quote(song.title)},\n        previewUrl: ${quoteOrNull(song.previewUrl)},\n        links: {\n          appleMusic: ${quoteOrNull(song.links.appleMusic)},\n          spotify: ${quote(song.links.spotify)},\n          youtube: ${quote(song.links.youtube)},\n        },\n      }`;
}

function renderPreviewBlock(preview) {
  return `  ${preview.id}: {\n    songs: [\n${preview.songs.map((song) => renderSong(song)).join(',\n')}\n    ],\n    artistImageUrl: ${quoteOrNull(preview.artistImageUrl)},\n    artistLinks: {\n      appleMusic: ${quoteOrNull(preview.artistLinks.appleMusic)},\n      spotify: ${quote(preview.artistLinks.spotify)},\n      youtube: ${quote(preview.artistLinks.youtube)},\n    },\n    styleDescription: ${quote(preview.styleDescription)},\n    verdict: ${quote(preview.verdict)},\n  }`;
}

async function main() {
  const artistsSource = await readFile(ARTISTS_PATH, 'utf8');
  const artists = parseArtists(artistsSource);
  const baselineSongs = readBaselineSongsFromGit();

  const previews = [];

  for (const artist of artists) {
    const topTitles = await resolveTopSongTitles(artist.name);
    const baselineTitles = baselineSongs[artist.id] ?? [];
    const baselineHasMeaningfulTitles = baselineTitles.some(isMeaningfulTitle);
    const chosenTitles = baselineHasMeaningfulTitles ? baselineTitles : topTitles;

    const songTitles = [...chosenTitles];
    while (songTitles.length < 3) {
      songTitles.push(`Track recomendado ${songTitles.length + 1}`);
    }

    const songs = await Promise.all([
      resolveSong(artist.name, songTitles[0]),
      resolveSong(artist.name, songTitles[1]),
      resolveSong(artist.name, songTitles[2]),
    ]);
    const [artistAppleMusic, artistImageUrl, artistProfile] = await Promise.all([
      resolveArtistAppleMusicLink(artist.name),
      resolveArtistImageUrl(artist.name),
      resolveArtistProfile(artist.name),
    ]);
    const styleDescription = buildStyleDescriptionFromProfile(
      artist.name,
      artist.genre,
      artistProfile,
    );
    const verdict = buildVerdict(artist.name, artist.genre, artistProfile);

    previews.push({
      id: artist.id,
      songs,
      artistImageUrl,
      artistLinks: {
        appleMusic: artistAppleMusic,
        spotify: buildSpotifySearchUrl(artist.name),
        youtube: buildYoutubeSearchUrl(artist.name),
      },
      styleDescription,
      verdict,
    });

    console.log(
      `Updated artist ${artist.id}/33: ${artist.name} (${artistProfile?.source ?? 'lineup'})`,
    );
  }

  const generatedAt = new Date().toISOString();

  const fileContent = `import type { ArtistPreview } from '@/features/lineup/types';\n\n// Generated by scripts/update-artist-listening-data.mjs\n// Snapshot: ${generatedAt}\nexport const ARTIST_PREVIEWS: Record<number, ArtistPreview> = {\n${previews
    .map((preview) => renderPreviewBlock(preview))
    .join(
      ',\n',
    )}\n};\n\nexport const PREVIEW_FALLBACK: ArtistPreview = {\n  songs: [\n    {\n      title: 'Busca su set en Spotify',\n      previewUrl: null,\n      links: {\n        appleMusic: null,\n        spotify: 'https://open.spotify.com/search/musica%20en%20vivo',\n        youtube: 'https://www.youtube.com/results?search_query=musica+en+vivo',\n      },\n    },\n    {\n      title: 'Revisa su playlist oficial',\n      previewUrl: null,\n      links: {\n        appleMusic: null,\n        spotify: 'https://open.spotify.com/search/playlist%20oficial',\n        youtube: 'https://www.youtube.com/results?search_query=playlist+oficial',\n      },\n    },\n    {\n      title: 'Escucha una sesión en vivo',\n      previewUrl: null,\n      links: {\n        appleMusic: null,\n        spotify: 'https://open.spotify.com/search/live%20session',\n        youtube: 'https://www.youtube.com/results?search_query=live+session',\n      },\n    },\n  ],\n  artistImageUrl: null,\n  artistLinks: {\n    appleMusic: null,\n    spotify: 'https://open.spotify.com/search',\n    youtube: 'https://www.youtube.com/results?search_query=musica',\n  },\n  styleDescription: 'No encontramos una previa específica para este artista en este momento.',\n  verdict: 'Igual puede sorprender en vivo; dale una escucha rápida antes del show.',\n};\n`;

  await writeFile(PREVIEWS_PATH, fileContent, 'utf8');
  console.log(`Wrote ${PREVIEWS_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
