import { createContext, useContext, useReducer, useMemo, type ReactNode } from "react";

// --- State Types ---
export interface LoadingState {
  isGlobalLoading: boolean;
  activeKeys: Record<string, boolean>;
}

// --- Action Types ---
export type LoadingAction =
  | { type: "START_LOADING"; payload: string }
  | { type: "STOP_LOADING"; payload: string }
  | { type: "SET_GLOBAL_LOADING"; payload: boolean }
  | { type: "RESET_ALL_LOADING" };

// --- Initial State ---
const initialLoadingState: LoadingState = {
  isGlobalLoading: false,
  activeKeys: {},
};

// --- Reducer ---
function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case "START_LOADING":
      return {
        ...state,
        activeKeys: {
          ...state.activeKeys,
          [action.payload]: true,
        },
      };

    case "STOP_LOADING": {
      const nextKeys = { ...state.activeKeys };
      delete nextKeys[action.payload];
      return {
        ...state,
        activeKeys: nextKeys,
      };
    }

    case "SET_GLOBAL_LOADING":
      return {
        ...state,
        isGlobalLoading: action.payload,
      };

    case "RESET_ALL_LOADING":
      return initialLoadingState;

    default:
      return state;
  }
}

// --- Context Type ---
export interface LoadingContextValue {
  state: LoadingState;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  setGlobalLoading: (isLoading: boolean) => void;
  resetAllLoading: () => void;
  isLoading: (key?: string) => boolean;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loadingReducer, initialLoadingState);

  const contextValue = useMemo<LoadingContextValue>(() => {
    return {
      state,
      startLoading: (key: string) => dispatch({ type: "START_LOADING", payload: key }),
      stopLoading: (key: string) => dispatch({ type: "STOP_LOADING", payload: key }),
      setGlobalLoading: (isLoading: boolean) =>
        dispatch({ type: "SET_GLOBAL_LOADING", payload: isLoading }),
      resetAllLoading: () => dispatch({ type: "RESET_ALL_LOADING" }),
      isLoading: (key?: string) => {
        if (!key) return state.isGlobalLoading || Object.keys(state.activeKeys).length > 0;
        return Boolean(state.activeKeys[key]);
      },
    };
  }, [state]);

  return <LoadingContext.Provider value={contextValue}>{children}</LoadingContext.Provider>;
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
