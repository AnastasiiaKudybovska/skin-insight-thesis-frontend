import React from 'react';
import { Box, Button, Chip, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PsychologyAltOutlinedIcon from '@mui/icons-material/PsychologyAltOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';

const VersionModes = () => {
  const { t } = useTranslation('home');

  const modes = [
    {
      icon: <PsychologyAltOutlinedIcon sx={{ fontSize: 38 }} />,
      title: t('versions.standardTitle'),
      description: t('versions.standardDescription'),
      highlights: [t('versions.standardFeature1'), t('versions.standardFeature2')],
      action: t('versions.standardAction'),
      path: '/diagnostics',
    },
    {
      icon: <ScienceOutlinedIcon sx={{ fontSize: 38 }} />,
      title: t('versions.developerTitle'),
      description: t('versions.developerDescription'),
      highlights: [t('versions.developerFeature1'), t('versions.developerFeature2')],
      action: t('versions.developerAction'),
      path: '/diagnostics?mode=research',
      new: true,
    },
  ];

  return (
    <Box component="section" id="versions" sx={{ py: { xs: 7, md: 10 }, bgcolor: 'var(--white-color)' }}>
      <Container maxWidth="lg">
        <Chip label={t('versions.badge')} sx={{ mb: 2, bgcolor: 'rgba(56, 135, 122, 0.12)', color: 'var(--dark-primary-color)', fontWeight: 700 }} />
        <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--dark-text-color)', mb: 2 }}>
          {t('versions.title')}
        </Typography>
        <Typography sx={{ color: 'var(--grey-color)', maxWidth: 780, mb: 5, fontFamily: '"Raleway", sans-serif' }}>
          {t('versions.subtitle')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {modes.map((mode) => (
            <Box key={mode.path} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid rgba(56, 135, 122, 0.2)', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'var(--primary-color)', mb: 2 }}>
                {mode.icon}
                {mode.new && <Chip label={t('versions.new')} size="small" sx={{ bgcolor: 'var(--secondary-color)', color: 'white', fontWeight: 700 }} />}
              </Box>
              <Typography variant="h5" sx={{ fontFamily: '"Frank Ruhl Libre", serif', fontWeight: 700, color: 'var(--dark-text-color)', mb: 1 }}>
                {mode.title}
              </Typography>
              <Typography sx={{ color: 'var(--grey-color)', lineHeight: 1.7, mb: 2 }}>
                {mode.description}
              </Typography>
              <Box component="ul" sx={{ pl: 2.5, mb: 3, color: 'var(--dark-text-color)', '& li': { mb: 1 } }}>
                {mode.highlights.map((item) => <li key={item}>{item}</li>)}
              </Box>
              <Button component={RouterLink} to={mode.path} variant="contained" sx={{ alignSelf: 'flex-start', mt: 'auto', borderRadius: '24px', px: 3, textTransform: 'none', bgcolor: 'var(--primary-color)', '&:hover': { bgcolor: 'var(--dark-primary-color)' } }}>
                {mode.action}
              </Button>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default VersionModes;
