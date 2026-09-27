import React from 'react';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Paper, Switch, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { classificationModels } from '../../utils/experimentOptions';

const ResearchSettings = ({ models, segmentationEnabled, onModelsChange, onSegmentationEnabledChange }) => {
  const { t } = useTranslation('experiment');

  const toggle = (items, id, update) => update(items.includes(id)
    ? items.filter((item) => item !== id)
    : [...items, id]);

  return (
    <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 700, mb: 1 }}>{t('settingsTitle')}</Typography>
      <Typography sx={{ color: 'var(--grey-text-color)', mb: 3 }}>{t('settingsIntro')}</Typography>
      <Button
        variant="outlined"
        onClick={() => { onModelsChange(['swin']); onSegmentationEnabledChange(true); }}
        sx={{ borderRadius: '24px', textTransform: 'none', color: 'var(--primary-color)', borderColor: 'var(--primary-color)', mb: 3 }}
      >
        {t('defaultPreset')}
      </Button>
      <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('modelsTitle')}</Typography>
      <FormGroup sx={{ mb: 3 }}>
        {classificationModels.map((model) => (
          <FormControlLabel
            key={model.id}
            label={model.label}
            control={<Checkbox checked={models.includes(model.id)} onChange={() => toggle(models, model.id, onModelsChange)} sx={{ color: 'var(--primary-color)', '&.Mui-checked': { color: 'var(--primary-color)' } }} />}
          />
        ))}
      </FormGroup>
      <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('segmentationTitle')}</Typography>
      <FormControlLabel
        label={segmentationEnabled ? t('segmentationOn') : t('segmentationOff')}
        control={<Switch checked={segmentationEnabled} onChange={(event) => onSegmentationEnabledChange(event.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary-color)' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--primary-color)' } }} />}
      />
      <Typography variant="body2" sx={{ color: 'var(--grey-text-color)' }}>{t('segmentationHint')}</Typography>
      <Box sx={{ mt: 2, color: 'var(--grey-text-color)' }}><Typography variant="body2">{t('removeHairHint')}</Typography></Box>
    </Paper>
  );
};

export default ResearchSettings;
