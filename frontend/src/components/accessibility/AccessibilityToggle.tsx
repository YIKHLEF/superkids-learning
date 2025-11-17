import React from 'react';
import { FormControlLabel, Switch, Tooltip, Typography } from '@mui/material';

interface AccessibilityToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  id?: string;
}

export const AccessibilityToggle: React.FC<AccessibilityToggleProps> = ({
  label,
  description,
  checked,
  onToggle,
  id,
}) => (
  <Tooltip title={description || ''} placement="top" arrow disableHoverListener={!description}>
    <FormControlLabel
      control={<Switch color="secondary" checked={checked} onChange={(event) => onToggle(event.target.checked)} />}
      label={<Typography variant="body1">{label}</Typography>}
      aria-describedby={description ? `${id || label}-helper` : undefined}
      sx={{
        gap: 1,
        borderRadius: 2,
        px: 1,
        py: 0.5,
        bgcolor: checked ? 'secondary.light' : 'transparent',
      }}
    />
  </Tooltip>
);

export default AccessibilityToggle;
