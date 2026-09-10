"use client";

import { useEffect } from "react";
import { loadCatalogFromCloud } from "@/lib/liveCatalog";

export function CatalogLoader() {
  useEffect(() => {
    loadCatalogFromCloud();
  }, []);
  return null;
}
