"use client";

import { useEffect } from "react";
import { loadCatalogFromCloud } from "@/lib/liveCatalog";

export function CatalogLoader() {
  useEffect(() => {
    const refresh = () => {
      void loadCatalogFromCloud();
    };
    refresh();
    const onVis = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return null;
}
