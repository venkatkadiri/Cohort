import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useThemeMode } from '../theme/ThemeContext'

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode()

  return (
    <Tooltip title={mode === 'light' ? 'Switch to Night Mode' : 'Switch to Day Mode'}>
      <IconButton
        onClick={toggleMode}
        size="small"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderRadius: 2,
          p: 1,
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
        aria-label="Toggle theme mode"
      >
        {mode === 'light' ? (
          <LightModeIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
        ) : (
          <DarkModeIcon sx={{ fontSize: 18, color: '#FF3E00' }} />
        )}
      </IconButton>
    </Tooltip>
  )
}
