import type { Artist } from '@/features/lineup/types';

type FestivalClockInput = {
  festivalDate: string;
  now?: Date;
  timeZone: string;
};

type LineupFocus = {
  anchorArtistId: number | null;
  liveArtistIds: number[];
};

type ClockParts = {
  day: number;
  hour: number;
  minute: number;
  month: number;
  year: number;
};

const MINUTES_IN_DAY = 24 * 60;

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function toUtcDayIndex(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

function getClockPartsInTimeZone(now: Date, timeZone: string): ClockParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const partMap = formatter
    .formatToParts(now)
    .reduce<Record<string, string>>((accumulator, part) => {
      if (part.type !== 'literal') {
        accumulator[part.type] = part.value;
      }
      return accumulator;
    }, {});

  return {
    year: Number(partMap.year),
    month: Number(partMap.month),
    day: Number(partMap.day),
    hour: Number(partMap.hour),
    minute: Number(partMap.minute),
  };
}

function getArtistWindow(artist: Artist): { id: number; start: number; end: number } {
  const start = parseTimeToMinutes(artist.start);
  const endBase = parseTimeToMinutes(artist.end);
  const end = endBase <= start ? endBase + MINUTES_IN_DAY : endBase;

  return {
    id: artist.id,
    start,
    end,
  };
}

export function getTimelineMinuteFromNow({
  festivalDate,
  now = new Date(),
  timeZone,
}: FestivalClockInput): number {
  const [festivalYear, festivalMonth, festivalDay] = festivalDate.split('-').map(Number);
  const current = getClockPartsInTimeZone(now, timeZone);

  const currentDayOffset =
    toUtcDayIndex(current.year, current.month, current.day) -
    toUtcDayIndex(festivalYear, festivalMonth, festivalDay);

  return currentDayOffset * MINUTES_IN_DAY + current.hour * 60 + current.minute;
}

export function getLineupFocus(
  artists: readonly Artist[],
  timelineMinute: number,
): LineupFocus {
  const windows = artists.map(getArtistWindow);

  const liveArtistIds = windows
    .filter((window) => timelineMinute >= window.start && timelineMinute < window.end)
    .map((window) => window.id);

  if (liveArtistIds.length > 0) {
    return {
      liveArtistIds,
      anchorArtistId: liveArtistIds[0] ?? null,
    };
  }

  const upcoming = windows.find((window) => window.start > timelineMinute);
  if (upcoming) {
    return {
      liveArtistIds: [],
      anchorArtistId: upcoming.id,
    };
  }

  return {
    liveArtistIds: [],
    anchorArtistId: windows[windows.length - 1]?.id ?? null,
  };
}
