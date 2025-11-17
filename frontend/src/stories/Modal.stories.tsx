import type { Meta, StoryObj } from '@storybook/react';
import Modal from '../components/Common/Modal';
import AccessibleButton from '../components/Common/AccessibleButton';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';

const meta: Meta = {
  title: 'Composants/Modal',
};

export default meta;

type Story = StoryObj;

export const AccessibleModal: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Box>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirmer la progression"
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <AccessibleButton variant="outlined" onClick={() => setOpen(false)}>
                Annuler
              </AccessibleButton>
              <AccessibleButton onClick={() => setOpen(false)}>Valider</AccessibleButton>
            </Box>
          }
        >
          <Typography variant="body1">
            Ce message explique clairement la prochaine étape pour l’enfant et ses accompagnants.
          </Typography>
        </Modal>
      </Box>
    );
  },
};
