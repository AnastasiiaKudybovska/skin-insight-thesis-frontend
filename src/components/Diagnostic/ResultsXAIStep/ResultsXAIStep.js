import { useState } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DiagnosisResults from '../AnalysisStep/DiagnosisResults';
import XAIMethodSelector from './XAIMethodSelector';
import XAIExplanationView from './XAIExplanationView';

const ResultsXAIStep = ({ results, image }) => {
  const { t } = useTranslation('diagnostic');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [explanation, setExplanation] = useState(null);

  if (!results) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="error" variant="h6">
          {t('analysisStep.no_results')}
        </Typography>
      </Box>
    );
  }

  const handleMethodSelect = (explanationData) => {
    setExplanation(explanationData);
  };

  return (
    <Box sx={{ 
      maxWidth: '1200px', 
      mx: 'auto', 
      py: 4,
      px: { xs: 2, md: 4 }
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 4
      }}>
        <DiagnosisResults results={results} isMobile={isMobile} />
        
        {explanation ? (
          <XAIExplanationView 
            explanation={explanation} 
            onBack={() => setExplanation(null)}
          />
        ) : (
          <XAIMethodSelector 
            onMethodSelect={handleMethodSelect} 
            image={image} 
            historyId={results.history_id}
            runId={results.run_id}
            results={results}
          />
        )}
      </Box>
    </Box>
  );
};

export default ResultsXAIStep;
