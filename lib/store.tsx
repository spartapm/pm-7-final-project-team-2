"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  Category,
  ChecklistItem,
  OnboardingDraft,
  Trip,
} from "./types";
import { generateCategories } from "./generate";
import { climateBands, fetchClimate } from "./weather";
import { pullAccount, pushAccount, type CloudAccount, type CloudStatus } from "./cloud";

const KEY = "chaeggyeo:v1";
const CAT_RENAME: Record<string, string> = {
  필수: "필수 준비물",
  기본: "기본 짐싸기",
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function emptyDraft(): OnboardingDraft {
  return { companions: [], activities: [] };
}

function load(): AppState {
  const accountId = uid("acc");
  const fallback: AppState = {
    accountId,
    trips: [],
    personalItems: [],
    draft: emptyDraft(),
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as AppState;
    return {
      accountId: parsed.accountId || accountId,
      trips: (parsed.trips ?? []).map((trip) => ({
        ...trip,
        categories: trip.categories.map((c) => {
          const name = CAT_RENAME[c.name] ?? c.name;
          return {
            ...c,
            name,
            hint: name === "나만의 준비물" ? "모든 여행 일정에 담겨요" : undefined,
          };
        }),
      })),
      personalItems: parsed.personalItems ?? [],
      draft: parsed.draft ?? emptyDraft(),
    };
  } catch {
    return fallback;
  }
}

type Store = AppState & {
  hydrated: boolean;
  cloudStatus: CloudStatus;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  resetDraft: () => void;
  createTrip: () => Promise<Trip>;
  deleteTrip: (id: string) => void;
  updateTrip: (id: string, fn: (t: Trip) => Trip) => void;
  importTrips: (trips: Trip[], accountId?: string) => void;
  adoptAccount: (account: CloudAccount) => void;
  addPersonalItem: (name: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({
    accountId: "pending",
    trips: [],
    personalItems: [],
    draft: emptyDraft(),
  }));
  const [hydrated, setHydrated] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>("off");
  const stateRef = useRef(state);
  stateRef.current = state;
  const skipPush = useRef(true);

  useEffect(() => {
    const local = load();
    setState(local);
    setHydrated(true);

    pullAccount(local.accountId).then((res) => {
      setCloudStatus(res.status);
      if (res.status !== "ok") return;
      const remote = res.data;
      if (!remote) return;
      if (remote.trips.length || remote.personalItems.length) {
        skipPush.current = true;
        setState((s) => ({
          ...s,
          trips: remote.trips,
          personalItems: remote.personalItems.length ? remote.personalItems : s.personalItems,
        }));
        return;
      }
      if (local.trips.length || local.personalItems.length) {
        pushAccount({
          id: local.accountId,
          trips: local.trips,
          personalItems: local.personalItems,
        }).then(setCloudStatus);
      }
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipPush.current) {
      skipPush.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      pushAccount({
        id: state.accountId,
        trips: state.trips,
        personalItems: state.personalItems,
      }).then((status) => {
        if (status !== "off") setCloudStatus(status);
      });
    }, 400);
    return () => window.clearTimeout(handle);
  }, [hydrated, state.accountId, state.trips, state.personalItems]);

  const setDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setState((s) => ({ ...s, draft: { ...s.draft, ...patch } }));
  }, []);

  const resetDraft = useCallback(() => {
    setState((s) => ({ ...s, draft: emptyDraft() }));
  }, []);

  const createTrip = useCallback(async () => {
    const { draft, personalItems } = stateRef.current;
    if (!draft.countryId || !draft.startDate || !draft.endDate) {
      throw new Error("incomplete");
    }
    const climate = await fetchClimate(draft.countryId, draft.startDate, draft.endDate);
    const categories = generateCategories({
      countryId: draft.countryId,
      companions: draft.companions,
      activities: draft.activities,
      weatherIds: climate.weatherIds,
      tempBands: climateBands(climate),
      personalItems,
    });
    const trip: Trip = {
      id: uid("tr"),
      countryId: draft.countryId,
      startDate: draft.startDate,
      endDate: draft.endDate,
      companions: draft.companions,
      activities: draft.activities,
      createdAt: new Date().toISOString(),
      climate,
      categories,
      remindersShown: [],
    };
    setState((s) => ({
      ...s,
      trips: [trip, ...s.trips],
      draft: emptyDraft(),
    }));
    return trip;
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setState((s) => ({ ...s, trips: s.trips.filter((t) => t.id !== id) }));
  }, []);

  const updateTrip = useCallback((id: string, fn: (t: Trip) => Trip) => {
    setState((s) => ({
      ...s,
      trips: s.trips.map((t) => (t.id === id ? fn(t) : t)),
    }));
  }, []);

  const importTrips = useCallback((trips: Trip[], accountId?: string) => {
    setState((s) => {
      const byId = new Map(s.trips.map((t) => [t.id, t]));
      for (const t of trips) byId.set(t.id, t);
      return {
        ...s,
        accountId: accountId || s.accountId,
        trips: [...byId.values()],
      };
    });
  }, []);

  const adoptAccount = useCallback((account: CloudAccount) => {
    skipPush.current = true;
    setState((s) => ({
      ...s,
      accountId: account.id,
      trips: account.trips,
      personalItems: account.personalItems,
    }));
  }, []);

  const addPersonalItem = useCallback((name: string) => {
    setState((s) => ({
      ...s,
      personalItems: [...s.personalItems, { id: uid("p"), name }],
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      cloudStatus,
      setDraft,
      resetDraft,
      createTrip,
      deleteTrip,
      updateTrip,
      importTrips,
      adoptAccount,
      addPersonalItem,
    }),
    [
      state,
      hydrated,
      cloudStatus,
      setDraft,
      resetDraft,
      createTrip,
      deleteTrip,
      updateTrip,
      importTrips,
      adoptAccount,
      addPersonalItem,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
}

export function patchCategory(trip: Trip, catId: string, fn: (c: Category) => Category): Trip {
  return {
    ...trip,
    categories: trip.categories.map((c) => (c.id === catId ? fn(c) : c)),
  };
}

export function patchItem(
  trip: Trip,
  catId: string,
  itemId: string,
  fn: (i: ChecklistItem) => ChecklistItem
): Trip {
  return patchCategory(trip, catId, (c) => ({
    ...c,
    items: c.items.map((i) => (i.id === itemId ? fn(i) : i)),
  }));
}

export function newItem(name: string): ChecklistItem {
  return {
    id: uid("it"),
    name,
    checked: false,
    wished: false,
    custom: true,
  };
}
