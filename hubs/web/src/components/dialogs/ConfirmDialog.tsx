import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'indigo'
  busy?: boolean
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={busy ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, pt: 1 }}>
        <DialogTitle sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: variant === 'danger' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: variant === 'danger' ? '#EF4444' : '#F59E0B',
            }}
          >
            <WarningAmberIcon fontSize="small" />
          </Box>
          <Typography variant="h6" component="span" sx={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
            {title}
          </Typography>
        </DialogTitle>
        <IconButton onClick={onClose} disabled={busy} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {description && (
        <DialogContent sx={{ px: 3, py: 1 }}>
          <DialogContentText sx={{ fontSize: '0.875rem' }}>
            {description}
          </DialogContentText>
        </DialogContent>
      )}

      <DialogActions sx={{ p: 2, pt: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={busy} color="inherit" variant="text" size="small">
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={busy}
          variant="contained"
          color={variant === 'danger' ? 'error' : 'primary'}
          size="small"
        >
          {busy ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
