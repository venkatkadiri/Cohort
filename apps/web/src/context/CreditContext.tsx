import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  tier: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  requiredXp: number
  unlockedAt?: string
  glowColor: string
  bgGradient: string
}

export const ALL_BADGES: Badge[] = [
  {
    id: 'badge-rookie',
    title: 'Hello World Fellow',
    description: 'Earned your first 50 XP in the Cohort Vault.',
    icon: '⚡',
    tier: 'COMMON',
    requiredXp: 50,
    glowColor: '#06B6D4',
    bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
  },
  {
    id: 'badge-async',
    title: 'Async Conqueror',
    description: 'Mastered Event Loop, Libuv, and Promise pipelines (200 XP).',
    icon: '🌀',
    tier: 'COMMON',
    requiredXp: 200,
    glowColor: '#10B981',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
  },
  {
    id: 'badge-consensus',
    title: 'Raft & Paxos Overlord',
    description: 'Completed Distributed Consensus Architecture Track (500 XP).',
    icon: '🛡️',
    tier: 'RARE',
    requiredXp: 500,
    glowColor: '#F59E0B',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.25) 100%)',
  },
  {
    id: 'badge-hls-architect',
    title: 'Adaptive HLS Architect',
    description: 'Engineered multi-bitrate video transcoding pipelines (1,000 XP).',
    icon: '🎥',
    tier: 'EPIC',
    requiredXp: 1000,
    glowColor: '#EC4899',
    bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
  },
  {
    id: 'badge-system-god',
    title: 'Kernel & Distributed Titan',
    description: 'Surpassed 2,500 XP across all advanced engineering tracks.',
    icon: '👑',
    tier: 'LEGENDARY',
    requiredXp: 2500,
    glowColor: '#FF3E00',
    bgGradient: 'linear-gradient(135deg, rgba(255, 62, 0, 0.3) 0%, rgba(255, 0, 85, 0.3) 100%)',
  },
  {
    id: 'badge-streak-fire',
    title: '5-Day Code Rush',
    description: 'Active 5 days streak studying cohort masterclasses.',
    icon: '🔥',
    tier: 'RARE',
    requiredXp: 400,
    glowColor: '#FF3E00',
    bgGradient: 'linear-gradient(135deg, rgba(255, 62, 0, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
  },
  {
    id: 'badge-drop-hunter',
    title: '1:1 Drop Sniper',
    description: 'Booked and completed 3+ mentor office hour slots.',
    icon: '🎯',
    tier: 'EPIC',
    requiredXp: 800,
    glowColor: '#8B5CF6',
    bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
  },
]

export interface DifficultyXpConfig {
  beginner: number
  intermediate: number
  advanced: number
  masterclass: number
}

export interface EconomicsConfig {
  conversionFactor: number // e.g. 50 XP = 1 Cohort Credit
  difficultyXp: DifficultyXpConfig
  watchThresholdPercent: number // e.g. 80%
  streakBonusMultiplier: number // e.g. 1.5x
  dailyXpCap: number // e.g. 1000
}

export interface CelebrationState {
  isOpen: boolean
  xpEarned: number
  reason: string
  videoTitle?: string
  newCohortCredits: number
  levelUp?: { oldLevel: number; newLevel: number }
  unlockedBadge?: Badge
}

export interface WsLeaderboardEvent {
  id: string
  timestamp: string
  studentName: string
  avatar: string
  action: string
  xpEarned: number
  newRank?: number
  badgeUnlocked?: string
  cohortCreditMinted?: boolean
}

export interface CreditContextType {
  xpCredits: number
  cohortCredits: number
  lifetimeXp: number
  level: number
  levelTitle: string
  xpInCurrentLevel: number
  xpNeededForNextLevel: number
  levelProgressPercent: number
  xpToNextCohortCredit: number
  cohortCreditProgressPercent: number
  streakDays: number
  unlockedBadgeIds: string[]
  allBadges: Badge[]
  unlockedBadges: Badge[]
  economicsConfig: EconomicsConfig
  celebration: CelebrationState
  wsEvents: WsLeaderboardEvent[]
  isWsConnected: boolean
  
  // Actions
  earnXp: (amount: number, reason: string, videoTitle?: string, difficulty?: keyof DifficultyXpConfig) => void
  spendCohortCredit: (amount?: number) => boolean
  convertXpToCohort: (amount?: number) => boolean
  buyCohortCredits: (creditsAmount: number, bonusXp?: number, packageName?: string) => void
  updateEconomicsConfig: (newConfig: Partial<EconomicsConfig>) => void
  closeCelebration: () => void
  triggerSimulatedWsEvent: (event: Partial<WsLeaderboardEvent>) => void
}

const DEFAULT_ECONOMICS: EconomicsConfig = {
  conversionFactor: 50, // 50 XP = 1 Cohort Credit
  difficultyXp: {
    beginner: 50,
    intermediate: 100,
    advanced: 200,
    masterclass: 350,
  },
  watchThresholdPercent: 85,
  streakBonusMultiplier: 1.5,
  dailyXpCap: 1000,
}

const LEVEL_TITLES = [
  'Novice Fellow',
  'Code Crafter',
  'Systems Initiate',
  'Async Explorer',
  'Distributed Engineer',
  'Platform Builder',
  'Concurrency Master',
  'Infrastructure Guru',
  'Kernel Overlord',
  'Cohort Legend',
]

const STORAGE_KEYS = {
  XP: 'cohort_student_xp_credits_v1',
  COHORT: 'cohort_student_cohort_credits_v1',
  LIFETIME_XP: 'cohort_student_lifetime_xp_v1',
  BADGES: 'cohort_student_badges_v1',
  ECONOMICS: 'cohort_economics_config_v1',
}

const CreditContext = createContext<CreditContextType | undefined>(undefined)

export function CreditProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with fallback to defaults or localStorage
  const [xpCredits, setXpCredits] = useState<number>(() => {
    if (typeof window === 'undefined') return 120
    const saved = localStorage.getItem(STORAGE_KEYS.XP)
    return saved ? Number(saved) : 120
  })

  const [cohortCredits, setCohortCredits] = useState<number>(() => {
    if (typeof window === 'undefined') return 3
    const saved = localStorage.getItem(STORAGE_KEYS.COHORT)
    return saved ? Number(saved) : 3
  })

  const [lifetimeXp, setLifetimeXp] = useState<number>(() => {
    if (typeof window === 'undefined') return 620
    const saved = localStorage.getItem(STORAGE_KEYS.LIFETIME_XP)
    return saved ? Number(saved) : 620
  })

  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['badge-rookie', 'badge-async', 'badge-streak-fire']
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BADGES)
      return saved ? JSON.parse(saved) : ['badge-rookie', 'badge-async', 'badge-streak-fire']
    } catch {
      return ['badge-rookie', 'badge-async', 'badge-streak-fire']
    }
  })

  const [economicsConfig, setEconomicsConfig] = useState<EconomicsConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_ECONOMICS
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ECONOMICS)
      return saved ? JSON.parse(saved) : DEFAULT_ECONOMICS
    } catch {
      return DEFAULT_ECONOMICS
    }
  })

  const [streakDays] = useState(5)
  const [isWsConnected] = useState(true)
  const [wsEvents, setWsEvents] = useState<WsLeaderboardEvent[]>([
    {
      id: 'ws-init-1',
      timestamp: 'Just now',
      studentName: 'Alex Mercer',
      avatar: 'AM',
      action: 'Completed Raft Protocol Deep Dive',
      xpEarned: 150,
      newRank: 2,
      cohortCreditMinted: true,
    },
    {
      id: 'ws-init-2',
      timestamp: '2m ago',
      studentName: 'Priya Sharma',
      avatar: 'PS',
      action: 'Unlocked Adaptive HLS Architect badge',
      xpEarned: 250,
      badgeUnlocked: 'Adaptive HLS Architect',
    },
  ])

  const [celebration, setCelebration] = useState<CelebrationState>({
    isOpen: false,
    xpEarned: 0,
    reason: '',
    newCohortCredits: 0,
  })

  // Synchronize state with LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.XP, String(xpCredits))
      localStorage.setItem(STORAGE_KEYS.COHORT, String(cohortCredits))
      localStorage.setItem(STORAGE_KEYS.LIFETIME_XP, String(lifetimeXp))
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(unlockedBadgeIds))
      localStorage.setItem(STORAGE_KEYS.ECONOMICS, JSON.stringify(economicsConfig))
    }
  }, [xpCredits, cohortCredits, lifetimeXp, unlockedBadgeIds, economicsConfig])

  // Calculated level and progress
  const LEVEL_STEP_XP = 250
  const level = useMemo(() => Math.floor(lifetimeXp / LEVEL_STEP_XP) + 1, [lifetimeXp])
  const levelTitle = useMemo(() => LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)], [level])
  const xpInCurrentLevel = useMemo(() => lifetimeXp % LEVEL_STEP_XP, [lifetimeXp])
  const xpNeededForNextLevel = LEVEL_STEP_XP
  const levelProgressPercent = useMemo(
    () => Math.min(100, Math.round((xpInCurrentLevel / LEVEL_STEP_XP) * 100)),
    [xpInCurrentLevel]
  )

  // Progress towards next Cohort Credit
  const conversionFactor = economicsConfig.conversionFactor
  const xpTowardsCredit = xpCredits % conversionFactor
  const xpToNextCohortCredit = conversionFactor - xpTowardsCredit
  const cohortCreditProgressPercent = useMemo(
    () => Math.min(100, Math.round((xpTowardsCredit / conversionFactor) * 100)),
    [xpTowardsCredit, conversionFactor]
  )

  const unlockedBadges = useMemo(
    () => ALL_BADGES.filter((b) => unlockedBadgeIds.includes(b.id)),
    [unlockedBadgeIds]
  )

  // Simulated WebSocket feed for Live Leaderboard
  useEffect(() => {
    const MOCK_NAMES = [
      { name: 'Alex Mercer', avatar: 'AM' },
      { name: 'Priya Sharma', avatar: 'PS' },
      { name: 'Marcus Vance', avatar: 'MV' },
      { name: 'Elena Rostova', avatar: 'ER' },
      { name: 'Dmitry Kane', avatar: 'DK' },
      { name: 'Kai Takahashi', avatar: 'KT' },
      { name: 'Sara Al-Mansoor', avatar: 'SA' },
      { name: 'Lucas Silva', avatar: 'LS' },
    ]

    const MOCK_ACTIONS = [
      { action: 'completed Raft Protocol Transcode chunking', xp: 100 },
      { action: 'mastered Libuv Event Loop profiling', xp: 75 },
      { action: 'finished Distributed Consensus Masterclass', xp: 200 },
      { action: 'converted 50 XP to 1 Cohort Booking Credit', xp: 0, minted: true },
      { action: 'cleared Temporal Microservices fanout', xp: 150 },
      { action: 'achieved 7-Day Masterclass Study Streak', xp: 120 },
    ]

    const interval = setInterval(() => {
      const student = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]
      const item = MOCK_ACTIONS[Math.floor(Math.random() * MOCK_ACTIONS.length)]

      const newWsEvent: WsLeaderboardEvent = {
        id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: 'Just now',
        studentName: student.name,
        avatar: student.avatar,
        action: item.action,
        xpEarned: item.xp,
        cohortCreditMinted: item.minted,
      }

      setWsEvents((prev) => [newWsEvent, ...prev.slice(0, 19)])
    }, 4500)

    return () => clearInterval(interval)
  }, [])

  const triggerSimulatedWsEvent = useCallback((event: Partial<WsLeaderboardEvent>) => {
    const fullEvent: WsLeaderboardEvent = {
      id: `ws-user-${Date.now()}`,
      timestamp: 'Just now',
      studentName: event.studentName || 'You (Cohort Fellow)',
      avatar: event.avatar || 'ME',
      action: event.action || 'Earned XP',
      xpEarned: event.xpEarned || 50,
      cohortCreditMinted: event.cohortCreditMinted,
      badgeUnlocked: event.badgeUnlocked,
      newRank: event.newRank,
    }
    setWsEvents((prev) => [fullEvent, ...prev.slice(0, 19)])
  }, [])

  // Core action: Earn XP
  const earnXp = useCallback(
    (amount: number, reason: string, videoTitle?: string, difficulty?: keyof DifficultyXpConfig) => {
      let finalAmount = amount
      if (difficulty && economicsConfig.difficultyXp[difficulty]) {
        finalAmount = economicsConfig.difficultyXp[difficulty]
      }

      const prevXp = xpCredits
      const newXp = prevXp + finalAmount
      const prevLifetime = lifetimeXp
      const newLifetime = prevLifetime + finalAmount

      // Check for auto-minted Cohort Credits
      const prevCreditsCount = Math.floor(prevXp / conversionFactor)
      const newCreditsCount = Math.floor(newXp / conversionFactor)
      const mintedCohortCredits = Math.max(0, newCreditsCount - prevCreditsCount)

      // Check for Level Up
      const oldLvl = Math.floor(prevLifetime / LEVEL_STEP_XP) + 1
      const newLvl = Math.floor(newLifetime / LEVEL_STEP_XP) + 1
      const levelUp = newLvl > oldLvl ? { oldLevel: oldLvl, newLevel: newLvl } : undefined

      // Check for newly unlocked Badges
      let newlyUnlockedBadge: Badge | undefined
      const newBadgeList = [...unlockedBadgeIds]

      for (const badge of ALL_BADGES) {
        if (!newBadgeList.includes(badge.id) && newLifetime >= badge.requiredXp) {
          newBadgeList.push(badge.id)
          newlyUnlockedBadge = badge
        }
      }

      // Update state
      setXpCredits(newXp)
      setLifetimeXp(newLifetime)
      if (mintedCohortCredits > 0) {
        setCohortCredits((prev) => prev + mintedCohortCredits)
      }
      if (newBadgeList.length > unlockedBadgeIds.length) {
        setUnlockedBadgeIds(newBadgeList)
      }

      // Trigger Celebration Dialog / In-Your-Face modal
      setCelebration({
        isOpen: true,
        xpEarned: finalAmount,
        reason,
        videoTitle,
        newCohortCredits: mintedCohortCredits,
        levelUp,
        unlockedBadge: newlyUnlockedBadge,
      })

      // Push to WebSocket feed
      triggerSimulatedWsEvent({
        studentName: 'You (Cohort Fellow)',
        avatar: 'ME',
        action: `Watched ${videoTitle || reason}`,
        xpEarned: finalAmount,
        cohortCreditMinted: mintedCohortCredits > 0,
        badgeUnlocked: newlyUnlockedBadge?.title,
      })
    },
    [xpCredits, lifetimeXp, conversionFactor, economicsConfig, unlockedBadgeIds, triggerSimulatedWsEvent]
  )

  const spendCohortCredit = useCallback((amount: number = 1): boolean => {
    if (cohortCredits < amount) {
      return false
    }
    setCohortCredits((prev) => prev - amount)
    triggerSimulatedWsEvent({
      studentName: 'You (Cohort Fellow)',
      avatar: 'ME',
      action: `Redeemed ${amount} Cohort Credit for 1:1 Mentor Office Hours 🎟️`,
      xpEarned: 0,
    })
    return true
  }, [cohortCredits, triggerSimulatedWsEvent])

  const convertXpToCohort = useCallback((amount: number = conversionFactor): boolean => {
    if (xpCredits < amount) {
      return false
    }
    const creditsToMint = Math.floor(amount / conversionFactor)
    if (creditsToMint <= 0) return false

    setXpCredits((prev) => prev - creditsToMint * conversionFactor)
    setCohortCredits((prev) => prev + creditsToMint)

    triggerSimulatedWsEvent({
      studentName: 'You (Cohort Fellow)',
      avatar: 'ME',
      action: `Converted ${creditsToMint * conversionFactor} XP → ${creditsToMint} Cohort Credit! ⚡`,
      xpEarned: 0,
      cohortCreditMinted: true,
    })
    return true
  }, [xpCredits, conversionFactor, triggerSimulatedWsEvent])

  const buyCohortCredits = useCallback(
    (creditsAmount: number, bonusXp: number = 0, packageName: string = 'Cohort Credit Top-Up') => {
      setCohortCredits((prev) => prev + creditsAmount)
      if (bonusXp > 0) {
        setXpCredits((prev) => prev + bonusXp)
        setLifetimeXp((prev) => prev + bonusXp)
      }

      setCelebration({
        isOpen: true,
        xpEarned: bonusXp,
        reason: `Purchased ${packageName} (+${creditsAmount} Cohort Booking Passes)`,
        newCohortCredits: creditsAmount,
      })

      triggerSimulatedWsEvent({
        studentName: 'You (Cohort Fellow)',
        avatar: 'ME',
        action: `Purchased ${packageName} (+${creditsAmount} Credits, +${bonusXp} XP) 💳`,
        xpEarned: bonusXp,
        cohortCreditMinted: true,
      })
    },
    [triggerSimulatedWsEvent]
  )

  const updateEconomicsConfig = useCallback((newConfig: Partial<EconomicsConfig>) => {
    setEconomicsConfig((prev) => ({
      ...prev,
      ...newConfig,
      difficultyXp: {
        ...prev.difficultyXp,
        ...(newConfig.difficultyXp || {}),
      },
    }))
  }, [])

  const closeCelebration = useCallback(() => {
    setCelebration((prev) => ({ ...prev, isOpen: false }))
  }, [])

  return (
    <CreditContext.Provider
      value={{
        xpCredits,
        cohortCredits,
        lifetimeXp,
        level,
        levelTitle,
        xpInCurrentLevel,
        xpNeededForNextLevel,
        levelProgressPercent,
        xpToNextCohortCredit,
        cohortCreditProgressPercent,
        streakDays,
        unlockedBadgeIds,
        allBadges: ALL_BADGES,
        unlockedBadges,
        economicsConfig,
        celebration,
        wsEvents,
        isWsConnected,
        earnXp,
        spendCohortCredit,
        convertXpToCohort,
        buyCohortCredits,
        updateEconomicsConfig,
        closeCelebration,
        triggerSimulatedWsEvent,
      }}
    >
      {children}
    </CreditContext.Provider>
  )
}

export function useCredits() {
  const context = useContext(CreditContext)
  if (!context) {
    throw new Error('useCredits must be used within a CreditProvider')
  }
  return context
}
