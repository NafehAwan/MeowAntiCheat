import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeowAntiCheat - Observe. Detect. Prove.",
  description: "Advanced Minecraft anti-cheat with evidence recording and web dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
