import Theme from "@/components/Theme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs Conversion",
  description: "Teste Full Stack - Graviola",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        <Theme>{children}</Theme>
      </body>
    </html>
  );
}
