import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouter,
  Link,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { XpRewardCelebrationModal } from "../components/XpRewardCelebrationModal";
import { AppProvider } from "../context";
import { getQueryClient } from "../lib/queryClient";

import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('cohort-theme-mode')||window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);root.setAttribute('data-theme',resolved);root.style.colorScheme=resolved;}catch(e){}})();`;

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=5",
      },
      {
        title: "Cohort · Collaborative Mentorship & Office Hours",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: "center" }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 900,
          letterSpacing: "0.15em",
          color: "#FF3E00",
          fontFamily: "'Fira Code', monospace",
          display: "block",
          mb: 1,
        }}
      >
        // 404_PAGE_NOT_FOUND
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: "-0.02em", mb: 1.5 }}>
        Page Not Found
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
        This cohort studio or session track does not exist or has been moved.
      </Typography>
      <Link to="/" style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          sx={{
            fontWeight: 800,
            borderRadius: 2,
            background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
            px: 3,
          }}
        >
          Back to Cohort Hub
        </Button>
      </Link>
    </Container>
  ),
  errorComponent: RootErrorComponent,
});

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: "center" }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 900,
          letterSpacing: "0.15em",
          color: "error.main",
          fontFamily: "'Fira Code', monospace",
          display: "block",
          mb: 1,
        }}
      >
        // 500_SYSTEM_ERROR
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: "-0.02em", mb: 1.5 }}>
        Something Went Wrong
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
        {error instanceof Error ? error.message : "An unexpected error occurred."}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <Button
          onClick={() => {
            reset?.();
            router.invalidate();
          }}
          variant="contained"
          sx={{
            fontWeight: 800,
            borderRadius: 2,
            background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
          }}
        >
          Try Again
        </Button>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button
            variant="outlined"
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Back to Hub
          </Button>
        </Link>
      </Stack>
    </Container>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased selection:bg-red-500/20 selection:text-red-500">
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <Header />
            {children}
            <Footer />
            <XpRewardCelebrationModal />
          </AppProvider>
          {import.meta.env.DEV && (
            <>
              <ReactQueryDevtools initialIsOpen={false} />
              <TanStackDevtools
                config={{
                  position: "bottom-right",
                }}
                plugins={[
                  {
                    name: "Tanstack Router",
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              />
            </>
          )}
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
