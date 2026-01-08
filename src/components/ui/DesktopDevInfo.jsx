import React from 'react';
import { motion } from 'framer-motion';
import useWindowSize from '@/hooks/useWindowSize';

const DesktopDevInfo = () => {
  const { width, height } = useWindowSize();
  const isMobile = width < 768;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono"
    >
      <div>📱 {width} x {height}</div>
      <div>{isMobile ? '📱 Móvil' : '💻 Escritorio'}</div>
    </motion.div>
  );
};

export default DesktopDevInfo;
