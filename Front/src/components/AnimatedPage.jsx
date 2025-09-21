import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const circleVariants = {
  initial: {
    scale: 0,
    opacity: 1,
  },
  animate: {
    scale: 0,
    opacity: 0,
  },
  exit: {
    scale: 10,
    opacity: 1,
  },
};

export default function AnimatedPage({ children }) {
  return (
    <div style={{ position: 'relative', backgroundColor: '#000', overflow: 'hidden' }}>
      {/* 검정 원 */}
      <motion.div
        variants={circleVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100vmax',
          height: '100vmax',
          backgroundColor: '#000',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}
      />
      {/* 페이지 콘텐츠 */}
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.6 }}
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
