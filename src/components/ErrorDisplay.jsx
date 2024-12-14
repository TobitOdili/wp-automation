import React from 'react';
import { motion } from 'framer-motion';

export function ErrorDisplay({ error, onDismiss }) {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 bg-red-500 text-white rounded-lg flex justify-between items-center"
    >
      <p>{error}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 p-1 hover:bg-red-600 rounded"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}