const KEY = "chaeggyeo:lastHome";

export function setLastHome(path: string) {
  try {
    localStorage.setItem(KEY, path);
  } catch {
    /* ignore */
  }
}

export function getLastHome() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
