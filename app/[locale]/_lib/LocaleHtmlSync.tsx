"use client";

import { useEffect } from "react";

export function LocaleHtmlSync({ htmlLang }: { htmlLang: string }) {
  useEffect(() => {
    if (typeof document !== "undefined" && document.documentElement.lang !== htmlLang) {
      document.documentElement.lang = htmlLang;
    }
  }, [htmlLang]);

  return null;
}

export default LocaleHtmlSync;
