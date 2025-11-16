import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface NotificationProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  open,
  message,
  severity = 'info',
  onClose,
  autoHideDuration = 6000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          fontSize: '1rem',
          minWidth: 300,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
