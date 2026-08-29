import { createContext, useContext, useReducer, useMemo, type ReactNode } from "react";

export type SearchCategory = "all" | "mentors" | "tracks" | "sessions" | "docs";

// --- State Types ---
export interface SearchState {
  isOpen: boolean;
  query: string;
  category: SearchCategory;
  selectedIndex: number;
  recentSearches: string[];
}

// --- Action Types ---
export type SearchAction =
  | { type: "OPEN_SEARCH" }
  | { type: "CLOSE_SEARCH" }
  | { type: "TOGGLE_SEARCH" }
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_CATEGORY"; payload: SearchCategory }
  | { type: "SET_SELECTED_INDEX"; payload: number }
  | { type: "CLEAR_SEARCH" }
  | { type: "ADD_RECENT_SEARCH"; payload: string };

// --- Initial State ---
const initialSearchState: SearchState = {
  isOpen: false,
  query: "",
  category: "all",
  selectedIndex: 0,
  recentSearches: ["System Design", "Next.js 15", "Kubernetes", "Temporal"],
};

// --- Reducer ---
function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "OPEN_SEARCH":
      return {
        ...state,
        isOpen: true,
        query: "",
        selectedIndex: 0,
      };

    case "CLOSE_SEARCH":
      return {
        ...state,
        isOpen: false,
      };

    case "TOGGLE_SEARCH":
      return {
        ...state,
        isOpen: !state.isOpen,
        query: !state.isOpen ? "" : state.query,
      };

    case "SET_QUERY":
      return {
        ...state,
        query: action.payload,
        selectedIndex: 0,
      };

    case "SET_CATEGORY":
      return {
        ...state,
        category: action.payload,
        selectedIndex: 0,
      };

    case "SET_SELECTED_INDEX":
      return {
        ...state,
        selectedIndex: action.payload,
      };

    case "CLEAR_SEARCH":
      return {
        ...state,
        query: "",
        selectedIndex: 0,
      };

    case "ADD_RECENT_SEARCH": {
      const filtered = state.recentSearches.filter((item) => item !== action.payload);
      return {
        ...state,
        recentSearches: [action.payload, ...filtered].slice(0, 5),
      };
    }

    default:
      return state;
  }
}

// --- Context Value ---
export interface SearchContextValue {
  state: SearchState;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  setQuery: (query: string) => void;
  setCategory: (category: SearchCategory) => void;
  setSelectedIndex: (index: number) => void;
  clearSearch: () => void;
  addRecentSearch: (query: string) => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialSearchState);

  const value = useMemo<SearchContextValue>(() => {
    return {
      state,
      openSearch: () => dispatch({ type: "OPEN_SEARCH" }),
      closeSearch: () => dispatch({ type: "CLOSE_SEARCH" }),
      toggleSearch: () => dispatch({ type: "TOGGLE_SEARCH" }),
      setQuery: (query: string) => dispatch({ type: "SET_QUERY", payload: query }),
      setCategory: (category: SearchCategory) =>
        dispatch({ type: "SET_CATEGORY", payload: category }),
      setSelectedIndex: (index: number) =>
        dispatch({ type: "SET_SELECTED_INDEX", payload: index }),
      clearSearch: () => dispatch({ type: "CLEAR_SEARCH" }),
      addRecentSearch: (query: string) =>
        dispatch({ type: "ADD_RECENT_SEARCH", payload: query }),
    };
  }, [state]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
