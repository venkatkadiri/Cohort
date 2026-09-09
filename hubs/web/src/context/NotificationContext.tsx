import { createContext, useContext, useReducer, useMemo, type ReactNode } from "react";

export type NotificationCategory = "all" | "unread" | "mentorship" | "system";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  category: "mentorship" | "requests" | "system";
  isRead: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

// --- State Types ---
export interface NotificationState {
  isOpen: boolean;
  notifications: NotificationItem[];
  filter: NotificationCategory;
}

// --- Action Types ---
export type NotificationAction =
  | { type: "OPEN_NOTIFICATIONS" }
  | { type: "CLOSE_NOTIFICATIONS" }
  | { type: "TOGGLE_NOTIFICATIONS" }
  | { type: "SET_FILTER"; payload: NotificationCategory }
  | { type: "MARK_AS_READ"; payload: string }
  | { type: "TOGGLE_READ"; payload: string }
  | { type: "MARK_ALL_AS_READ" }
  | { type: "CLEAR_ALL" }
  | { type: "ADD_NOTIFICATION"; payload: NotificationItem };

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    title: "1:1 Session Confirmed",
    description:
      "Marcus Vance confirmed 'Fullstack Code Review & Architecture' for tomorrow at 2:00 PM (Google Meet room ready).",
    time: "10 mins ago",
    category: "mentorship",
    isRead: false,
    actionLabel: "View Booking",
    actionUrl: "/users/1/bookings",
  },
  {
    id: "n-2",
    title: "Custom Time Slot Requested",
    description:
      "Sarah Chen requested a custom Saturday morning slot for 'Kubernetes Cluster Debugging'.",
    time: "1 hour ago",
    category: "requests",
    isRead: false,
    actionLabel: "Review Request",
    actionUrl: "/teachers/requests",
  },
  {
    id: "n-3",
    title: "System Observability Active",
    description:
      "Distributed tracing & Prometheus structured logging interceptors are operational across BFF and Domain Service.",
    time: "3 hours ago",
    category: "system",
    isRead: true,
    actionLabel: "System Status",
    actionUrl: "/teachers",
  },
  {
    id: "n-4",
    title: "Upcoming Office Hours Reminder",
    description:
      "Your office hours session with Alex Tan starts in 45 minutes. Agenda auto-synced.",
    time: "5 hours ago",
    category: "mentorship",
    isRead: true,
    actionLabel: "Join Room",
    actionUrl: "/public/1",
  },
  {
    id: "n-5",
    title: "New Mentor Published Tracks",
    description:
      "Elena Rostova joined as Lead Mentor and opened 3 new tracks in Distributed Systems.",
    time: "Yesterday",
    category: "mentorship",
    isRead: true,
    actionLabel: "Explore Mentor",
    actionUrl: "/public/1",
  },
];

const initialNotificationState: NotificationState = {
  isOpen: false,
  notifications: INITIAL_NOTIFICATIONS,
  filter: "all",
};

// --- Reducer ---
function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case "OPEN_NOTIFICATIONS":
      return { ...state, isOpen: true };

    case "CLOSE_NOTIFICATIONS":
      return { ...state, isOpen: false };

    case "TOGGLE_NOTIFICATIONS":
      return { ...state, isOpen: !state.isOpen };

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "MARK_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
      };

    case "TOGGLE_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, isRead: !n.isRead } : n
        ),
      };

    case "MARK_ALL_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      };

    case "CLEAR_ALL":
      return {
        ...state,
        notifications: [],
      };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    default:
      return state;
  }
}

// --- Context Value ---
export interface NotificationContextValue {
  state: NotificationState;
  unreadCount: number;
  filteredNotifications: NotificationItem[];
  openNotifications: () => void;
  closeNotifications: () => void;
  toggleNotifications: () => void;
  setFilter: (filter: NotificationCategory) => void;
  markAsRead: (id: string) => void;
  toggleRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (item: NotificationItem) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialNotificationState);

  const unreadCount = useMemo(() => {
    return state.notifications.filter((n) => !n.isRead).length;
  }, [state.notifications]);

  const filteredNotifications = useMemo(() => {
    return state.notifications.filter((n) => {
      if (state.filter === "unread") return !n.isRead;
      if (state.filter === "mentorship") return n.category === "mentorship";
      if (state.filter === "system") return n.category === "system";
      return true;
    });
  }, [state.notifications, state.filter]);

  const value = useMemo<NotificationContextValue>(() => {
    return {
      state,
      unreadCount,
      filteredNotifications,
      openNotifications: () => dispatch({ type: "OPEN_NOTIFICATIONS" }),
      closeNotifications: () => dispatch({ type: "CLOSE_NOTIFICATIONS" }),
      toggleNotifications: () => dispatch({ type: "TOGGLE_NOTIFICATIONS" }),
      setFilter: (filter: NotificationCategory) =>
        dispatch({ type: "SET_FILTER", payload: filter }),
      markAsRead: (id: string) => dispatch({ type: "MARK_AS_READ", payload: id }),
      toggleRead: (id: string) => dispatch({ type: "TOGGLE_READ", payload: id }),
      markAllAsRead: () => dispatch({ type: "MARK_ALL_AS_READ" }),
      clearAll: () => dispatch({ type: "CLEAR_ALL" }),
      addNotification: (item: NotificationItem) =>
        dispatch({ type: "ADD_NOTIFICATION", payload: item }),
    };
  }, [state, unreadCount, filteredNotifications]);

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
