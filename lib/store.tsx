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
import { PRESET_CATEGORY_NAMES } from "./catalog";
import { tripStatus } from "./dates";
import { deleteRateFor, linksFor, specOf } from "./itemMeta";
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

function enrichItem(i: ChecklistItem, activityId?: string): ChecklistItem {
  const spec = specOf(i.masterId, i.name);
  if (!spec) return i;
  const links = linksFor(spec.id).map((l) => ({ text: l.text, url: l.url, type: l.type }));
  return {
    ...i,
    masterId: spec.id,
    name: i.custom ? i.name : spec.name,
    linkNote: spec.linkNote,
    linkCount: spec.linkCount,
    links,
    deleteRate: i.deleteRate ?? deleteRateFor(activityId, spec.id),
  };
}

function isPersonalCat(c: Category) {
  return c.kind === "personal" || c.name === "나만의 준비물";
}

function personalHit(
  id: string | undefined,
  name: string,
  match: { personalId?: string; name: string }
) {
  if (match.personalId) return id === match.personalId;
  return name === match.name;
}

function migrateTrips(trips: Trip[]): Trip[] {
  const presets = new Set(PRESET_CATEGORY_NAMES);
  return trips.map((trip) => {
    let categories = trip.categories.map((c) => {
      const name = CAT_RENAME[c.name.trim()] ?? c.name;
      const personal = name === "나만의 준비물";
      return {
        ...c,
        name,
        kind: personal ? "personal" as const : c.kind,
        hint: personal
          ? "모든 여행 일정에 담겨요"
          : presets.has(name)
            ? undefined
            : (c.hint || "직접 추가한 항목"),
        items: (c.items ?? []).map((i) => enrichItem(i, c.activityId)),
      };
    });
    const personal = categories.filter((c) => c.name === "나만의 준비물");
    const rest = categories.filter((c) => c.name !== "나만의 준비물");
    if (personal.length === 0) {
      categories = [
        {
          id: uid("cat"),
          name: "나만의 준비물",
          kind: "personal",
          hint: "모든 여행 일정에 담겨요",
          collapsed: false,
          items: [],
        },
        ...rest,
      ];
    } else {
      categories = [...personal, ...rest];
    }
    return { ...trip, seen: trip.seen ?? true, categories };
  });
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
      trips: migrateTrips(parsed.trips ?? []),
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
  createTrip: (signal?: AbortSignal) => Promise<Trip>;
  deleteTrip: (id: string) => void;
  updateTrip: (id: string, fn: (t: Trip) => Trip) => void;
  importTrips: (trips: Trip[], accountId?: string) => void;
  adoptAccount: (account: CloudAccount) => void;
  addPersonalItem: (name: string) => void;
  renamePersonalItem: (match: { personalId?: string; name: string }, nextName: string) => void;
  removePersonalItem: (match: { personalId?: string; name: string }) => void;
  restoreSnapshot: (snap: { trips: Trip[]; personalItems: { id: string; name: string }[] }) => void;
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
          trips: migrateTrips(remote.trips),
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
    if (state.accountId === "pending") return;
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

  const createTrip = useCallback(async (signal?: AbortSignal) => {
    const { draft, personalItems } = stateRef.current;
    if (!draft.countryId || !draft.startDate || !draft.endDate) {
      throw new Error("incomplete");
    }
    const climate = await fetchClimate(draft.countryId, draft.startDate, draft.endDate, {
      timeoutMs: 5000,
    });
    if (signal?.aborted) throw new Error("timeout");
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
      seen: false,
    };
    if (signal?.aborted) throw new Error("timeout");
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
      for (const t of migrateTrips(trips)) byId.set(t.id, t);
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
      trips: migrateTrips(account.trips),
      personalItems: account.personalItems,
    }));
  }, []);

  const addPersonalItem = useCallback((name: string) => {
    setState((s) => {
      const catalogId = uid("p");
      return {
        ...s,
        personalItems: [...s.personalItems, { id: catalogId, name }],
        trips: s.trips.map((trip) =>
          tripStatus(trip) === "done"
            ? trip
            : {
                ...trip,
                categories: trip.categories.map((c) =>
                  isPersonalCat(c)
                    ? {
                        ...c,
                        items: [
                          ...c.items,
                          {
                            id: uid("it"),
                            personalId: catalogId,
                            name,
                            checked: false,
                            wished: false,
                            custom: true,
                          },
                        ],
                      }
                    : c
                ),
              }
        ),
      };
    });
  }, []);

  const renamePersonalItem = useCallback(
    (match: { personalId?: string; name: string }, nextName: string) => {
      setState((s) => ({
        ...s,
        personalItems: s.personalItems.map((p) =>
          personalHit(p.id, p.name, match) ? { ...p, name: nextName } : p
        ),
        trips: s.trips.map((trip) =>
          tripStatus(trip) === "done"
            ? trip
            : {
                ...trip,
                categories: trip.categories.map((c) =>
                  isPersonalCat(c)
                    ? {
                        ...c,
                        items: c.items.map((i) =>
                          personalHit(i.personalId, i.name, match) ? { ...i, name: nextName } : i
                        ),
                      }
                    : c
                ),
              }
        ),
      }));
    },
    []
  );

  const removePersonalItem = useCallback((match: { personalId?: string; name: string }) => {
    setState((s) => ({
      ...s,
      personalItems: s.personalItems.filter((p) => !personalHit(p.id, p.name, match)),
      trips: s.trips.map((trip) =>
        tripStatus(trip) === "done"
          ? trip
          : {
              ...trip,
              categories: trip.categories.map((c) =>
                isPersonalCat(c)
                  ? { ...c, items: c.items.filter((i) => !personalHit(i.personalId, i.name, match)) }
                  : c
              ),
            }
      ),
    }));
  }, []);

  const restoreSnapshot = useCallback(
    (snap: { trips: Trip[]; personalItems: { id: string; name: string }[] }) => {
      setState((s) => ({
        ...s,
        trips: snap.trips,
        personalItems: snap.personalItems,
      }));
    },
    []
  );

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
      renamePersonalItem,
      removePersonalItem,
      restoreSnapshot,
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
      renamePersonalItem,
      removePersonalItem,
      restoreSnapshot,
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
