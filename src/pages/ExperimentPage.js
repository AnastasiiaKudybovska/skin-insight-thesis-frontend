import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, Container,
  FormControlLabel, FormGroup, LinearProgress, Paper, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { experimentService } from '../services/experimentService';
import {
  classificationModels, imageSource, modelLabel, segmentationLabel,
  segmentationMethods, xaiLabel, xaiMethods,
} from '../utils/experimentOptions';
import { diseaseKeys, diseaseColors } from '../utils/constants';

const cardSx = {
  p: { xs: 2.5, md: 3 }, borderRadius: '16px', bgcolor: 'white',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
};

const primaryButtonSx = {
  borderRadius: '24px', px: 3, textTransform: 'none',
  bgcolor: 'var(--primary-color)', '&:hover': { bgcolor: 'var(--dark-primary-color)' },
};

const PreviewImage = ({ src, alt, compact = false }) => (
  <Box component="img" src={src} alt={alt} sx={{ width: '100%', maxHeight: compact ? 140 : 260, objectFit: 'contain', borderRadius: 2, bgcolor: '#f1f5f4' }} />
);

const ExperimentPage = ({ mode = 'developer' }) => {
  const { t } = useTranslation('experiment');
  const { t: td } = useTranslation('diagnostic');
  const standard = mode === 'standard';
  const [models, setModels] = useState(['swin']);
  const [segmentationEnabled, setSegmentationEnabled] = useState(true);
  const [capabilities, setCapabilities] = useState(null);
  const [xaiSupport, setXaiSupport] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const resultsRef = useRef(null);
  const [activeConfiguration, setActiveConfiguration] = useState('swin:deeplabv3plus');
  const [activeStageSegmentation, setActiveStageSegmentation] = useState('deeplabv3plus');
  const [selectedXaiMethods, setSelectedXaiMethods] = useState(['integrated_gradients']);
  const [selectedXaiConfigurations, setSelectedXaiConfigurations] = useState(['swin:deeplabv3plus']);
  const [explanations, setExplanations] = useState([]);
  const [unavailableExplanations, setUnavailableExplanations] = useState([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingXai, setLoadingXai] = useState(false);
  const [error, setError] = useState('');
  const [xaiError, setXaiError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode]);

  useEffect(() => {
    experimentService.capabilities().then((response) => {
      setCapabilities(response.configurations);
      setXaiSupport(response.xai_methods);
    }).catch(() => {
      setCapabilities(null);
      setXaiSupport(null);
    });
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!analysis?.run_id || loadingAnalysis) return undefined;

    let frameId = requestAnimationFrame(() => {
      if (!resultsRef.current) return;
      const start = window.scrollY;
      const target = Math.max(0, resultsRef.current.getBoundingClientRect().top + start - 100);
      const distance = target - start;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo(0, target);
        return;
      }

      const duration = 800;
      let startedAt;
      const animate = (time) => {
        if (startedAt === undefined) startedAt = time;
        const progress = Math.min((time - startedAt) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        window.scrollTo(0, start + distance * eased);
        if (progress < 1) frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(frameId);
  }, [analysis, loadingAnalysis]);

  const results = useMemo(() => analysis?.results || [], [analysis]);
  const selectedResult = results.find((item) => item.configuration_id === activeConfiguration) || results[0];
  const diseaseLabels = td('diseaseLabels', { returnObjects: true });
  const selectedSegmentations = segmentationEnabled
    ? segmentationMethods.filter((method) => method.id !== 'none').map((method) => method.id)
    : ['none'];
  const hasAvailableConfiguration = !capabilities || models.some((model) => selectedSegmentations.some((segmentation) => capabilities[model]?.includes(segmentation)));
  const supportsSelectedXai = (method) => selectedXaiConfigurations.some((id) => {
    const result = results.find((item) => item.configuration_id === id);
    return result && (!xaiSupport || xaiSupport[result.model_id]?.includes(method));
  });
  const hasSupportedXai = selectedXaiMethods.some(supportsSelectedXai);

  const toggleModel = (id) => {
    setModels((previous) => previous.includes(id)
      ? previous.filter((value) => value !== id)
      : [...previous, id]);
    setAnalysis(null);
    setExplanations([]);
    setUnavailableExplanations([]);
  };

  const changeSegmentation = (enabled) => {
    setSegmentationEnabled(enabled);
    setAnalysis(null);
    setExplanations([]);
    setUnavailableExplanations([]);
  };

  const useDefaultPreset = () => {
    setModels(['swin']);
    setSegmentationEnabled(true);
    setAnalysis(null);
    setExplanations([]);
    setUnavailableExplanations([]);
  };

  const toggleXai = (id) => {
    setSelectedXaiMethods((previous) => previous.includes(id)
      ? previous.filter((value) => value !== id)
      : [...previous, id]);
  };

  const toggleXaiConfiguration = (id) => {
    setSelectedXaiConfigurations((previous) => previous.includes(id)
      ? previous.filter((value) => value !== id)
      : [...previous, id]);
  };

  const handleFile = (selected) => {
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      setError(t('invalidFile'));
      return;
    }
    setFile(selected);
    setAnalysis(null);
    setExplanations([]);
    setUnavailableExplanations([]);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!file || models.length === 0 || !hasAvailableConfiguration) return;
    setLoadingAnalysis(true);
    setError('');
    setAnalysis(null);
    setExplanations([]);
    setUnavailableExplanations([]);
    try {
      const response = await experimentService.analyze(file, standard ? ['swin'] : models, standard || segmentationEnabled, !standard);
      if (!response?.run_id || !Array.isArray(response.results) || response.results.length === 0) {
        throw new Error(t('invalidResponse'));
      }
      setAnalysis(response);
      setActiveConfiguration(response.results[0].configuration_id);
      setActiveStageSegmentation(response.results[0].segmentation_id);
      setSelectedXaiConfigurations([response.results[0].configuration_id]);
    } catch (caught) {
      setError(caught?.message || String(caught) || t('analysisError'));
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleExplain = async () => {
    if (!analysis?.run_id || selectedXaiMethods.length === 0 || selectedXaiConfigurations.length === 0 || !hasSupportedXai) return;
    setLoadingXai(true);
    setXaiError('');
    try {
      const response = await experimentService.explain(analysis.run_id, selectedXaiConfigurations, selectedXaiMethods);
      if (!Array.isArray(response?.explanations)) throw new Error(t('invalidResponse'));
      setExplanations(response.explanations);
      setUnavailableExplanations(response.unavailable_explanations || []);
    } catch (caught) {
      setXaiError(caught?.message || String(caught) || t('xaiError'));
    } finally {
      setLoadingXai(false);
    }
  };

  const selectedStages = analysis?.stages_by_segmentation?.[activeStageSegmentation];
  const stageItems = [
    ['original', t('stages.original')],
    ['hair_removed', t('stages.hairRemoved')],
    ['mask', t('stages.mask')],
    ['overlay', t('stages.overlay')],
    ['roi', t('stages.roi')],
  ].filter(([key]) => selectedStages?.[key]);

  return (
    <Box sx={{ pt: 15, pb: 10, minHeight: '100vh', bgcolor: 'var(--white-color)' }}>
      <Container maxWidth="xl">
        <Chip label={standard ? t('standardBadge') : t('developerBadge')} sx={{ mb: 2, bgcolor: 'rgba(56,135,122,0.12)', color: 'var(--dark-primary-color)', fontWeight: 700 }} />
        <Typography component="h1" variant="h3" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--dark-text-color)', mb: 1 }}>
          {standard ? t('standardTitle') : t('developerTitle')}
        </Typography>
        <Typography sx={{ color: 'var(--grey-text-color)', maxWidth: 900, mb: 4 }}>
          {standard ? t('standardIntro') : t('developerIntro')}
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>{t('modelNotice')}</Alert>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: standard ? '1fr 1.2fr' : 'minmax(300px, 380px) minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
          <Paper sx={cardSx}>
            <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 700, mb: 1 }}>
              {t('settingsTitle')}
            </Typography>
            <Typography sx={{ color: 'var(--grey-text-color)', mb: 3 }}>{standard ? t('standardSettings') : t('settingsIntro')}</Typography>
            {standard ? (
              <Chip label="Swin Transformer" variant="outlined" sx={{ borderColor: 'var(--primary-color)', color: 'var(--dark-primary-color)', mb: 2 }} />
            ) : (
              <>
                <Button onClick={useDefaultPreset} variant="outlined" sx={{ mb: 2, borderRadius: '24px', textTransform: 'none', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>{t('defaultPreset')}</Button>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{t('modelsTitle')}</Typography>
                <FormGroup sx={{ mb: 2 }}>
                  {classificationModels.map((model) => (
                    <FormControlLabel key={model.id} label={model.label} control={<Checkbox checked={models.includes(model.id)} onChange={() => toggleModel(model.id)} sx={{ color: 'var(--primary-color)', '&.Mui-checked': { color: 'var(--primary-color)' } }} />} />
                  ))}
                </FormGroup>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{t('segmentationTitle')}</Typography>
                <FormControlLabel
                  label={segmentationEnabled ? t('segmentationOn') : t('segmentationOff')}
                  control={<Switch checked={segmentationEnabled} onChange={(event) => changeSegmentation(event.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary-color)' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--primary-color)' } }} />}
                />
                <Typography variant="body2" sx={{ color: 'var(--grey-text-color)', mb: 2 }}>{t('segmentationHint')}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{t('preprocessingTitle')}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--grey-text-color)', mb: 2 }}>{t('removeHairHint')}</Typography>
              </>
            )}
          </Paper>

          <Paper sx={cardSx}>
            <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 700, mb: 2 }}>{t('uploadTitle')}</Typography>
            <Box component="label" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFile(event.dataTransfer.files[0]); }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260, p: 3, border: '2px dashed var(--primary-color)', borderRadius: 3, cursor: 'pointer', textAlign: 'center', bgcolor: '#f8fbfa' }}>
              <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => handleFile(event.target.files[0])} />
              {preview ? <PreviewImage src={preview} alt={t('uploadedImage')} /> : <Typography sx={{ color: 'var(--grey-text-color)' }}>{t('dropHint')}</Typography>}
              <Typography sx={{ color: 'var(--primary-color)', mt: 2, fontWeight: 600 }}>{preview ? t('changeImage') : t('selectImage')}</Typography>
            </Box>
            {file && <Typography variant="body2" sx={{ mt: 1.5, color: 'var(--grey-text-color)', overflowWrap: 'anywhere' }}>{file.name}</Typography>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button variant="contained" onClick={handleAnalyze} disabled={!file || models.length === 0 || !hasAvailableConfiguration || loadingAnalysis} sx={{ ...primaryButtonSx, mt: 3 }}>
              {loadingAnalysis ? <><CircularProgress size={18} sx={{ color: 'white', mr: 1 }} />{t('analyzing')}</> : t('analyze')}
            </Button>
          </Paper>
        </Box>

        {analysis && (
          <Stack ref={resultsRef} spacing={3} sx={{ mt: 4, scrollMarginTop: '100px' }}>
            {analysis.demo && <Alert severity="warning">{t('demoResultNotice')}</Alert>}
            {analysis.remove_hair_artifacts && <Alert severity="info">{t('hairEnabledNotice')}</Alert>}
            {stageItems.length > 0 && <Paper sx={cardSx}>
              <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 700, mb: 1 }}>{t('preprocessingResultsTitle')}</Typography>
              <Typography sx={{ color: 'var(--grey-text-color)', mb: 2 }}>{t('preprocessingResultsHint')}</Typography>
              {analysis.segmentations?.length > 1 && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {analysis.segmentations.map((id) => <Chip key={id} label={id === 'none' ? t('noSegmentation') : segmentationLabel(id)} onClick={() => setActiveStageSegmentation(id)} color={id === activeStageSegmentation ? 'primary' : 'default'} variant={id === activeStageSegmentation ? 'filled' : 'outlined'} />)}
              </Box>}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
                {stageItems.map(([key, label]) => <Box key={key}><Typography sx={{ fontWeight: 600, mb: 1 }}>{label}</Typography><PreviewImage src={imageSource(selectedStages[key])} alt={label} /></Box>)}
              </Box>
            </Paper>}
            <Paper sx={cardSx}>
              <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 700, mb: 2 }}>{t('comparisonTitle')}</Typography>
              <Typography sx={{ color: 'var(--grey-text-color)', mb: 2 }}>{results.length > 1 ? t('comparisonHint') : t('singleResultHint')}</Typography>
              <TableContainer>
                <Table aria-label={t('comparisonTitle')}>
                  <TableHead><TableRow><TableCell>{t('model')}</TableCell><TableCell>{t('segmentationTitle')}</TableCell><TableCell>{t('predictedClass')}</TableCell><TableCell align="right">{t('confidence')}</TableCell></TableRow></TableHead>
                  <TableBody>{results.map((item) => (
                    <TableRow key={item.configuration_id} hover selected={selectedResult?.configuration_id === item.configuration_id} onClick={() => { setActiveConfiguration(item.configuration_id); setActiveStageSegmentation(item.segmentation_id); }} sx={{ cursor: 'pointer' }}>
                      <TableCell>{modelLabel(item.model_id)}</TableCell>
                      <TableCell>{item.segmentation_id === 'none' ? t('noSegmentation') : segmentationLabel(item.segmentation_id)}</TableCell>
                      <TableCell>{diseaseLabels[item.predicted_class] || item.predicted_class}</TableCell>
                      <TableCell align="right">{(Number(item.confidence) * 100).toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {selectedResult && <Paper sx={cardSx}>
              <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 700, mb: 1 }}>{t('detailsTitle')}: {modelLabel(selectedResult.model_id)} · {selectedResult.segmentation_id === 'none' ? t('noSegmentation') : segmentationLabel(selectedResult.segmentation_id)}</Typography>
              <Typography sx={{ mb: 3 }}>{t('predictedClass')}: <strong>{diseaseLabels[selectedResult.predicted_class] || selectedResult.predicted_class}</strong></Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                {diseaseKeys.map((key) => {
                  const value = Number(selectedResult.probabilities?.[key] || 0);
                  return <Box key={key}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                      <Typography>{diseaseLabels[key] || key}</Typography><Typography>{(value * 100).toFixed(2)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={Math.max(0, Math.min(100, value * 100))} sx={{ height: 8, borderRadius: 4, bgcolor: '#e9ecef', '& .MuiLinearProgress-bar': { bgcolor: diseaseColors[key] || 'var(--primary-color)' } }} />
                  </Box>;
                })}
              </Box>
            </Paper>}

            {analysis.segmentations?.length > 1 && <Paper sx={cardSx}>
              <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 700, mb: 1 }}>{t('segmentationComparisonTitle')}</Typography>
              <Typography sx={{ color: 'var(--grey-text-color)', mb: 2 }}>{t('segmentationComparisonHint')}</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' }, gap: 1.5 }}>
                {analysis.segmentations.map((id) => <Box key={id} onClick={() => { setActiveStageSegmentation(id); if (results.some((item) => item.configuration_id === `${selectedResult.model_id}:${id}`)) setActiveConfiguration(`${selectedResult.model_id}:${id}`); }} sx={{ p: 1.5, minWidth: 0, border: id === activeStageSegmentation ? '2px solid var(--primary-color)' : '1px solid #e5ece9', borderRadius: 3, cursor: 'pointer' }}>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>{id === 'none' ? t('noSegmentation') : segmentationLabel(id)}</Typography>
                  <PreviewImage compact src={imageSource(analysis.stages_by_segmentation?.[id]?.mask)} alt={`${segmentationLabel(id)} ${t('stages.mask')}`} />
                  <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>{t('stages.overlay')}</Typography>
                  <PreviewImage compact src={imageSource(analysis.stages_by_segmentation?.[id]?.overlay)} alt={`${segmentationLabel(id)} ${t('stages.overlay')}`} />
                </Box>)}
              </Box>
            </Paper>}

            <Paper sx={cardSx}>
              <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 700, mb: 1 }}>{t('xaiTitle')}</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>{t('xaiSupportNotice')}</Alert>
              <Typography sx={{ color: 'var(--grey-text-color)', mb: 2 }}>{t('xaiHint')}</Typography>
              {!standard && results.length > 1 && <>
                <Typography sx={{ fontWeight: 700 }}>{t('xaiConfigurations')}</Typography>
                <FormGroup row sx={{ mb: 2 }}>{results.map((item) => <FormControlLabel key={item.configuration_id} label={`${modelLabel(item.model_id)} · ${item.segmentation_id === 'none' ? t('noSegmentation') : segmentationLabel(item.segmentation_id)}`} control={<Checkbox checked={selectedXaiConfigurations.includes(item.configuration_id)} onChange={() => toggleXaiConfiguration(item.configuration_id)} sx={{ '&.Mui-checked': { color: 'var(--primary-color)' } }} />} />)}</FormGroup>
              </>}
              <Typography sx={{ fontWeight: 700 }}>{t('xaiMethods')}</Typography>
              <FormGroup row sx={{ mb: 2 }}>{xaiMethods.map((method) => <FormControlLabel key={method.id} label={method.label} control={<Checkbox checked={selectedXaiMethods.includes(method.id)} disabled={!supportsSelectedXai(method.id)} onChange={() => toggleXai(method.id)} sx={{ '&.Mui-checked': { color: 'var(--primary-color)' } }} />} />)}</FormGroup>
              {xaiError && <Alert severity="error" sx={{ mb: 2 }}>{xaiError}</Alert>}
              {unavailableExplanations.length > 0 && <Alert severity="warning" sx={{ mb: 2 }}>{t('xaiUnavailable', { count: unavailableExplanations.length })}</Alert>}
              <Button variant="contained" onClick={handleExplain} disabled={loadingXai || !hasSupportedXai} sx={primaryButtonSx}>
                {loadingXai ? <><CircularProgress size={18} sx={{ color: 'white', mr: 1 }} />{t('generatingXai')}</> : t('generateXai')}
              </Button>
              {explanations.length > 0 && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mt: 3 }}>
                {explanations.map((item) => <Box key={`${item.configuration_id}-${item.method}`} sx={{ p: 2, border: '1px solid #e5ece9', borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}><Typography sx={{ fontWeight: 700 }}>{modelLabel(item.model_id)} · {item.segmentation_id === 'none' ? t('noSegmentation') : segmentationLabel(item.segmentation_id)} · {xaiLabel(item.method)}</Typography>{analysis.demo && <Chip size="small" label={t('demoTag')} color="warning" />}</Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: item.heatmap_image ? '1fr 1fr' : '1fr', gap: 1 }}>
                    {item.overlay_image && <PreviewImage src={imageSource(item.overlay_image)} alt={`${modelLabel(item.model_id)} ${xaiLabel(item.method)}`} />}
                    {item.heatmap_image && <PreviewImage src={imageSource(item.heatmap_image)} alt={`${xaiLabel(item.method)} heatmap`} />}
                  </Box>
                </Box>)}
              </Box>}
            </Paper>
          </Stack>
        )}
        <Typography variant="body2" sx={{ color: 'var(--grey-text-color)', mt: 4 }}>{td('analysisStep.disclaimer')}</Typography>
      </Container>
    </Box>
  );
};

export default ExperimentPage;
