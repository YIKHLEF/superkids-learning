import React from 'react';
import { Button, ButtonProps, Tooltip } from '@mui/material';

interface AccessibleButtonProps extends ButtonProps {
  description?: string;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({ description, children, ...props }) => (
  <Tooltip title={description || ''} disableHoverListener={!description} enterDelay={100}>
    <Button
      {...props}
      aria-label={props['aria-label'] || (typeof children === 'string' ? children : undefined)}
      sx={{
        fontWeight: 700,
        letterSpacing: '0.01em',
        minWidth: 120,
        minHeight: 48,
        touchAction: 'manipulation',
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          transform: 'none',
        },
        ...(props.sx || {}),
      }}
      disableRipple
    >
      {children}
    </Button>
  </Tooltip>
);

export default AccessibleButton;
