import { type ReactNode } from "react";
import { AppThemeProvider } from "../theme/ThemeContext";
import { AuthProvider } from "./AuthContext";
import { LoadingProvider } from "./LoadingContext";
import { NavigationProvider } from "./NavigationContext";
import { SearchProvider } from "./SearchContext";
import { NotificationProvider } from "./NotificationContext";
import { ConfigProvider } from "./ConfigContext";
import { CreditProvider } from "./CreditContext";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppThemeProvider>
      <ConfigProvider>
        <AuthProvider>
          <CreditProvider>
            <LoadingProvider>
              <NavigationProvider>
                <SearchProvider>
                  <NotificationProvider>{children}</NotificationProvider>
                </SearchProvider>
              </NavigationProvider>
            </LoadingProvider>
          </CreditProvider>
        </AuthProvider>
      </ConfigProvider>
    </AppThemeProvider>
  );
}

export default AppProvider;
