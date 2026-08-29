import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Switch from '@mui/material/Switch'
import { styled } from '@mui/material/styles'
import { useConfig, type RoleType, type FeatureKey, FEATURE_REGISTRY } from '../../context'
import { Card } from '../../components/ui'
import {
  Shield,
  Crown,
  GraduationCap,
  Users,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Film,
  Calendar,
  Bell,
} from 'lucide-react'

export const Route = createFileRoute('/config/')({
  component: ConfigurationHubPage,
})

// Custom Fireship-styled MUI Switch
const FireshipSwitch = styled(Switch)(() => ({
  width: 50,
  height: 28,
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
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 4px 0 rgba(0, 35, 11, 0.2)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 28 / 2,
    opacity: 1,
    backgroundColor: 'var(--line)',
    boxSizing: 'border-box',
    transition: 'background-color 300ms ease',
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

  const roles: { role: RoleType; name: string; icon: any; color: string; desc: string }[] = [
    {
      role: 'ROOT',
      name: 'Root SuperAdmin',
      icon: Crown,
      color: '#F59E0B',
      desc: 'Platform owner with unrestricted infrastructure controls & diagnostic tools.',
    },
    {
      role: 'ADMIN',
      name: 'Cohort Admin',
      icon: Shield,
      color: '#3B82F6',
      desc: 'Community manager managing enrollment cohorts, moderation, and teacher tracks.',
    },
    {
      role: 'TEACHER',
      name: 'Lead Instructor',
      icon: GraduationCap,
      color: '#10B981',
      desc: 'Mentors & instructors managing availability, calendars, and lecture uploads.',
    },
    {
      role: 'STUDENT',
      name: 'Cohort Fellow',
      icon: Users,
      color: '#8B5CF6',
      desc: 'Enrolled students accessing 1:1 office hours, lecture vault, and drop alerts.',
    },
  ]

  const categories = [
    {
      id: 'CORE',
      label: 'Core Platform & Discovery',
      icon: Layers,
      color: '#06B6D4',
      items: FEATURE_REGISTRY.filter((f) => f.category === 'CORE'),
    },
    {
      id: 'VIDEO',
      label: 'Video & Masterclasses',
      icon: Film,
      color: '#FF3E00',
      items: FEATURE_REGISTRY.filter((f) => f.category === 'VIDEO'),
    },
    {
      id: 'SCHEDULING',
      label: 'Scheduling & Office Hours',
      icon: Calendar,
      color: '#3B82F6',
      items: FEATURE_REGISTRY.filter((f) => f.category === 'SCHEDULING'),
    },
    {
      id: 'ENGAGEMENT',
      label: 'Engagement & Alerts',
      icon: Bell,
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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--sea-ink)] pb-24 transition-colors">
      {/* Top Header */}
      <div className="border-b border-[var(--line)] bg-[var(--bg-card)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF3E00] font-bold uppercase tracking-wider mb-2">
                <SlidersHorizontal className="w-4 h-4" />
                Control Plane & Feature Gating
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--sea-ink)] tracking-tight flex items-center gap-3">
                Configuration Hub
              </h1>
              <p className="text-[var(--sea-ink-soft)] text-sm mt-1 max-w-2xl">
                Configure role-based feature flags for Root, Admin, Teachers, and Students. Features dynamically enable and disable across the entire platform in real-time.
              </p>
            </div>

            {/* Quick Actions & Role Simulator */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--line)]">
                <span className="text-xs font-mono text-[var(--sea-ink-soft)] pl-2">Active Simulator:</span>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value as RoleType)}
                  className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--line)] rounded-lg text-xs font-bold text-[#FF3E00] focus:outline-none cursor-pointer"
                >
                  <option value="ROOT">👑 Root</option>
                  <option value="ADMIN">🛡️ Admin</option>
                  <option value="TEACHER">🎓 Teacher</option>
                  <option value="STUDENT">🎒 Student</option>
                </select>
              </div>

              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg-base)] hover:bg-[var(--chip-bg)] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Reset all flags to factory defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {roles.map((r) => {
              const Icon = r.icon
              const isSelected = activeTabRole === r.role
              const isSimulated = currentRole === r.role
              const enabledCount = Object.values(flags[r.role] || {}).filter(Boolean).length

              return (
                <button
                  key={r.role}
                  onClick={() => setActiveTabRole(r.role)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-[var(--bg-card)] border-[#FF3E00] shadow-lg ring-1 ring-[#FF3E00]'
                      : 'bg-[var(--bg-card)] border-[var(--line)] hover:border-[var(--line-strong)]'
                  }`}
                >
                  {isSimulated && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#FF3E00]/15 text-[#FF3E00] font-mono text-[9px] font-bold">
                      ACTIVE
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: r.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--sea-ink)]">{r.name}</div>
                      <div className="text-[10px] font-mono text-[var(--sea-ink-soft)] uppercase tracking-wider">
                        {r.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-[var(--line)]">
                    <span className="text-[var(--sea-ink-soft)]">Features Active</span>
                    <span className="font-bold text-[#FF3E00]">
                      {enabledCount} / {FEATURE_REGISTRY.length}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content: Feature Toggles Matrix */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Role Banner & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--line)] shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: roleMeta.color }}
            >
              <roleMeta.icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--sea-ink)]">
                Configuring Features for: {roleMeta.name}
              </h2>
              <p className="text-xs text-[var(--sea-ink-soft)]">{roleMeta.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setAllForRole(activeTabRole, true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition cursor-pointer border border-emerald-500/20"
            >
              Enable All
            </button>
            <button
              onClick={() => setAllForRole(activeTabRole, false)}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-xs font-bold transition cursor-pointer border border-red-500/20"
            >
              Disable All
            </button>
          </div>
        </div>

        {/* Categories & Switches */}
        <div className="space-y-6">
          {categories.map((cat) => {
            const CatIcon = cat.icon
            return (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--sea-ink)]">
                    {cat.label}
                  </h3>
                  <span className="text-xs font-mono text-[var(--sea-ink-soft)]">({cat.items.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.items.map((feat) => {
                    const isEnabled = !!flags[activeTabRole]?.[feat.key]

                    return (
                      <Card
                        key={feat.key}
                        className={`p-5 bg-[var(--bg-card)] border transition-all flex items-start justify-between gap-4 shadow-sm hover:shadow-md ${
                          isEnabled ? 'border-[var(--line)]' : 'border-dashed border-[var(--line)] opacity-80'
                        }`}
                      >
                        <div className="space-y-1.5 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--sea-ink)]">{feat.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--chip-bg)] text-[var(--sea-ink-soft)]">
                              {feat.key}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--sea-ink-soft)] leading-relaxed">
                            {feat.description}
                          </p>
                        </div>

                        {/* MUI Switch */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <FireshipSwitch
                            checked={isEnabled}
                            onChange={(e) => handleToggle(feat.key, e.target.checked)}
                          />
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              isEnabled ? 'text-[#FF3E00]' : 'text-[var(--sea-ink-muted)]'
                            }`}
                          >
                            {isEnabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating Save Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[#FF3E00] text-[var(--sea-ink)] shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-[#FF3E00]" />
          Feature flag updated & persisted!
        </div>
      )}
    </div>
  )
}
