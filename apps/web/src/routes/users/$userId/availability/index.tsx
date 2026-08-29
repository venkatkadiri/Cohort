import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventBusyIcon from "@mui/icons-material/EventBusy";

import {
  createExceptionFn,
  createRuleFn,
  deleteExceptionFn,
  deleteRuleFn,
  listExceptionsFn,
  listRulesFn,
} from "../../../../server/functions/availability.fn";
import { EmptyState } from "../../../../components/ui";
import { ConfirmDialog, AlertDialog } from "../../../../components/Dialog";
import { StudioDashboardSkeleton } from "../../../../components/skeletons/StudioDashboardSkeleton";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const Route = createFileRoute("/users/$userId/availability/")({
  pendingComponent: StudioDashboardSkeleton,
  loader: async ({ params }) => {
    const hostId = Number(params.userId);
    const [rules, exceptions] = await Promise.all([
      listRulesFn({ data: hostId }),
      listExceptionsFn({ data: hostId }),
    ]);
    return { rules: rules ?? [], exceptions: exceptions ?? [] };
  },
  component: HostAvailabilityPage,
});

function HostAvailabilityPage() {
  const { rules, exceptions } = Route.useLoaderData();
  const { userId } = Route.useParams();
  const router = useRouter();
  const hostId = Number(userId);

  // Form states for rule
  const [ruleWeekday, setRuleWeekday] = useState(1); // Monday
  const [ruleStart, setRuleStart] = useState("09:00");
  const [ruleEnd, setRuleEnd] = useState("17:00");
  const [ruleError, setRuleError] = useState<string | null>(null);
  const [ruleBusy, setRuleBusy] = useState(false);

  // Form states for exception
  const [exDate, setExDate] = useState("");
  const [exType, setExType] = useState<"BLOCK_FULL_DAY" | "BLOCK_PARTIAL" | "ADD_AVAILABLE_WINDOW">("BLOCK_FULL_DAY");
  const [exStart, setExStart] = useState("09:00");
  const [exEnd, setExEnd] = useState("12:00");
  const [exReason, setExReason] = useState("");
  const [exError, setExError] = useState<string | null>(null);
  const [exBusy, setExBusy] = useState(false);

  // Dialog states
  const [deleteRuleTarget, setDeleteRuleTarget] = useState<number | null>(null);
  const [deleteExTarget, setDeleteExTarget] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "info" | "success" | "error";
  }>({ isOpen: false, message: "" });

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    setRuleError(null);
    setRuleBusy(true);
    try {
      await createRuleFn({
        data: {
          userId: hostId,
          body: {
            weekday: Number(ruleWeekday),
            startTime: ruleStart,
            endTime: ruleEnd,
            isActive: true,
            timezone: "UTC",
          },
        },
      });
      await router.invalidate();
    } catch (err) {
      setRuleError(err instanceof Error ? err.message : "Failed to add availability rule");
    } finally {
      setRuleBusy(false);
    }
  }

  async function confirmDeleteRule() {
    if (!deleteRuleTarget) return;
    setDeleteBusy(true);
    try {
      await deleteRuleFn({ data: { userId: hostId, id: deleteRuleTarget } });
      setDeleteRuleTarget(null);
      await router.invalidate();
    } catch (err) {
      setDeleteRuleTarget(null);
      setAlertDialog({
        isOpen: true,
        title: "Delete Rule Failed",
        message: err instanceof Error ? err.message : "Failed to delete rule",
        type: "error",
      });
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleAddException(e: React.FormEvent) {
    e.preventDefault();
    setExError(null);
    setExBusy(true);
    try {
      await createExceptionFn({
        data: {
          userId: hostId,
          body: {
            date: exDate,
            type: exType,
            startTime: exType !== "BLOCK_FULL_DAY" ? exStart : undefined,
            endTime: exType !== "BLOCK_FULL_DAY" ? exEnd : undefined,
            reason: exReason || undefined,
            timezone: "UTC",
          },
        },
      });
      setExDate("");
      setExReason("");
      await router.invalidate();
    } catch (err) {
      setExError(err instanceof Error ? err.message : "Failed to add date override");
    } finally {
      setExBusy(false);
    }
  }

  async function confirmDeleteException() {
    if (!deleteExTarget) return;
    setDeleteBusy(true);
    try {
      await deleteExceptionFn({ data: { userId: hostId, id: deleteExTarget } });
      setDeleteExTarget(null);
      await router.invalidate();
    } catch (err) {
      setDeleteExTarget(null);
      setAlertDialog({
        isOpen: true,
        title: "Delete Override Failed",
        message: err instanceof Error ? err.message : "Failed to delete date override",
        type: "error",
      });
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
            Availability &amp; Working Hours
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Define your standard weekly office hours and specific date overrides.
          </Typography>
        </Box>

        <Grid container spacing={3.5} sx={{ alignItems: "flex-start" }}>
          {/* Weekly Working Hours */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={3}>
              <Card
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                  borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5 }}>
                  Add Weekly Hours
                </Typography>

                {ruleError ? (
                  <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }} onClose={() => setRuleError(null)}>
                    {ruleError}
                  </Alert>
                ) : null}

                <Box component="form" onSubmit={handleAddRule} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    select
                    label="Day of Week"
                    fullWidth
                    size="small"
                    value={ruleWeekday}
                    onChange={(e) => setRuleWeekday(Number(e.target.value))}
                  >
                    {WEEKDAYS.map((day, idx) => (
                      <MenuItem key={day} value={idx}>
                        {day}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label="Start Time"
                        type="time"
                        fullWidth
                        size="small"
                        value={ruleStart}
                        onChange={(e) => setRuleStart(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label="End Time"
                        type="time"
                        fullWidth
                        size="small"
                        value={ruleEnd}
                        onChange={(e) => setRuleEnd(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={ruleBusy}
                    startIcon={<AddIcon />}
                    sx={{
                      fontWeight: 800,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                      mt: 1,
                    }}
                  >
                    Save Weekly Rule
                  </Button>
                </Box>
              </Card>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Active Weekly Rules ({rules.length})
                </Typography>

                {rules.length === 0 ? (
                  <EmptyState
                    title="No weekly hours defined"
                    description="Add the days and hours you are available each week for cohort fellows."
                  />
                ) : (
                  <Stack spacing={1.5}>
                    {rules.map((rule) => (
                      <Card
                        key={rule.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                          borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <AccessTimeIcon sx={{ color: "#FF3E00", fontSize: 20 }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {WEEKDAYS[rule.weekday]}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Fira Code', monospace" }}>
                              {rule.startTime} &ndash; {rule.endTime} ({rule.timezone})
                            </Typography>
                          </Box>
                        </Box>

                        <IconButton size="small" color="error" onClick={() => setDeleteRuleTarget(rule.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Grid>

          {/* Date Overrides & Exceptions */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={3}>
              <Card
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                  borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5 }}>
                  Add Date Override
                </Typography>

                {exError ? (
                  <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }} onClose={() => setExError(null)}>
                    {exError}
                  </Alert>
                ) : null}

                <Box component="form" onSubmit={handleAddException} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Date"
                        type="date"
                        fullWidth
                        size="small"
                        value={exDate}
                        onChange={(e) => setExDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        label="Override Type"
                        fullWidth
                        size="small"
                        value={exType}
                        onChange={(e) => setExType(e.target.value as any)}
                      >
                        <MenuItem value="BLOCK_FULL_DAY">Block Entire Day</MenuItem>
                        <MenuItem value="BLOCK_PARTIAL">Block Partial Window</MenuItem>
                        <MenuItem value="ADD_AVAILABLE_WINDOW">Add Extra Window</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>

                  {exType !== "BLOCK_FULL_DAY" ? (
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          label="Start Time"
                          type="time"
                          fullWidth
                          size="small"
                          value={exStart}
                          onChange={(e) => setExStart(e.target.value)}
                          slotProps={{ inputLabel: { shrink: true } }}
                          required
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          label="End Time"
                          type="time"
                          fullWidth
                          size="small"
                          value={exEnd}
                          onChange={(e) => setExEnd(e.target.value)}
                          slotProps={{ inputLabel: { shrink: true } }}
                          required
                        />
                      </Grid>
                    </Grid>
                  ) : null}

                  <TextField
                    label="Reason (optional)"
                    fullWidth
                    size="small"
                    value={exReason}
                    onChange={(e) => setExReason(e.target.value)}
                    placeholder="Demo Day, Conference, Vacation"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={exBusy}
                    startIcon={<AddIcon />}
                    sx={{
                      fontWeight: 800,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                      mt: 1,
                    }}
                  >
                    Save Date Override
                  </Button>
                </Box>
              </Card>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Active Date Overrides ({exceptions.length})
                </Typography>

                {exceptions.length === 0 ? (
                  <EmptyState
                    title="No date overrides defined"
                    description="Block off specific days or add custom availability for upcoming holidays or conferences."
                  />
                ) : (
                  <Stack spacing={1.5}>
                    {exceptions.map((ex) => (
                      <Card
                        key={ex.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                          borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <EventBusyIcon sx={{ color: "#FF0055", fontSize: 20 }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {ex.date} &middot; {ex.type.replace(/_/g, " ")}
                            </Typography>
                            {ex.reason ? (
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {ex.reason}
                              </Typography>
                            ) : null}
                          </Box>
                        </Box>

                        <IconButton size="small" color="error" onClick={() => setDeleteExTarget(ex.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <ConfirmDialog
          isOpen={deleteRuleTarget !== null}
          title="Delete Availability Rule?"
          description="Are you sure you want to delete this weekly recurring time window?"
          confirmText="Delete Rule"
          cancelText="Cancel"
          variant="danger"
          busy={deleteBusy}
          onConfirm={confirmDeleteRule}
          onClose={() => {
            if (!deleteBusy) setDeleteRuleTarget(null);
          }}
        />

        <ConfirmDialog
          isOpen={deleteExTarget !== null}
          title="Delete Date Override?"
          description="Are you sure you want to remove this specific date override?"
          confirmText="Delete Override"
          cancelText="Cancel"
          variant="danger"
          busy={deleteBusy}
          onConfirm={confirmDeleteException}
          onClose={() => {
            if (!deleteBusy) setDeleteExTarget(null);
          }}
        />

        <AlertDialog
          isOpen={alertDialog.isOpen}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
          onClose={() => setAlertDialog({ isOpen: false, message: "" })}
        />
      </Stack>
    </Container>
  );
}
