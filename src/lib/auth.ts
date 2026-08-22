import type { StoreType, User } from "@/types/auth";

const USER_KEY = "naryan_user";
const STORE_KEY = "naryan_selected_store";

export function saveUser(user: User) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  );
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw =
    localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveSelectedStore(
  store: StoreType,
) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORE_KEY,
    store,
  );
}

export function getSelectedStore(): StoreType | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    STORE_KEY,
  ) as StoreType | null;
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(STORE_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return document.cookie
    .split("; ")
    .some((cookie) =>
      cookie.startsWith("naryan_access_token="),
    );
}


//logout

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  } finally {
    // Clear old client-side session data if any exists.
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STORE_KEY);
  }
}