import React, { useState } from 'react';
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AnalysisStep from './AnalysisStep/AnalysisStep';
import { imageSource, modelLabel, segmentationLabel } from '../../utils/experimentOptions';

const ResearchAnalysisStep = ({ analysis, image, handleBack, onNext }) => {
  const { t } = useTranslation('experiment');
  const { t: td } = useTranslation('diagnostic');
  const [selectedId, setSelectedId] = useState(analysis.results[0].configuration_id);
  const [stageIndex, setStageIndex] = useState(0);
  const [stageDirection, setStageDirection] = useState(1);
  const selected = analysis.results.find((result) => result.configuration_id === selectedId) || analysis.results[0];
  const labels = td('diseaseLabels', { returnObjects: true });
  const stages = analysis.stages_by_segmentation?.[selected.segmentation_id];
  const stageItems = [
    ['original', t('stages.original')], ['hair_removed', t('stages.hairRemoved')],
    ['mask', t('stages.mask')], ['overlay', t('stages.overlay')], ['roi', t('stages.roi')],
  ].filter(([key]) => stages?.[key]);
  const activeStageIndex = stageIndex % (stageItems.length || 1);
  const activeStage = stageItems[activeStageIndex];
  const showStage = (nextIndex) => {
    setStageDirection(nextIndex > activeStageIndex ? 1 : -1);
    setStageIndex((nextIndex + stageItems.length) % stageItems.length);
  };
  const cardSx = {
    mx: { xs: 2, md: 4 },
    p: 3,
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  };

  return (
    <Box sx={{ display: 'grid', gap: 3, mt: 4, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
      <AnalysisStep results={selected} image={image} handleBack={handleBack} onNext={onNext} />
      <Paper sx={cardSx}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--primary-color)', mb: 2 }}>{t('comparisonTitle')}</Typography>
        <TableContainer>
          <Table size="small" aria-label={t('comparisonTitle')}>
            <TableHead><TableRow><TableCell>{t('model')}</TableCell><TableCell>{t('segmentationTitle')}</TableCell><TableCell>{t('predictedClass')}</TableCell><TableCell align="right">{t('confidence')}</TableCell></TableRow></TableHead>
            <TableBody>{analysis.results.map((result) => (
              <TableRow key={result.configuration_id} hover selected={result.configuration_id === selected.configuration_id} onClick={() => setSelectedId(result.configuration_id)} sx={{ cursor: 'pointer' }}>
                <TableCell>{modelLabel(result.model_id)}</TableCell>
                <TableCell>{result.segmentation_id === 'none' ? t('noSegmentation') : segmentationLabel(result.segmentation_id)}</TableCell>
                <TableCell>{labels[result.predicted_class] || result.predicted_class}</TableCell>
                <TableCell align="right">{(result.confidence * 100).toFixed(2)}%</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {activeStage && <Paper sx={cardSx}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--primary-color)', mb: 3 }}>{t('preprocessingResultsTitle')}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }} aria-live="polite">
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--dark-text-color)' }}>{activeStage[1]}</Typography>
          <Typography variant="body2" sx={{ flexShrink: 0, color: 'var(--primary-color)', fontWeight: 700 }}>{activeStageIndex + 1} / {stageItems.length}</Typography>
        </Box>
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', bgcolor: 'white', border: '1px solid #e8edeb' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${selected.segmentation_id}-${activeStage[0]}`}
              initial={{ opacity: 0, x: stageDirection * 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: stageDirection * -32 }}
              transition={{ duration: 0.22 }}
            >
              <Box component="img" src={imageSource(stages[activeStage[0]])} alt={activeStage[1]} sx={{ display: 'block', width: '100%', height: { xs: 300, md: 440 }, objectFit: 'contain', px: { xs: 6, md: 8 }, py: 2 }} />
            </motion.div>
          </AnimatePresence>
          {stageItems.length > 1 && <>
            <IconButton aria-label={t('previousStage')} onClick={() => showStage(activeStageIndex - 1)} sx={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', bgcolor: 'white', border: '1px solid #e1e8e5', boxShadow: '0 3px 12px rgba(0,0,0,0.12)', '&:hover': { bgcolor: 'white', color: 'var(--primary-color)' } }}><ArrowBackIosNewIcon fontSize="small" /></IconButton>
            <IconButton aria-label={t('nextStage')} onClick={() => showStage(activeStageIndex + 1)} sx={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', bgcolor: 'white', border: '1px solid #e1e8e5', boxShadow: '0 3px 12px rgba(0,0,0,0.12)', '&:hover': { bgcolor: 'white', color: 'var(--primary-color)' } }}><ArrowForwardIosIcon fontSize="small" /></IconButton>
          </>}
        </Box>
      </Paper>}
      {analysis.segmentations?.length > 1 && <Paper sx={cardSx}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--primary-color)', mb: 2 }}>{t('segmentationComparisonTitle')}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' }, gap: 1.5 }}>
          {analysis.segmentations.map((id) => <Box key={id} sx={{ p: 1.5, minWidth: 0, border: '1px solid #e5ece9', borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>{id === 'none' ? t('noSegmentation') : segmentationLabel(id)}</Typography>
            {[
              ['mask', t('stages.mask')],
              ['overlay', t('stages.overlay')],
              ['roi', t('stages.roi')],
            ].map(([key, label]) => <Box key={key} sx={{ pt: 1, pb: 1.5, borderTop: '1px solid #edf0ef' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>{label}</Typography>
              <Box component="img" src={imageSource(analysis.stages_by_segmentation?.[id]?.[key])} alt={`${segmentationLabel(id)} ${label}`} sx={{ display: 'block', width: '100%', height: 125, objectFit: 'contain', borderRadius: 1 }} />
            </Box>)}
          </Box>)}
        </Box>
      </Paper>}
    </Box>
  );
};

export default ResearchAnalysisStep;
