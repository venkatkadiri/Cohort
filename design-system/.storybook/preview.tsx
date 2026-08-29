import React from "react";
import type { Preview } from "@storybook/react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import "../src/styles/theme.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FF3E00",
      light: "#FF6B00",
      dark: "#D93200",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#252F40",
      contrastText: "#F6F1D7",
    },
    background: {
      default: "#0E1217",
      paper: "#181F2A",
    },
    text: {
      primary: "#F6F1D7",
      secondary: "#9BA8BA",
    },
    divider: "rgba(246, 241, 215, 0.1)",
  },
  typography: {
    fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
  },
  shape: {
    borderRadius: 14,
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#FF3E00",
      light: "#FF5722",
      dark: "#D93200",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#E9ECEF",
      contrastText: "#0E1217",
    },
    background: {
      default: "#F4F6F8",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0E1217",
      secondary: "#4B5563",
    },
    divider: "#DDE2E7",
  },
  typography: {
    fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
  },
  shape: {
    borderRadius: 14,
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0E1217" },
        { name: "light", value: "#F4F6F8" },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "dark",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Fireship Light Mode (High Contrast)", icon: "sun" },
          { value: "dark", title: "Fireship Dark Mode", icon: "moon" },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const mode = context.globals.theme || "dark";
      const activeTheme = mode === "dark" ? darkTheme : lightTheme;

      React.useEffect(() => {
        document.documentElement.setAttribute("data-theme", mode);
        if (mode === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }, [mode]);

      return (
        <ThemeProvider theme={activeTheme}>
          <CssBaseline />
          <div style={{ padding: "24px", minHeight: "100vh", background: mode === "dark" ? "#0E1217" : "#F4F6F8" }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
