import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Műhely App",
  description: "Javítások kezelése",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"                // ← dark class-t teszi a <html>-re
          defaultTheme="system"            // vagy "light" / "dark", ha nem akarod a rendszert
          enableSystem                     // kövesse a rendszer beállítását
          disableTransitionOnChange        // ne villogjon váltásnál
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}