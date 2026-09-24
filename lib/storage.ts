const TOKEN_KEY = "lumina_token";
const USER_KEY = "lumina_user";

export const storage = {
  getToken: () =>
    typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY),
  setSession: (token: string | undefined, user: unknown) => {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: () => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clearSession: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
