interface Window {
  gtag: (command: string, id: string, config?: { page_path: string, send_page_view?: boolean }) => void;
  dataLayer: Array<{
    event: string;
    [key: string]: unknown;
  }>;
}
