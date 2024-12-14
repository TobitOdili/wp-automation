import React from 'react';
import { motion } from 'framer-motion';

export function LoadingState({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center space-y-4 p-6 bg-gray-800 rounded-lg"
    >
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white text-lg">{message}</p>
    </motion.div>
  );
}