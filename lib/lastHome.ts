const KEY = "chaeggyeo:lastHome";

function clearLegacyCookies() {
  if (typeof document === "undefined") return;
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (name?.startsWith("chaeggyeo")) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  }
}

export function setLastHome(path: string) {
  try {
    clearLegacyCookies();
    localStorage.setItem(KEY, path);
  } catch {
    /* ignore */
  }
}

export function getLastHome() {
  try {
    clearLegacyCookies();
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
