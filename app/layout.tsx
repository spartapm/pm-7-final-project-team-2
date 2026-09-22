import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chaenggyeoyo.me"),
  title: "챙겨요 · 여행 준비물 체크리스트",
  description: "여행 일정에 맞춰 준비물을 정리해 드려요.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "챙겨요 · 여행 준비물 체크리스트",
    description: "여행 일정에 맞춰 준비물을 정리해 드려요.",
    images: [{ url: "/thumbnail_image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "챙겨요 · 여행 준비물 체크리스트",
    images: ["/thumbnail_image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" style={{ colorScheme: "light" }}>
      <head>
        <Script id="gtm" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-53WG6W4G');`}
        </Script>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-visual" />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-53WG6W4G"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
