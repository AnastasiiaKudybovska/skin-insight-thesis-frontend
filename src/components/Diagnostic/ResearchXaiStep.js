import React, { useState } from 'react';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { experimentService } from '../../services/experimentService';
import { imageSource, modelLabel, segmentationLabel, xaiLabel, xaiMethods } from '../../utils/experimentOptions';

const ResearchXaiStep = ({ analysis, support }) => {
  const { t } = useTranslation('experiment');
  const [configurations, setConfigurations] = useState([analysis.results[0].configuration_id]);
  const [methods, setMethods] = useState(['occlusion_sensitivity']);
  const [explanations, setExplanations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (values, id, setter) => setter(values.includes(id)
    ? values.filter((value) => value !== id)
    : [...values, id]);

  const canExplain = configurations.some((id) => {
    const result = analysis.results.find((item) => item.configuration_id === id);
    return result && methods.some((method) => !support || support[result.model_id]?.includes(method));
  });

  const handleExplain = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await experimentService.explain(analysis.run_id, configurations, methods);
      setExplanations(response.explanations || []);
    } catch (caught) {
      setError(caught.message || t('xaiError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', mt: 4, px: { xs: 2, md: 4 } }}>
    <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--primary-color)', mb: 1 }}>{t('xaiTitle')}</Typography>
      <Typography sx={{ color: 'var(--grey-text-color)', mb: 2 }}>{t('xaiHint')}</Typography>
      <Typography sx={{ fontWeight: 700 }}>{t('xaiConfigurations')}</Typography>
      <FormGroup row sx={{ mb: 2 }}>
        {analysis.results.map((result) => <FormControlLabel
          key={result.configuration_id}
          label={`${modelLabel(result.model_id)} · ${result.segmentation_id === 'none' ? t('noSegmentation') : segmentationLabel(result.segmentation_id)}`}
          control={<Checkbox checked={configurations.includes(result.configuration_id)} onChange={() => toggle(configurations, result.configuration_id, setConfigurations)} />}
        />)}
      </FormGroup>
      <Typography sx={{ fontWeight: 700 }}>{t('xaiMethods')}</Typography>
      <FormGroup row sx={{ mb: 2 }}>
        {xaiMethods.map((method) => <FormControlLabel
          key={method.id}
          label={method.label}
          control={<Checkbox checked={methods.includes(method.id)} onChange={() => toggle(methods, method.id, setMethods)} />}
        />)}
      </FormGroup>
      <Button variant="contained" disabled={!canExplain || loading} onClick={handleExplain} sx={{ bgcolor: 'var(--primary-color)', borderRadius: '24px', textTransform: 'none', '&:hover': { bgcolor: 'var(--dark-primary-color)' } }}>
        {loading ? <><CircularProgress size={18} sx={{ color: 'white', mr: 1 }} />{t('generatingXai')}</> : t('generateXai')}
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {explanations.length > 0 && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2, mt: 3 }}>
        {explanations.map((item) => <Box key={`${item.configuration_id}:${item.method}`} sx={{ p: 2, border: '1px solid #e5ece9', borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{modelLabel(item.model_id)} · {item.segmentation_id === 'none' ? t('noSegmentation') : segmentationLabel(item.segmentation_id)} · {xaiLabel(item.method)}</Typography>
          <Box component="img" src={imageSource(item.overlay_image)} alt={`${modelLabel(item.model_id)} ${xaiLabel(item.method)}`} sx={{ width: '100%', maxHeight: 350, objectFit: 'contain', borderRadius: 2 }} />
        </Box>)}
      </Box>}
    </Paper>
    </Box>
  );
};

export default ResearchXaiStep;
