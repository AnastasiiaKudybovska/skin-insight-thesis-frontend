import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  styled,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { diagnosticService } from '../../../services/diagnosticService';
import useStyledSnackbar from '../../../hooks/useStyledSnackbar';
import { useAuth } from '../../../hooks/useAuth';

const PrimaryRadio = styled(Radio)(({ theme }) => ({
  color: 'var(--grey-color)',
  '&.Mui-checked': {
    color: 'var(--primary-color)',
  },
}));

const XAIMethodSelector = ({ onMethodSelect, image, historyId, runId, results }) => {
  const { t } = useTranslation('diagnostic');
  const { isAuthenticated } = useAuth();
  const { showError, showWarning } = useStyledSnackbar();
  const [selectedMethod, setSelectedMethod] = useState(isAuthenticated ? 'occlusion_sensitivity' : 'gradcam');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const legacyMethods = [
    {
      id: 'gradcam',
      name: 'Grad-CAM',
      description: t('xaiMethods.gradcamDesc')
    },
    {
      id: 'lime',
      name: 'LIME',
      description: t('xaiMethods.limeDesc'),
    },
    {
      id: 'shap',
      name: 'SHAP',
      description: t('xaiMethods.shapDesc'),
    },
    {
      id: 'anchor',
      name: 'Anchor',
      description: t('xaiMethods.anchorDesc'),
    },
    {
      id: 'ig',
      name: 'Integrated Gradients',
      description: t('xaiMethods.igDesc'),
    }
  ];

  const transformerMethods = [
    { id: 'integrated_gradients', name: 'Integrated Gradients', description: t('xaiMethods.igDemoDesc') },
    { id: 'occlusion_sensitivity', name: 'Occlusion Sensitivity', description: t('xaiMethods.occlusionSensitivityDesc') },
  ];
  const methods = isAuthenticated ? transformerMethods : legacyMethods;

  const handleMethodChange = (event) => {
    setSelectedMethod(event.target.value);
    setError(null); 
  };

  const handleSubmit = async () => {
    if (!image) {
      setError(t('xaiMethods.noImageError'));
      showError(t('xaiMethods.noImageError'));
      return;
    }

    setIsLoading(true);
    showWarning(t('xaiMethods.waiting'))
    setError(null);
    
    try {
      const explanation = await diagnosticService.getXAIExplanation(
        selectedMethod,
        image,
        historyId,
        runId,
        results
      );
    
      onMethodSelect({explanation});
      
    } catch (err) {
      console.error('Error getting XAI explanation:', err);
      setError(t('xaiMethods.requestError'));
      showError(t('xaiMethods.requestError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{flex: 1, minWidth: 0}}>
      <Box sx={{ 
            borderRadius: '16px',
            backgroundColor: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            height: '100%', 
            p: 3
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 1, 
            fontFamily: '"Inter", serif', 
            fontWeight: 600,
            color: 'var(--primary-color)'
          }}
        >
          {t('xaiMethods.title')}
        </Typography>
  
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3, 
            color: "var(--grey-text-color)", 
            fontFamily: '"Raleway", serif' 
          }}
        >
          {t('xaiMethods.subtitle')}
        </Typography>

        <RadioGroup
          value={selectedMethod}
          onChange={handleMethodChange}
          sx={{ mb: 2 }}
        >
          {methods.map((method) => (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Box 
                sx={{ 
                  py: 1, 
                  px: 2, 
                  mb: 2, 
                  borderRadius: '8px',  
                  border: selectedMethod === method.id ? '1px solid var(--primary-color)' : '1px solid var(--dark-bg-color)',
                  backgroundColor: selectedMethod === method.id ? 'var(--white-color)' : 'transparent',
                  transition: 'background-color 0.4s ease'
                }}
              >
                <FormControlLabel
                  value={method.id}
                  control={<PrimaryRadio />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 500,  
                          fontFamily: '"Inter", sans-serif',
                          color: selectedMethod === method.id ? 'var(--primary-color)' : 'inherit'
                        }}
                      >
                        {method.name}
                      </Typography>
                      <Typography 
                        variant="body2"  
                        sx={{ 
                          color: selectedMethod === method.id ? 'var(--dark-text-color)' : 'var(--grey-text-color)',
                          fontFamily: '"Raleway", sans-serif',
                        }}
                      >
                        {method.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ 
                    alignItems: 'flex-start',
                    '& .MuiFormControlLabel-label': {
                      flex: 1
                    }
                  }}
                />
              </Box>
            </motion.div>
          ))}
        </RadioGroup>

        {error && (
           <Typography variant="body2" sx={{ color: "var(--error-color)", fontWeight: 600, fontFamily: '"Raleway", serif' }}>
            {error}
          </Typography>
        )}
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{
            px: 4, 
            width: '100%',
            borderRadius: '24px', 
            fontSize: '16px',
            fontWeight: 500, 
            fontFamily: '"Inter", serif',  
            bgcolor: 'var(--primary-color)', 
            color: 'var(--white-color)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease', 
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'var(--dark-primary-color)',
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.3)',
            },
            '&.Mui-disabled': {
              bgcolor: 'var(--primary-light-color)',
              color: 'var(--white-color)'
            }
          }}
        >
          {isLoading ? (
              <Box >
                <CircularProgress size={24} sx={{ color: 'var(--primary-color)' }} />
                <Typography variant="body2" sx={{ color: "var(--grey-text-color)", fontWeight: 600, fontFamily: '"Raleway", serif' }}>
                  {t('xaiMethods.waiting')}
                </Typography>
              </Box>
          ) : (
            t('xaiMethods.generateExplanation')
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default XAIMethodSelector;
