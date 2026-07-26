import type { Metadata } from "next";
import { headers } from "next/headers";
import "../site-src/styles.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);

  return {
    metadataBase: base,
    title: "Creative Technologist — AI, Interaction, Product Craft",
    description: "I build digital worlds that make hard ideas feel inevitable.",
    openGraph: {
      title: "Creative Technologist — AI, Interaction, Product Craft",
      description: "I build digital worlds that make hard ideas feel inevitable.",
      images: [{ url: "/og.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Creative Technologist — AI, Interaction, Product Craft",
      description: "I build digital worlds that make hard ideas feel inevitable.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
