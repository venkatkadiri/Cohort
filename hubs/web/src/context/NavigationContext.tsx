import { createContext, useContext, useReducer, useMemo, type ReactNode } from "react";

// --- State Types ---
export interface NavigationState {
  isDrawerOpen: boolean;
  activeSectionId: string;
  pinnedFavorites: string[];
}

// --- Action Types ---
export type NavigationAction =
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "TOGGLE_DRAWER" }
  | { type: "SET_ACTIVE_SECTION"; payload: string }
  | { type: "TOGGLE_PIN"; payload: string };

const initialNavState: NavigationState = {
  isDrawerOpen: false,
  activeSectionId: "hub",
  pinnedFavorites: ["Cohort Hub", "Lead Studio", "Slot Requests", "Calendar Schedule"],
};

// --- Reducer ---
function navigationReducer(
  state: NavigationState,
  action: NavigationAction
): NavigationState {
  switch (action.type) {
    case "OPEN_DRAWER":
      return { ...state, isDrawerOpen: true };

    case "CLOSE_DRAWER":
      return { ...state, isDrawerOpen: false };

    case "TOGGLE_DRAWER":
      return { ...state, isDrawerOpen: !state.isDrawerOpen };

    case "SET_ACTIVE_SECTION":
      return { ...state, activeSectionId: action.payload };

    case "TOGGLE_PIN": {
      const exists = state.pinnedFavorites.includes(action.payload);
      return {
        ...state,
        pinnedFavorites: exists
          ? state.pinnedFavorites.filter((f) => f !== action.payload)
          : [...state.pinnedFavorites, action.payload],
      };
    }

    default:
      return state;
  }
}

// --- Context Value ---
export interface NavigationContextValue {
  state: NavigationState;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setActiveSection: (id: string) => void;
  togglePin: (label: string) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(navigationReducer, initialNavState);

  const value = useMemo<NavigationContextValue>(() => {
    return {
      state,
      openDrawer: () => dispatch({ type: "OPEN_DRAWER" }),
      closeDrawer: () => dispatch({ type: "CLOSE_DRAWER" }),
      toggleDrawer: () => dispatch({ type: "TOGGLE_DRAWER" }),
      setActiveSection: (id: string) =>
        dispatch({ type: "SET_ACTIVE_SECTION", payload: id }),
      togglePin: (label: string) =>
        dispatch({ type: "TOGGLE_PIN", payload: label }),
    };
  }, [state]);

  return (
    <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
