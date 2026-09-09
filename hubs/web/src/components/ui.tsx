import * as React from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { createLink, type LinkComponent } from '@tanstack/react-router'
import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import MuiChip from '@mui/material/Chip'
import MuiBox from '@mui/material/Box'
import MuiTypography from '@mui/material/Typography'
import MuiLinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'pro' | 'contained' | 'outlined' | 'text'
  size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', sx, children, ...props }, ref) => {
    let muiVariant: 'contained' | 'outlined' | 'text' = 'contained'
    let muiColor: 'primary' | 'secondary' | 'error' | 'inherit' = 'primary'
    let customSx: any = {}

    if (variant === 'primary' || variant === 'contained') {
      muiVariant = 'contained'
      muiColor = 'primary'
      customSx = {
        background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
        color: '#FFFFFF',
        border: 'none',
        boxShadow: '0 4px 14px rgba(255, 62, 0, 0.25)',
        '&:hover': {
          background: 'linear-gradient(135deg, #FF5722 0%, #FF1744 100%)',
          boxShadow: '0 0 24px rgba(255, 62, 0, 0.45)',
          transform: 'translateY(-1px)',
        },
      }
    } else if (variant === 'secondary' || variant === 'outlined') {
      muiVariant = 'outlined'
      muiColor = 'inherit'
      customSx = {
        bgcolor: (theme: any) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
        borderColor: (theme: any) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
        color: 'text.primary',
        '&:hover': {
          borderColor: '#FF3E00',
          bgcolor: 'rgba(255, 62, 0, 0.08)',
          color: '#FF3E00',
          transform: 'translateY(-1px)',
        },
      }
    } else if (variant === 'ghost' || variant === 'text') {
      muiVariant = 'text'
      muiColor = 'inherit'
      customSx = {
        color: 'text.secondary',
        '&:hover': {
          color: '#FF3E00',
          bgcolor: 'rgba(255, 62, 0, 0.08)',
        },
      }
    } else if (variant === 'danger') {
      muiVariant = 'outlined'
      muiColor = 'error'
      customSx = {
        borderColor: 'rgba(239, 68, 68, 0.4)',
        color: '#EF4444',
        '&:hover': {
          bgcolor: 'rgba(239, 68, 68, 0.12)',
          borderColor: '#EF4444',
          boxShadow: '0 0 16px rgba(239, 68, 68, 0.3)',
        },
      }
    } else if (variant === 'gold' || variant === 'pro') {
      muiVariant = 'contained'
      customSx = {
        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        color: '#000000',
        fontWeight: 800,
        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
        '&:hover': {
          background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
          transform: 'translateY(-1px)',
        },
      }
    }

    const muiSize = size === 'sm' || size === 'small' ? 'small' : size === 'lg' || size === 'large' ? 'large' : 'medium'

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        color={muiColor}
        size={muiSize}
        sx={{
          minHeight: muiSize === 'small' ? 30 : muiSize === 'large' ? 42 : 36,
          px: muiSize === 'small' ? 1.5 : 2,
          py: muiSize === 'small' ? 0.35 : 0.6,
          borderRadius: 2,
          fontWeight: 700,
          letterSpacing: '0.01em',
          textTransform: 'none',
          fontSize: muiSize === 'small' ? '0.74rem' : muiSize === 'large' ? '0.84rem' : '0.8rem',
          transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          ...customSx,
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiButton>
    )
  }
)
Button.displayName = 'Button'

interface BaseLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'pro'
  size?: 'sm' | 'md' | 'lg'
}

const BaseLinkComponent = React.forwardRef<HTMLAnchorElement, BaseLinkProps>(
  ({ variant = 'secondary', size = 'md', className, style, ...props }, ref) => {
    let bg = 'transparent'
    let color = 'inherit'
    let border = '1px solid var(--line)'
    let extraShadow = ''

    if (variant === 'primary') {
      bg = 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)'
      color = '#FFFFFF'
      border = 'none'
      extraShadow = '0 2px 8px rgba(255, 62, 0, 0.25)'
    } else if (variant === 'secondary') {
      bg = 'var(--bg-card)'
      color = 'var(--sea-ink)'
      border = '1px solid var(--line)'
    } else if (variant === 'danger') {
      bg = 'rgba(239, 68, 68, 0.1)'
      color = '#EF4444'
      border = '1px solid rgba(239, 68, 68, 0.3)'
    } else if (variant === 'gold' || variant === 'pro') {
      bg = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
      color = '#000000'
      border = 'none'
    }

    return (
      <a
        ref={ref}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          padding: size === 'sm' ? '5px 11px' : size === 'lg' ? '10px 20px' : '7px 15px',
          fontSize: size === 'sm' ? '0.74rem' : size === 'lg' ? '0.84rem' : '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.01em',
          textDecoration: 'none',
          cursor: 'pointer',
          background: bg,
          color,
          border,
          boxShadow: extraShadow,
          transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          ...style,
        }}
        className={className}
        {...props}
      />
    )
  }
)
BaseLinkComponent.displayName = 'BaseLinkComponent'

export const LinkButton = createLink(BaseLinkComponent) as LinkComponent<typeof BaseLinkComponent>

export function Card({
  className,
  children,
  sx,
  interactive,
  ...props
}: ComponentProps<'div'> & { sx?: any; interactive?: boolean }) {
  return (
    <MuiCard
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2.5,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'),
        backgroundImage: 'none',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark' ? 'none' : '0 2px 8px rgba(14, 18, 23, 0.04)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(interactive && {
          cursor: 'pointer',
          '&:hover': {
            borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 62, 0, 0.55)' : '#FF3E00'),
            transform: 'translateY(-2px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 16px 36px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 62, 0, 0.2)'
                : '0 12px 28px rgba(14, 18, 23, 0.09)',
          },
        }),
        ...sx,
      }}
      className={className}
      {...props}
    >
      {children}
    </MuiCard>
  )
}

export function Badge({
  tone = 'neutral',
  className,
  children,
  sx,
}: {
  tone?: 'flame' | 'pro' | 'cyan' | 'purple' | 'success' | 'warning' | 'danger' | 'neutral' | 'red' | 'gold' | 'info'
  className?: string
  children: ReactNode
  sx?: any
}) {
  let customSx: any = {}

  if (tone === 'flame' || tone === 'red') {
    customSx = {
      bgcolor: 'rgba(255, 62, 0, 0.12)',
      color: '#FF3E00',
      border: '1px solid rgba(255, 62, 0, 0.35)',
    }
  } else if (tone === 'pro' || tone === 'warning' || tone === 'gold') {
    customSx = {
      bgcolor: 'rgba(245, 158, 11, 0.12)',
      color: '#F59E0B',
      border: '1px solid rgba(245, 158, 11, 0.35)',
    }
  } else if (tone === 'cyan' || tone === 'info') {
    customSx = {
      bgcolor: 'rgba(6, 182, 212, 0.12)',
      color: '#06B6D4',
      border: '1px solid rgba(6, 182, 212, 0.35)',
    }
  } else if (tone === 'purple') {
    customSx = {
      bgcolor: 'rgba(139, 92, 246, 0.12)',
      color: '#A78BFA',
      border: '1px solid rgba(139, 92, 246, 0.35)',
    }
  } else if (tone === 'success') {
    customSx = {
      bgcolor: 'rgba(16, 185, 129, 0.12)',
      color: '#10B981',
      border: '1px solid rgba(16, 185, 129, 0.35)',
    }
  } else if (tone === 'danger') {
    customSx = {
      bgcolor: 'rgba(239, 68, 68, 0.12)',
      color: '#EF4444',
      border: '1px solid rgba(239, 68, 68, 0.35)',
    }
  } else {
    customSx = {
      bgcolor: (theme: any) =>
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      color: 'text.secondary',
      border: '1px solid',
      borderColor: 'divider',
    }
  }

  return (
    <MuiChip
      label={children}
      size="small"
      sx={{
        fontFamily: "'Fira Code', ui-monospace, monospace",
        fontWeight: 700,
        fontSize: '0.62rem',
        letterSpacing: '0.01em',
        height: 20,
        borderRadius: 1.2,
        ...customSx,
        ...sx,
      }}
      className={className}
    />
  )
}

export function Label({ className, children, ...props }: ComponentProps<'label'>) {
  return (
    <MuiTypography
      component="label"
      sx={{
        display: 'block',
        mb: 0.5,
        fontSize: '0.7rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: 'text.primary',
        fontFamily: "'Fira Code', monospace",
      }}
      className={className}
      {...props}
    >
      {children}
    </MuiTypography>
  )
}

export function Input({ className, style, ...props }: ComponentProps<'input'>) {
  return (
    <input
      style={{
        width: '100%',
        minHeight: '36px',
        borderRadius: '7px',
        border: '1px solid var(--line)',
        backgroundColor: 'var(--bg-card)',
        padding: '7px 11px',
        fontSize: '13px',
        color: 'var(--sea-ink)',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      className={`focus:border-[#FF3E00] focus:ring-2 focus:ring-[#FF3E00]/20 ${className ?? ''}`}
      {...props}
    />
  )
}

export function Select({ className, style, children, ...props }: ComponentProps<'select'>) {
  return (
    <select
      style={{
        width: '100%',
        minHeight: '36px',
        borderRadius: '7px',
        border: '1px solid var(--line)',
        backgroundColor: 'var(--bg-card)',
        padding: '7px 11px',
        fontSize: '13px',
        color: 'var(--sea-ink)',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      className={`focus:border-[#FF3E00] focus:ring-2 focus:ring-[#FF3E00]/20 ${className ?? ''}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ className, style, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      style={{
        width: '100%',
        borderRadius: '7px',
        border: '1px solid var(--line)',
        backgroundColor: 'var(--bg-card)',
        padding: '7px 11px',
        fontSize: '13px',
        color: 'var(--sea-ink)',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        outline: 'none',
        minHeight: '72px',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      className={`focus:border-[#FF3E00] focus:ring-2 focus:ring-[#FF3E00]/20 ${className ?? ''}`}
      {...props}
    />
  )
}

export function Spinner({ className }: { className?: string }) {
  return <CircularProgress size={16} color="inherit" className={className} sx={{ color: '#FF3E00' }} />
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null
  return (
    <MuiBox
      sx={{
        mb: 1.5,
        borderRadius: 2,
        border: '1px solid rgba(239, 68, 68, 0.4)',
        bgcolor: 'rgba(239, 68, 68, 0.1)',
        p: 1,
        fontSize: '0.72rem',
        fontWeight: 700,
        color: '#EF4444',
        fontFamily: "'Fira Code', monospace",
      }}
    >
      ⚠️ {message}
    </MuiBox>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <MuiBox
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2.5,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
        p: { xs: 2.5, sm: 4 },
        textAlign: 'center',
      }}
    >
      <MuiTypography variant="h6" sx={{ mb: 0.8, letterSpacing: '-0.01em', fontWeight: 800, fontSize: '1.05rem' }}>
        {title}
      </MuiTypography>
      {description ? (
        <MuiTypography
          sx={{
            mb: 3,
            maxWidth: 380,
            fontSize: '0.85rem',
            color: 'text.secondary',
            lineHeight: 1.6,
          }}
        >
          {description}
        </MuiTypography>
      ) : null}
      {action}
    </MuiBox>
  )
}

export function ProgressBar({
  currentStep,
  totalSteps = 3,
  stepsLabels = ['Select Time Slot', 'Topic & Details', 'Confirmed'],
}: {
  currentStep: number
  totalSteps?: number
  stepsLabels?: string[]
}) {
  const progress = (currentStep / totalSteps) * 100
  const currentLabel = stepsLabels[currentStep - 1] || `Step ${currentStep}`

  return (
    <MuiBox sx={{ mb: 3 }}>
      <MuiBox
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 1,
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: 'text.secondary',
          fontFamily: "'Fira Code', monospace",
        }}
      >
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span style={{ color: '#FF3E00' }}>{currentLabel}</span>
      </MuiBox>
      <MuiLinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
            borderRadius: 4,
          },
        }}
      />
    </MuiBox>
  )
}

export function EthicalPrivacyNotice() {
  return (
    <MuiBox
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
      }}
    >
      <VerifiedUserOutlinedIcon sx={{ fontSize: 20, color: '#10B981', mt: 0.2 }} />
      <MuiBox>
        <MuiTypography
          variant="caption"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'block',
            color: 'text.primary',
            fontFamily: "'Fira Code', monospace",
            fontSize: '0.7rem',
          }}
        >
          Secure Booking · Zero Tracking
        </MuiTypography>
        <MuiTypography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
          Private 1:1 scheduling encrypted with auto-generated meeting room link.
        </MuiTypography>
      </MuiBox>
    </MuiBox>
  )
}