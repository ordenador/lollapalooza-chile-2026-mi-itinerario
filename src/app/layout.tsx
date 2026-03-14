import type { Metadata } from 'next';
import { Anton, Golos_Text } from 'next/font/google';
import '@/styles/globals.css';

const golosText = Golos_Text({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-body',
});

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Lollapalooza Chile 2026 - Mi Itinerario',
  description: 'Organiza tu ruta del festival y guarda tus bandas favoritas.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${golosText.variable} ${anton.variable}`}>{children}</body>
    </html>
  );
}
