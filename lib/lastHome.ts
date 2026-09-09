const KEY = "chaeggyeo_last_home";

export function setLastHome(path: string) {
  try {
    localStorage.setItem("chaeggyeo:lastHome", path);
    document.cookie = `${KEY}=${encodeURIComponent(path)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function getLastHome() {
  try {
    const fromCookie = document.cookie
      .split(";")
      .map((p) => p.trim())
      .find((p) => p.startsWith(`${KEY}=`));
    if (fromCookie) return decodeURIComponent(fromCookie.slice(KEY.length + 1));
    return localStorage.getItem("chaeggyeo:lastHome");
  } catch {
    return null;
  }
}
