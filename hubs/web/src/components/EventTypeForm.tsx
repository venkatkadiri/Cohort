import { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import type { CreateEventTypeDto } from '../dtos/event-type.dto'
import { createEventTypeSchema } from '../dtos/event-type.dto'

export interface EventTypeFormValues {
  title: string
  description: string
  durationMinutes: number
  locationType: 'online' | 'in-person'
  locationValue: string
  bufferBeforeMinutes: number
  bufferAfterMinutes: number
  isActive: boolean
  slug: string
}

export function toFormValues(data: Record<string, unknown>): EventTypeFormValues {
  return {
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    durationMinutes: Number(data.durationMinutes ?? 30),
    locationType: (data.locationType as 'online' | 'in-person') ?? 'online',
    locationValue: data.locationValue ? String(data.locationValue) : '',
    bufferBeforeMinutes: Number(data.bufferBeforeMinutes ?? 0),
    bufferAfterMinutes: Number(data.bufferAfterMinutes ?? 0),
    isActive: data.isActive !== false,
    slug: String(data.slug ?? ''),
  }
}

export function fromFormValues(values: EventTypeFormValues): CreateEventTypeDto {
  return {
    title: values.title,
    description: values.description || undefined,
    durationMinutes: values.durationMinutes,
    locationType: values.locationType,
    locationValue: values.locationValue || undefined,
    bufferBeforeMinutes: values.bufferBeforeMinutes,
    bufferAfterMinutes: values.bufferAfterMinutes,
    isActive: values.isActive,
    slug: values.slug || undefined,
  }
}

export default function EventTypeForm({
  initial,
  submitLabel,
  onSubmit,
  busy,
}: {
  initial: EventTypeFormValues
  submitLabel: string
  /** Returns an error message to display, or null on success */
  onSubmit: (values: CreateEventTypeDto) => Promise<string | null>
  busy: boolean
}) {
  const [values, setValues] = useState<EventTypeFormValues>(initial)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof EventTypeFormValues>(key: K, value: EventTypeFormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const parsed = createEventTypeSchema.safeParse(fromFormValues(values))
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '))
      return
    }

    const failure = await onSubmit(parsed.data)
    if (failure) setError(failure)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Title"
            fullWidth
            required
            size="small"
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. 1:1 Architecture & System Design Review"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            size="small"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What will you cover in this session track?"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Duration"
            fullWidth
            size="small"
            value={values.durationMinutes}
            onChange={(e) => set('durationMinutes', Number(e.target.value))}
          >
            {[15, 30, 45, 60, 90, 120].map((minutes) => (
              <MenuItem key={minutes} value={minutes}>
                {minutes} minutes
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Slug (URL identifier)"
            fullWidth
            size="small"
            value={values.slug}
            onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="system-design-review"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Location Type"
            fullWidth
            size="small"
            value={values.locationType}
            onChange={(e) => set('locationType', e.target.value as 'online' | 'in-person')}
          >
            <MenuItem value="online">Online (Google Meet / Zoom)</MenuItem>
            <MenuItem value="in-person">In person (Campus / Office)</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Location Details"
            fullWidth
            size="small"
            value={values.locationValue}
            onChange={(e) => set('locationValue', e.target.value)}
            placeholder={values.locationType === 'online' ? 'Meet link (auto for bookings)' : 'Campus room / Office'}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Buffer Before"
            fullWidth
            size="small"
            value={values.bufferBeforeMinutes}
            onChange={(e) => set('bufferBeforeMinutes', Number(e.target.value))}
          >
            {[0, 5, 10, 15, 30, 60].map((minutes) => (
              <MenuItem key={minutes} value={minutes}>
                {minutes} min
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Buffer After"
            fullWidth
            size="small"
            value={values.bufferAfterMinutes}
            onChange={(e) => set('bufferAfterMinutes', Number(e.target.value))}
          >
            {[0, 5, 10, 15, 30, 60].map((minutes) => (
              <MenuItem key={minutes} value={minutes}>
                {minutes} min
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={values.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                sx={{
                  color: '#FF3E00',
                  '&.Mui-checked': {
                    color: '#FF3E00',
                  },
                }}
              />
            }
            label="Active — published and bookable by fellows on your public page"
          />
        </Grid>
      </Grid>

      <Button
        type="submit"
        variant="contained"
        disabled={busy}
        startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
        sx={{
          fontWeight: 800,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
          alignSelf: 'flex-start',
          px: 3,
          py: 1,
        }}
      >
        {busy ? 'Saving…' : submitLabel}
      </Button>
    </Box>
  )
}