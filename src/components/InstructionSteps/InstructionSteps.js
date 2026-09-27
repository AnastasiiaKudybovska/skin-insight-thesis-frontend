import React, { useState, useEffect } from 'react';
import { Box, Typography, Stepper, Step, StepLabel, useTheme, StepContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const InstructionSteps = () => {
  const theme = useTheme();
  const { t } = useTranslation('home');
  const [activeStep, setActiveStep] = useState(0);

  const stepImages = [
    '/images/upload-step-3.png',
    '/images/analysis-step-3.png',
    '/images/results-step-3.png'
  ];

  const steps = [
    {
      label: t('instructionSteps.upload'),
      description: t('instructionSteps.uploadDesc'),
    },
    {
      label: t('instructionSteps.analysis'),
      description: t('instructionSteps.analysisDesc'),
    },
    {
      label: t('instructionSteps.results'),
      description: t('instructionSteps.resultsDesc'),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <Box sx={{ width: '100%', p: 6, backgroundColor: 'var(--dark-bg-color)', minHeight: '80vh' }}>
      <Typography variant="h3"  align="center"
        sx={{ mb: 4, fontWeight: 700,  fontFamily: '"Playfair Display", sans-serif', color: 'var(--white-color)'}}
      >
        {t('instructionSteps.title')}
      </Typography>
      <Box sx={{
        display: 'flex', flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'center', alignItems: 'flex-start', gap: 2,
        maxWidth: 1200, mx: 'auto', pt: 2
      }}>
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
        <Stepper 
            activeStep={activeStep} 
            orientation="vertical"
            sx={{
              '& .MuiStepConnector-line': { borderLeftColor: 'var(--grey-color)', },
              '& .Mui-active': {'& .MuiStepConnector-line': { borderLeftColor: 'var(--primary-color)',}},
              '& .Mui-completed': { '& .MuiStepConnector-line': {borderLeftColor: 'var(--dark-primary-color)',}},
            }}
          >
            {steps.map((step, index) => (
              <Step key={index} completed={index < activeStep}>
                <StepLabel
                  slots={{
                    stepIcon: (props) => {
                      const { active, completed, icon } = props;
                      return (
                        <Box
                          sx={{
                            width: 48, height: 48, ml: -1.4, py: 2, my: 2,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: completed ? 'var(--dark-primary-color)' : active 
                              ? 'var(--primary-color)' : 'var(--grey-color)',
                            borderRadius: '50%', color: 'var(--white-color)',  
                            fontSize: completed ? '1.5rem' : '1.2rem', fontWeight: 400,
                          }}
                        >
                          {completed ? '✓' : icon}
                        </Box>
                      );
                    }
                  }}
                  sx={{
                    '& .MuiStepLabel-labelContainer': {
                      '& .MuiStepLabel-label': {
                       fontSize: '1.1rem',
                        '&.Mui-active': {
                          fontWeight: '700 !important', color: 'var(--white-color)',
                        },
                        '&.Mui-completed': {
                          fontWeight: '500 !important', color: 'var(--primary-color)',
                        },
                        '&:not(.Mui-active):not(.Mui-completed)': {
                          fontWeight: '400 !important', color: 'var(--grey-color)',
                        },
                      },
                    },
                    alignItems: 'center', padding: 0,
                  }}
                >
                  <Box sx={{  display: 'flex',  flexDirection: 'column', justifyContent: 'center'}}>
                    <Typography variant="h6" sx={{ 
                        ml: 2, fontFamily: '"Inter", sans-serif !important', fontWeight: 'inherit !important', fontSize: 'inherit !important', color: 'inherit !important'
                    }}>
                        {step.label}
                    </Typography>
                  </Box>
                </StepLabel>
                <StepContent>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ 
                      marginLeft: '28px',
                    }}
                  >
                    <Typography variant="body1" sx={{ 
                      color: activeStep === index  ? 'var(--white-color)' : 'var(--grey-color)',
                      lineHeight: 1.6,
                      fontFamily: '"Raleway", sans-serif',
                    }}>
                      {step.description}
                    </Typography>
                  </motion.div>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <Box sx={{ 
          width: { xs: '100%', md: '50%' },
          display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'
        }}>
          <motion.div
            key={`image-${activeStep}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', maxWidth: '500px'
            }}
          >
            <Box sx={{
              borderRadius: 2, overflow: 'hidden',
              // aspectRatio: '16/12',
              display: 'inline-block'
            }}>
              <Box
                component="img"
                src={stepImages[activeStep]}
                alt={steps[activeStep].label}
                sx={{ 
                width: '100%',
                height: 'auto',   
                display: 'block', 
              }}
              />
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default InstructionSteps;
