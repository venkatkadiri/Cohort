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
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

export interface AlertDialogProps {
  isOpen: boolean
  title?: string
  message: string
  type?: 'info' | 'success' | 'error'
  onClose: () => void
}

export function AlertDialog({
  isOpen,
  title,
  message,
  type = 'info',
  onClose,
}: AlertDialogProps) {
  const iconColor =
    type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#FF3E00'
  const iconBg =
    type === 'error'
      ? 'rgba(239, 68, 68, 0.12)'
      : type === 'success'
      ? 'rgba(16, 185, 129, 0.12)'
      : 'rgba(255, 62, 0, 0.12)'

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
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
              bgcolor: iconBg,
              color: iconColor,
            }}
          >
            {type === 'error' ? (
              <WarningAmberIcon fontSize="small" />
            ) : type === 'success' ? (
              <CheckCircleOutlinedIcon fontSize="small" />
            ) : (
              <InfoOutlinedIcon fontSize="small" />
            )}
          </Box>
          <Typography variant="h6" component="span" sx={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
            {title ?? (type === 'error' ? 'Action Required' : type === 'success' ? 'Success' : 'Notice')}
          </Typography>
        </DialogTitle>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 1 }}>
        <DialogContentText sx={{ fontSize: '0.875rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 2 }}>
        <Button onClick={onClose} variant="contained" color={type === 'error' ? 'error' : 'primary'} size="small">
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AlertDialog
