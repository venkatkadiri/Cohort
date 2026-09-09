import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import CircularProgress from '@mui/material/CircularProgress'
import type { Theme } from '@mui/material/styles'

import LocalActivityIcon from '@mui/icons-material/LocalActivity'
import BoltIcon from '@mui/icons-material/Bolt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import LockIcon from '@mui/icons-material/Lock'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

import { useCredits } from '../../context'
import { CreditProgressBar } from '../../components/CreditProgressBar'

export const Route = createFileRoute('/credits/buy')({
  component: BuyCreditsPage,
})

interface CreditPackage {
  id: string
  title: string
  credits: number
  bonusXp: number
  price: number
  originalPrice?: number
  badge?: string
  badgeColor?: string
  features: string[]
  isFeatured?: boolean
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pack-single',
    title: 'Fellow Single Drop',
    credits: 1,
    bonusXp: 25,
    price: 19,
    features: [
      '1x 1:1 Mentor Office Hour Booking',
      '+25 Bonus EXP Credits',
      'Instant Google Meet Dispatch',
      'No Expiration Date',
    ],
  },
  {
    id: 'pack-sprint',
    title: 'Sprint 3-Pack',
    credits: 3,
    bonusXp: 100,
    price: 49,
    originalPrice: 57,
    badge: 'POPULAR 🔥',
    badgeColor: '#FF3E00',
    isFeatured: true,
    features: [
      '3x 1:1 Mentor Office Hour Bookings ($16.33/session)',
      '+100 Bonus EXP Credits',
      'Priority Mentor Drop Alerts',
      'Unlock "Sprint Achiever" Accolade',
      'No Expiration Date',
    ],
  },
  {
    id: 'pack-fellowship',
    title: 'Fellowship Pro Bundle',
    credits: 8,
    bonusXp: 350,
    price: 119,
    originalPrice: 152,
    badge: 'BEST VALUE ⭐',
    badgeColor: '#F59E0B',
    features: [
      '8x 1:1 Mentor Office Hour Bookings ($14.87/session)',
      '+350 Bonus EXP Credits (Fast Level-Up)',
      'Immediate Access to VIP Booking Windows',
      'Unlock Rare "Fellowship Patron" Badge',
      'Full Session Recording Vault Access',
    ],
  },
  {
    id: 'pack-season-pass',
    title: 'Masterclass Season Pass',
    credits: 20,
    bonusXp: 1000,
    price: 249,
    originalPrice: 380,
    badge: 'ALL-ACCESS 👑',
    badgeColor: '#9333EA',
    features: [
      '20x 1:1 Mentor Office Hour Bookings ($12.45/session)',
      '+1,000 Bonus EXP Credits (Instant Multi-Level Surge)',
      'Blackout & Custom Timing Exemption',
      'Unlock Epic "Masterclass Sponsor" Badge',
      'Direct Private Slack Channel Access',
    ],
  },
]

const XP_BOOST_PACKAGES = [
  {
    id: 'boost-500',
    title: '500 EXP Flash Booster',
    xp: 500,
    price: 9,
    desc: 'Instant boost to fast-track your next level promotion and unlock system badges.',
  },
  {
    id: 'boost-1500',
    title: '1,500 EXP Overdrive Pack',
    xp: 1500,
    price: 24,
    desc: 'Surge through multiple fellowship ranks with +1,500 EXP points.',
  },
]

function BuyCreditsPage() {
  const { buyCohortCredits } = useCredits()

  const [selectedPack, setSelectedPack] = useState<CreditPackage | null>(null)
  const [selectedBoost, setSelectedBoost] = useState<{ id: string; title: string; xp: number; price: number } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY'>('CARD')
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  const handleOpenCheckout = (pkg: CreditPackage) => {
    setSelectedBoost(null)
    setSelectedPack(pkg)
  }

  const handleOpenBoostCheckout = (boost: { id: string; title: string; xp: number; price: number }) => {
    setSelectedPack(null)
    setSelectedBoost(boost)
  }

  const handleCloseModal = () => {
    if (isProcessing) return
    setSelectedPack(null)
    setSelectedBoost(null)
    setPurchaseSuccess(false)
  }

  const handleExecutePayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      if (selectedPack) {
        buyCohortCredits(selectedPack.credits, selectedPack.bonusXp, selectedPack.title)
      } else if (selectedBoost) {
        buyCohortCredits(0, selectedBoost.xp, selectedBoost.title)
      }
      setIsProcessing(false)
      setPurchaseSuccess(true)
      setTimeout(() => {
        handleCloseModal()
      }, 1500)
    }, 1200)
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={4}>
        {/* Navigation & Header */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Link to="/enrollers" style={{ textDecoration: 'none' }}>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<ArrowBackIcon />}
                  sx={{ color: 'text.secondary', fontWeight: 700 }}
                >
                  Fellows Hub
                </Button>
              </Link>
              <Link to="/leaderboard" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EmojiEventsIcon sx={{ color: '#FF3E00' }} />}
                  sx={{
                    fontWeight: 800,
                    borderRadius: 2,
                    borderColor: 'divider',
                    fontSize: '0.72rem',
                  }}
                >
                  Live Leaderboard
                </Button>
              </Link>
            </Stack>

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
              // COHORT_STORE_&amp;_CREDIT_VAULT
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              Buy Cohort Booking Credits 🎟️
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 800 }}>
              Top up 1:1 office hours passes with verified mentors or accelerate your fellowship standing with EXP overdrive boosters.
            </Typography>
          </Box>
        </Box>

        {/* Live Student Credit Balance Bar */}
        <CreditProgressBar />

        {/* Section 1: Cohort Booking Credits Packages */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                1:1 Mentor Office Hours Credit Bundles
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                1 Cohort Credit unlocks 1 full 1:1 video mentoring session with any instructor.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {CREDIT_PACKAGES.map((pkg) => (
              <Grid key={pkg.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: (theme) =>
                      pkg.isFeatured
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(255, 62, 0, 0.08)'
                          : '#FFF6F3'
                        : theme.palette.mode === 'dark'
                        ? '#181F2A'
                        : '#FFFFFF',
                    borderColor: pkg.isFeatured
                      ? '#FF3E00'
                      : (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'),
                    boxShadow: pkg.isFeatured
                      ? '0 0 24px rgba(255, 62, 0, 0.25)'
                      : '0 4px 12px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#FF3E00',
                    },
                  }}
                >
                  {pkg.badge && (
                    <Chip
                      size="small"
                      label={pkg.badge}
                      sx={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        fontWeight: 900,
                        fontSize: '0.62rem',
                        height: 20,
                        color: pkg.badgeColor || '#FF3E00',
                        bgcolor: `${pkg.badgeColor || '#FF3E00'}18`,
                        border: `1px solid ${pkg.badgeColor || '#FF3E00'}50`,
                        fontFamily: "'Fira Code', monospace",
                      }}
                    />
                  )}

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5 }}>
                      {pkg.title}
                    </Typography>

                    {/* Price and Credit Pill */}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 1.5 }}>
                      <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: "'Fira Code', monospace" }}>
                        ${pkg.price}
                      </Typography>
                      {pkg.originalPrice && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            textDecoration: 'line-through',
                            fontFamily: "'Fira Code', monospace",
                          }}
                        >
                          ${pkg.originalPrice}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip
                        icon={<LocalActivityIcon sx={{ fontSize: 16, color: '#06B6D4 !important' }} />}
                        label={`${pkg.credits} Cohort ${pkg.credits === 1 ? 'Credit' : 'Credits'}`}
                        sx={{
                          fontWeight: 900,
                          fontSize: '0.72rem',
                          color: '#06B6D4',
                          bgcolor: 'rgba(6, 182, 212, 0.12)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          fontFamily: "'Fira Code', monospace",
                        }}
                      />
                      {pkg.bonusXp > 0 && (
                        <Chip
                          icon={<BoltIcon sx={{ fontSize: 16, color: '#FF3E00 !important' }} />}
                          label={`+${pkg.bonusXp} XP`}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.65rem',
                            color: '#FF3E00',
                            bgcolor: 'rgba(255, 62, 0, 0.12)',
                            border: '1px solid rgba(255, 62, 0, 0.3)',
                            fontFamily: "'Fira Code', monospace",
                          }}
                        />
                      )}
                    </Box>

                    {/* Feature list */}
                    <Stack spacing={1} sx={{ my: 2 }}>
                      {pkg.features.map((f, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981', mt: 0.2, flexShrink: 0 }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.76rem', lineHeight: 1.3 }}>
                            {f}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleOpenCheckout(pkg)}
                    sx={{
                      fontWeight: 900,
                      borderRadius: 2,
                      py: 1,
                      mt: 2,
                      background: pkg.isFeatured
                        ? 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)'
                        : undefined,
                      boxShadow: pkg.isFeatured ? '0 4px 14px rgba(255, 62, 0, 0.4)' : undefined,
                    }}
                  >
                    Buy {pkg.credits} {pkg.credits === 1 ? 'Credit' : 'Credits'}
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Section 2: EXP Overdrive Boosters */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
            EXP Overdrive Boosters ⚡
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            Skip the grind: Boost your Experience Credits to level up fast and unlock rare accolades.
          </Typography>

          <Grid container spacing={2}>
            {XP_BOOST_PACKAGES.map((boost) => (
              <Grid key={boost.id} size={{ xs: 12, sm: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
                    borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <BoltIcon sx={{ color: '#FF3E00' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        {boost.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {boost.desc}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'Fira Code', monospace", mb: 0.5 }}>
                      ${boost.price}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenBoostCheckout(boost)}
                      sx={{
                        fontWeight: 800,
                        borderRadius: 2,
                        borderColor: '#FF3E00',
                        color: '#FF3E00',
                        '&:hover': { bgcolor: 'rgba(255, 62, 0, 0.08)', borderColor: '#FF3E00' },
                      }}
                    >
                      Instant Boost
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FAQ & Student Guarantee Accordions */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
            Frequently Asked Questions &amp; Student Guarantees
          </Typography>

          <Stack spacing={1.5}>
            <Accordion
              variant="outlined"
              sx={{
                borderRadius: '12px !important',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
                borderColor: 'divider',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Do purchased Cohort Credits expire?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No, Cohort Credits never expire. They remain in your account indefinitely and can be redeemed whenever your target instructors publish open office hour slots.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              variant="outlined"
              sx={{
                borderRadius: '12px !important',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
                borderColor: 'divider',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Can I convert video study EXP into booking credits instead of paying?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Yes! The platform features a built-in token economy. As you watch masterclasses, you earn Experience Credits (EXP). Every time you reach the teacher conversion threshold (e.g. 50 EXP), you automatically mint 1 free Cohort Booking Pass.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              variant="outlined"
              sx={{
                borderRadius: '12px !important',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
                borderColor: 'divider',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  What happens if a mentor cancels an office hour session?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  If a mentor reschedules or cancels a confirmed booking, your Cohort Credit is immediately refunded to your account balance with zero penalty.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>
      </Stack>

      {/* Simulated Checkout Dialog */}
      <Dialog
        open={Boolean(selectedPack || selectedBoost)}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              bgcolor: (theme: Theme) => (theme.palette.mode === 'dark' ? '#121822' : '#FFFFFF'),
              border: '1px solid',
              borderColor: (theme: Theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 62, 0, 0.3)' : '#DDE2E7'),
            },
          },
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          {purchaseSuccess ? (
            <Stack spacing={2} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Payment Confirmed!
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Your Cohort Credits &amp; EXP points have been credited to your fellow balance!
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Checkout &amp; Top-Up
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10B981' }}>
                  <LockIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>
                    256-Bit Encrypted
                  </Typography>
                </Box>
              </Box>

              {/* Order Summary Box */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0E1217' : '#F8FAFC'),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {selectedPack ? selectedPack.title : selectedBoost?.title}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, fontFamily: "'Fira Code', monospace" }}>
                    ${selectedPack ? selectedPack.price : selectedBoost?.price}.00
                  </Typography>
                </Box>

                {selectedPack && (
                  <Typography variant="caption" sx={{ color: '#06B6D4', fontWeight: 800, display: 'block' }}>
                    +{selectedPack.credits} Cohort Passes · +{selectedPack.bonusXp} EXP Included
                  </Typography>
                )}
                {selectedBoost && (
                  <Typography variant="caption" sx={{ color: '#FF3E00', fontWeight: 800, display: 'block' }}>
                    +{selectedBoost.xp} EXP Overdrive Points
                  </Typography>
                )}
              </Box>

              {/* Payment Method Selector */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1 }}>
                  Select Payment Method:
                </Typography>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: paymentMethod === 'CARD' ? '#FF3E00' : 'divider',
                      mb: 1,
                      cursor: 'pointer',
                    }}
                  >
                    <FormControlLabel
                      value="CARD"
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCardIcon sx={{ fontSize: 18 }} />
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>Credit / Debit Card</Typography>
                        </Box>
                      }
                    />
                  </Box>

                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: paymentMethod === 'APPLE_PAY' ? '#FF3E00' : 'divider',
                      cursor: 'pointer',
                    }}
                  >
                    <FormControlLabel
                      value="APPLE_PAY"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2" sx={{ fontWeight: 800 }}>Apple Pay / Google Pay</Typography>}
                    />
                  </Box>
                </RadioGroup>
              </Box>

              {paymentMethod === 'CARD' && (
                <Stack spacing={1.5}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Card Number"
                    defaultValue="4242 •••• •••• 4242"
                    disabled={isProcessing}
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <TextField size="small" label="MM / YY" defaultValue="12/28" disabled={isProcessing} />
                    <TextField size="small" label="CVC" defaultValue="982" disabled={isProcessing} />
                  </Box>
                </Stack>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
                <Button variant="outlined" fullWidth onClick={handleCloseModal} disabled={isProcessing} sx={{ borderRadius: 2 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                    color: '#FFFFFF',
                  }}
                >
                  {isProcessing ? (
                    <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                  ) : (
                    `Pay $${selectedPack ? selectedPack.price : selectedBoost?.price}.00`
                  )}
                </Button>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  )
}
