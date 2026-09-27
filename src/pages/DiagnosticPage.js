import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Container, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { experimentService } from '../services/experimentService';
import ImageUpload from '../components/Diagnostic/ImageUpload';
import AnalysisStep from '../components/Diagnostic/AnalysisStep/AnalysisStep';
import ResultsXAIStep from '../components/Diagnostic/ResultsXAIStep/ResultsXAIStep';
import DiagnosticStepper from '../components/Diagnostic/DiagnosticStepper';
import ResearchSettings from '../components/Diagnostic/ResearchSettings';
import ResearchAnalysisStep from '../components/Diagnostic/ResearchAnalysisStep';
import ResearchXaiStep from '../components/Diagnostic/ResearchXaiStep';
import { segmentationMethods } from '../utils/experimentOptions';

const DiagnosticPage = () => {
  const { t } = useTranslation('diagnostic');
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const requestedMode = new URLSearchParams(location.search).get('mode');
  const mode = isAuthenticated && requestedMode === 'research' ? 'research' : 'basic';
  const [activeStep, setActiveStep] = useState(0);
  const [image, setImage] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [researchAnalysis, setResearchAnalysis] = useState(null);
  const [models, setModels] = useState(['swin']);
  const [segmentationEnabled, setSegmentationEnabled] = useState(true);
  const [capabilities, setCapabilities] = useState(null);
  const [xaiSupport, setXaiSupport] = useState(null);
  const stepContentRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) localStorage.setItem('diagnostic_mode', mode);
    setActiveStep(0);
    setImage(null);
    setAnalysisResults(null);
    setResearchAnalysis(null);
  }, [isAuthenticated, mode]);

  useEffect(() => {
    if (mode !== 'research') return undefined;
    let active = true;
    experimentService.capabilities().then((response) => {
      if (active) {
        setCapabilities(response.configurations);
        setXaiSupport(response.xai_methods);
      }
    }).catch(() => {
      if (active) {
        setCapabilities(null);
        setXaiSupport(null);
      }
    });
    return () => { active = false; };
  }, [mode]);

  useEffect(() => {
    if (mode !== 'research' || activeStep === 0) return undefined;
    const frame = requestAnimationFrame(() => stepContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [activeStep, mode]);

  const selectedSegmentations = segmentationEnabled
    ? segmentationMethods.filter((method) => method.id !== 'none').map((method) => method.id)
    : ['none'];
  const canAnalyze = mode === 'basic' || (models.length > 0
    && (!capabilities || models.some((model) => selectedSegmentations.some((segmentation) => capabilities[model]?.includes(segmentation)))));

  const handleReset = () => {
    setActiveStep(0);
    setImage(null);
    setAnalysisResults(null);
    setResearchAnalysis(null);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const steps = [
    { 
      label: t('steps.upload'), 
      component: (
        <Box sx={mode === 'research' ? {
          display: 'grid',
          width: '100%',
          maxWidth: { xs: 700, lg: 1280 },
          mx: 'auto',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '420px minmax(0, 700px)' },
          justifyContent: { lg: 'center' },
          gap: { xs: 3, lg: 4 },
          alignItems: 'start',
          mt: 4,
        } : undefined}>
          {mode === 'research' && <ResearchSettings
            models={models}
            segmentationEnabled={segmentationEnabled}
            onModelsChange={setModels}
            onSegmentationEnabledChange={setSegmentationEnabled}
          />}
          <ImageUpload
            onNext={() => setActiveStep(1)}
            setImage={setImage}
            initialImage={image}
            setAnalysisResults={setAnalysisResults}
            mode={mode}
            models={models}
            segmentationEnabled={segmentationEnabled}
            onResearchResults={setResearchAnalysis}
            canAnalyze={canAnalyze}
          />
        </Box>
      ) 
    },
    { 
      label: t('steps.analysis'), 
      component: mode === 'research' && researchAnalysis
        ? <ResearchAnalysisStep analysis={researchAnalysis} image={image} handleBack={handleBack} onNext={() => setActiveStep(2)} />
        : <AnalysisStep results={analysisResults} image={image} handleBack={handleBack} onNext={() => setActiveStep(2)} />
    },
    { 
      label: t('steps.results'), 
      component: mode === 'research' && researchAnalysis
        ? <ResearchXaiStep analysis={researchAnalysis} support={xaiSupport} />
        : <ResultsXAIStep results={analysisResults} image={image} handleBack={handleBack} />
    }
  ];

  if (requestedMode === 'research' && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/diagnostics?mode=research' }} />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        pt: 14, pb: 8,
        px: { xs: 4, md: 0},
        background: 'var(--white-color)', 
      }}
    >
      <Container maxWidth={mode === 'research' ? 'xl' : 'lg'}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 700,
            fontFamily: '"Playfair Display", serif',
            color: 'var(--dark-text-color)',
            mb: 6
          }}
        >
          {t('title')}
        </Typography>

        {analysisResults?.demo && <Alert severity="warning" sx={{ mb: 3 }}>{t('demoResultNotice')}</Alert>}

        <DiagnosticStepper activeStep={activeStep} steps={steps}/>

        <motion.div
          ref={stepContentRef}
          key={`${mode}-step-${activeStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {steps[activeStep].component}
        </motion.div>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} variant="contained"
              sx={{ mt: 4, px: 4, borderRadius: '24px', minWidth: '150px',
                fontWeight: 500, fontFamily: '"Inter", serif', textTransform: 'none',
                bgcolor: 'var(--white-color)',  color: 'var(--primary-color)', border: '2px solid var(--primary-color)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', transition: 'all 0.3s ease', 
                '&:hover': { bgcolor: 'var(--primary-color)', color: 'var(--white-color)',
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.3)',
                  },
                '&:active': { boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.3)',},
                }}
             >
              {t('backButton')}
            </Button>                        
          )}
          {activeStep === 1 && analysisResults && !analysisResults.isError &&(
            <Button onClick={() => setActiveStep(2)} variant="contained"
              sx={{ mt: 4, px: 4, borderRadius: '24px', minWidth: '150px',
                fontWeight: 500, fontFamily: '"Inter", serif', textTransform: 'none',
                bgcolor: 'var(--primary-color)',  color: 'var(--white-color)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', transition: 'all 0.3s ease', 
                '&:hover': { bgcolor: 'var(--dark-primary-color)',
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.3)',
                  },
                '&:active': { boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.3)',},
                }}>
              {t('analysisStep.viewXAIExplanation')}
            </Button>                        
          )}
          {activeStep === steps.length - 1 && (
            <Button onClick={handleReset} variant="contained"
                sx={{ mt: 4, px: 4, borderRadius: '24px',  minWidth: '150px',
                fontWeight: 500, fontFamily: '"Inter", serif', textTransform: 'none',
                bgcolor: 'var(--primary-color)',  color: 'var(--white-color)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', transition: 'all 0.3s ease', 
                '&:hover': { bgcolor: 'var(--dark-primary-color)',
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.3)',
                  },
                '&:active': { boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.3)',},
                }}>
              {t('resetButton')}
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default DiagnosticPage;
