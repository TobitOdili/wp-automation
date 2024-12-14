import React from 'react';
import { motion } from 'framer-motion';

export function WizardStep({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-lg p-8 shadow-xl"
    >
      {children}
    </motion.div>
  );
}