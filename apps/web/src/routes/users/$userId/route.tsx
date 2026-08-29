import { createFileRoute, notFound, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import BookmarkAddedOutlinedIcon from "@mui/icons-material/BookmarkAddedOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LanguageIcon from "@mui/icons-material/Language";

import { getUserById } from "../../../server/functions/users.fn";
import { initials } from "../../../lib/format";
import { StudioDashboardSkeleton } from "../../../components/skeletons/StudioDashboardSkeleton";

export const Route = createFileRoute("/users/$userId")({
  pendingComponent: StudioDashboardSkeleton,
  loader: async ({ params }) => {
    const user = await getUserById({ data: Number(params.userId) }).catch(
      () => null,
    );
    if (!user) throw notFound();
    return user;
  },
  component: HostLayout,
});

function HostLayout() {
  const user = Route.useLoaderData();
  const userId = String(user.id);
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;

  const tabs = [
    {
      to: "/users/$userId",
      label: "Overview",
      icon: <DashboardOutlinedIcon fontSize="small" />,
      exact: true,
      pathMatch: `/users/${userId}`,
    },
    {
      to: "/users/$userId/event-types",
      label: "Session Tracks",
      icon: <LayersOutlinedIcon fontSize="small" />,
      exact: false,
      pathMatch: `/users/${userId}/event-types`,
    },
    {
      to: "/users/$userId/availability",
      label: "Availability & Rules",
      icon: <AccessTimeOutlinedIcon fontSize="small" />,
      exact: false,
      pathMatch: `/users/${userId}/availability`,
    },
    {
      to: "/users/$userId/slots",
      label: "Generated Slots",
      icon: <CalendarMonthOutlinedIcon fontSize="small" />,
      exact: false,
      pathMatch: `/users/${userId}/slots`,
    },
    {
      to: "/users/$userId/bookings",
      label: "Bookings",
      icon: <BookmarkAddedOutlinedIcon fontSize="small" />,
      exact: false,
      pathMatch: `/users/${userId}/bookings`,
    },
  ];

  const activeTabIdx = tabs.findIndex((t) =>
    t.exact
      ? currentPath === t.pathMatch || currentPath === `${t.pathMatch}/`
      : currentPath.startsWith(t.pathMatch),
  );

  return (
    <Box sx={{ minHeight: 'calc(100vh - 140px)' }}>
      {/* Studio Header Bar */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', pt: { xs: 2, sm: 2.5 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 1.5, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: { xs: 38, sm: 44 },
                  height: { xs: 38, sm: 44 },
                  background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(255, 62, 0, 0.3)',
                }}
              >
                {initials(user.name)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', sm: '1.45rem' }, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.01em' }}>
                    {user.name}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mt: 0.3, fontWeight: 700, fontFamily: "'Fira Code', monospace", fontSize: '0.68rem' }}>
                  <span>/{user.slug}</span>
                  <span>&middot;</span>
                  <span>{user.email}</span>
                  <span>&middot;</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <LanguageIcon sx={{ fontSize: 13, color: '#FF3E00' }} /> {user.timezone}
                  </span>
                </Typography>
              </Box>
            </Box>

            <Link
              to="/public/$userId"
              params={{ userId }}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="outlined"
                size="small"
                endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
              >
                Public page
              </Button>
            </Link>
          </Box>

          {/* Navigation Tabs */}
          <Tabs
            value={activeTabIdx >= 0 ? activeTabIdx : 0}
            onChange={(_, newIdx) => {
              navigate({ href: tabs[newIdx].pathMatch });
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ minHeight: 38 }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.to}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{
                  minHeight: 38,
                  py: 0.5,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  '& .MuiSvgIcon-root': { fontSize: 16 },
                }}
              />
            ))}
          </Tabs>
        </Container>
      </Box>

      {/* Routed Page Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
