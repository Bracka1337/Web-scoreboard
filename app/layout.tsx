import "./globals.css";
import localFont from 'next/font/local'

const schabo = localFont({
  src: './SCHABO-Condensed.otf',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"> 
      <body className={schabo.className}>{children}</body>
    </html>
  );
} 