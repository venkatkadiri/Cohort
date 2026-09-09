import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { styled } from '@mui/material/styles'

import TuneIcon from '@mui/icons-material/Tune'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SecurityIcon from '@mui/icons-material/Security'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SchoolIcon from '@mui/icons-material/School'
import PeopleIcon from '@mui/icons-material/People'
import BoltIcon from '@mui/icons-material/Bolt'
import LayersIcon from '@mui/icons-material/Layers'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'

import { useConfig, type RoleType, type FeatureKey, FEATURE_REGISTRY } from '../../context'

export const Route = createFileRoute('/config/')({
  component: ConfigurationHubPage,
})

// Custom Fireship-styled MUI Switch
const FireshipSwitch = styled(Switch)(() => ({
  width: 48,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(22px)',
      color: '#FFFFFF',
      '& + .MuiSwitch-track': {
        backgroundColor: '#FF3E00',
        opacity: 1,
        border: 0,
      },
      '& .MuiSwitch-thumb': {
        boxShadow: '0 0 10px rgba(255, 62, 0, 0.6)',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 22,
    height: 22,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 13,
    opacity: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    boxSizing: 'border-box',
    transition: 'background-color 200ms ease',
  },
}))

function ConfigurationHubPage() {
  const {
    currentRole,
    setCurrentRole,
    flags,
    setFeature,
    setAllForRole,
    resetToDefaults,
  } = useConfig()

  const [activeTabRole, setActiveTabRole] = useState<RoleType>(currentRole)
  const [saveToast, setSaveToast] = useState(false)

  const roles: { role: RoleType; name: string; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      role: 'ROOT',
      name: 'Root SuperAdmin',
      icon: <SecurityIcon sx={{ fontSize: 20 }} />,
      color: '#F59E0B',
      desc: 'Platform owner with unrestricted infrastructure controls & diagnostic tools.',
    },
    {
      role: 'ADMIN',
      name: 'Cohort Admin',
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />,
      color: '#3B82F6',
      desc: 'Community manager managing enrollment cohorts, moderation, and teacher tracks.',
    },
    {
      role: 'TEACHER',
      name: 'Lead Instructor',
      icon: <SchoolIcon sx={{ fontSize: 20 }} />,
      color: '#10B981',
      desc: 'Mentors & instructors managing availability, calendars, and lecture uploads.',
    },
    {
      role: 'STUDENT',
      name: 'Cohort Fellow',
      icon: <PeopleIcon sx={{ fontSize: 20 }} />,
      color: '#8B5CF6',
      desc: 'Enrolled students accessing 1:1 office hours, lecture vault, credit store, and drop alerts.',
    },
  ]

  const categories = [
    {
      id: 'CREDITS_GAMIFICATION',
      label: 'Credits & Token Gamification',
      icon: <BoltIcon sx={{ color: '#FF3E00' }} />,
      color: '#FF3E00',
      items: FEATURE_REGISTRY.filter((f) => f.category === 'CREDITS_GAMIFICATION'),
    },
    {
      id: 'CORE',
      label: 'Core Platform & Discovery',
      icon: <LayersIcon sx={{ color: '#06B6D4' }} />,
      color: '#06B6D4',
      items: FEATURE_REGISTRY.filter((f) => f.category === 'CORE'),
    },
    {
      id: 'VIDEO',
      label: 'Video & Masterclasses',
      icon: <VideoLibraryIcon sx={{ color: '#FF0055' }} />,
      color: '#FF0055',
      items: FEATURE_REGISTRY.filter((f) => f.category === 'VIDEO'),
    },
    {
      id: 'SCHEDULING',
      label: 'Scheduling & Office Hours',
      icon: <CalendarMonthIcon sx={{ color: '#3B82F6' }} />,
      color: '#3B82F6',
      items: FEATURE_REGISTRY.filter((f) => f.category === 'SCHEDULING'),
    },
    {
      id: 'ENGAGEMENT',
      label: 'Engagement & Alerts',
      icon: <NotificationsActiveIcon sx={{ color: '#10B981' }} />,
      color: '#10B981',
      items: FEATURE_REGISTRY.filter((f) => f.category === 'ENGAGEMENT'),
    },
  ]

  const handleToggle = (key: FeatureKey, nextVal: boolean) => {
    setFeature(key, activeTabRole, nextVal)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  const handleReset = () => {
    resetToDefaults()
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  const roleMeta = roles.find((r) => r.role === activeTabRole)!

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={4}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 900,
                letterSpacing: '0.12em',
                color: '#FF3E00',
                fontFamily: "'Fira Code', monospace",
                display: 'block',
                mb: 0.5,
              }}
            >
              // CONTROL_PLANE_FEATURE_GATING
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TuneIcon sx={{ color: '#FF3E00' }} /> Configuration Hub &amp; Role Feature Gating
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 800 }}>
              Configure dynamic role-based feature flags for Root, Admin, Teachers, and Students. Features enable and disable across the entire platform in real time.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="simulator-role-label">Active Role Simulator</InputLabel>
              <Select
                labelId="simulator-role-label"
                value={currentRole}
                label="Active Role Simulator"
                onChange={(e) => setCurrentRole(e.target.value as RoleType)}
                sx={{ borderRadius: 2, fontWeight: 800 }}
              >
                <MenuItem value="ROOT">👑 Root SuperAdmin</MenuItem>
                <MenuItem value="ADMIN">🛡️ Cohort Admin</MenuItem>
                <MenuItem value="TEACHER">👨‍🏫 Lead Instructor</MenuItem>
                <MenuItem value="STUDENT">🎓 Cohort Fellow</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                borderColor: 'divider',
                '&:hover': { borderColor: '#FF3E00', color: '#FF3E00' },
              }}
            >
              Reset Defaults
            </Button>
          </Stack>
        </Box>

        {saveToast && (
          <Alert icon={<CheckCircleIcon fontSize="inherit" />} severity="success" sx={{ borderRadius: 2 }}>
            Configuration state updated and synchronized across all platform services!
          </Alert>
        )}

        {/* Role Selection Tabs Grid */}
        <Grid container spacing={2}>
          {roles.map((r) => {
            const isSelected = activeTabRole === r.role
            const isSimulated = currentRole === r.role

            return (
              <Grid key={r.role} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  variant="outlined"
                  onClick={() => setActiveTabRole(r.role)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderRadius: 2.5,
                    position: 'relative',
                    bgcolor: isSelected
                      ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 62, 0, 0.08)' : '#FFF6F3')
                      : (theme) => (theme.palette.mode === 'dark' ? '#121822' : '#FFFFFF'),
                    borderColor: isSelected
                      ? '#FF3E00'
                      : (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.08)' : '#DDE2E7'),
                    boxShadow: isSelected ? '0 0 16px rgba(255, 62, 0, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#FF3E00',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: r.color }}>
                      {r.icon}
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        {r.name}
                      </Typography>
                    </Box>
                    {isSimulated && (
                      <Chip
                        size="small"
                        label="ACTIVE"
                        sx={{
                          fontSize: '0.6rem',
                          fontWeight: 900,
                          height: 18,
                          bgcolor: '#FF3E00',
                          color: '#FFFFFF',
                          fontFamily: "'Fira Code', monospace",
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.74rem' }}>
                    {r.desc}
                  </Typography>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        {/* Category Feature Toggles Panel */}
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Feature Controls for: <span style={{ color: roleMeta.color }}>{roleMeta.name}</span>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Toggle individual microservices and features for the {roleMeta.name} role.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setAllForRole(activeTabRole, true)}
                sx={{ borderRadius: 2, fontWeight: 800, fontSize: '0.72rem' }}
              >
                Enable All
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setAllForRole(activeTabRole, false)}
                sx={{ borderRadius: 2, fontWeight: 800, fontSize: '0.72rem' }}
              >
                Disable All
              </Button>
            </Stack>
          </Box>

          {categories.map((cat) => (
            <Card
              key={cat.id}
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
                borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
                {cat.icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: cat.color }}>
                  {cat.label}
                </Typography>
                <Chip
                  size="small"
                  label={`${cat.items.filter((i) => !!flags[activeTabRole]?.[i.key]).length}/${cat.items.length} Enabled`}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    height: 20,
                    fontFamily: "'Fira Code', monospace",
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                {cat.items.map((feat) => {
                  const isEnabled = !!flags[activeTabRole]?.[feat.key]

                  return (
                    <Grid key={feat.key} size={{ xs: 12, md: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: (theme) =>
                            isEnabled
                              ? theme.palette.mode === 'dark'
                                ? 'rgba(14, 18, 23, 0.7)'
                                : '#F8FAFC'
                              : theme.palette.mode === 'dark'
                              ? '#0E1217'
                              : '#F1F5F9',
                          border: '1px solid',
                          borderColor: isEnabled ? 'rgba(255, 62, 0, 0.25)' : 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 2,
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: isEnabled ? '#FF3E00' : 'divider',
                          },
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {feat.name}
                            </Typography>
                            {isEnabled && (
                              <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.74rem' }}>
                            {feat.description}
                          </Typography>
                        </Box>

                        <FireshipSwitch
                          checked={isEnabled}
                          onChange={(e) => handleToggle(feat.key, e.target.checked)}
                        />
                      </Box>
                    </Grid>
                  )
                })}
              </Grid>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  )
}
