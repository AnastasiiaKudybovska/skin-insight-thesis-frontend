import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import MainHero from '../components/MainHero/MainHero';
import InstructionSteps from '../components/InstructionSteps/InstructionSteps';
import MainFeatures from '../components/MainFeatures/MainFeatures';
import WarningBlock from '../components/WarningBlock/WarningBlock';
import DiseasesCarousel from '../components/DiseaseCarousel/DiseaseCarousel';
import VersionModes from '../components/VersionModes/VersionModes';

const HomePage = () => {

  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
    
    else if (location.hash) {
      const hash = location.hash.substring(1);
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, minHeight: '92vh' }}>
      <MainHero />
      <section id="instructions" >
         <InstructionSteps />
      </section>
      <VersionModes />
     
      <MainFeatures />
      <WarningBlock />
      <DiseasesCarousel />
      
    </Box>
  );
};

export default HomePage;
