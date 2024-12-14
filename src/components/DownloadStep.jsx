import React from 'react';
import { WizardStep } from './WizardStep';
import { Button } from './Button';

export function DownloadStep({ blogName, downloadUrl }) {
  const handleDownload = () => {
    // Create a hidden anchor element
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Elementor Site Import - ${blogName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <WizardStep key="step3">
      <h2 className="text-3xl font-bold mb-8">Your theme is ready!</h2>
      <p className="mb-6 text-gray-300">
        Your customized theme has been generated and is ready for download.
      </p>
      <Button onClick={handleDownload}>
        Download Theme
      </Button>
    </WizardStep>
  );
}