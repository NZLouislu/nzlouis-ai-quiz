"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type GtagConfig = {
  page_path?: string;
  page_title?: string;
  send_page_view?: boolean;
  [key: string]: unknown;
};

type Gtag = {
  (command: "config", targetId: string, config?: GtagConfig): void;
  (command: "js", date: Date): void;
  (command: "event", action: string, params?: GtagConfig): void;
};

declare global {
  interface Window {
    gtag: Gtag;
    dataLayer?: GtagConfig[];
  }
}

const GA_TRACKING_ID = process.env.GA_TRACKING_ID;

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_TRACKING_ID || !window.gtag) return;

    const url = pathname + searchParams.toString();
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
