import { type ReactNode } from "react";
import { AppThemeProvider } from "../theme/ThemeContext";
import { AuthProvider } from "./AuthContext";
import { LoadingProvider } from "./LoadingContext";
import { NavigationProvider } from "./NavigationContext";
import { SearchProvider } from "./SearchContext";
import { NotificationProvider } from "./NotificationContext";
import { ConfigProvider } from "./ConfigContext";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppThemeProvider>
      <ConfigProvider>
        <AuthProvider>
          <LoadingProvider>
            <NavigationProvider>
              <SearchProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </SearchProvider>
            </NavigationProvider>
          </LoadingProvider>
        </AuthProvider>
      </ConfigProvider>
    </AppThemeProvider>
  );
}

export default AppProvider;
