import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt Manager - Finde und teile erfolgreiche Prompts",
  description: "Eine Community-Plattform zum Sammeln, Bewerten und Teilen erfolgreicher KI-Prompts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
