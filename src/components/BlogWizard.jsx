import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardStep } from './WizardStep';
import { Button } from './Button';
import { Input } from './Input';
import { ColorInput } from './ColorInput';
import { ProcessingStatus } from './ProcessingStatus';
import { ErrorDisplay } from './ErrorDisplay';
import { useTemplateProcessor } from '../hooks/useTemplateProcessor';
import { DownloadStep } from './DownloadStep';

export function BlogWizard() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    blogType: '',
    blogName: '',
    preferredColor: ''
  });

  const {
    isProcessing,
    currentStatus,
    statusMessage,
    processTemplate,
    downloadUrl,
    error,
    clearError
  } = useTemplateProcessor();

  const handleNext = async () => {
    if (step === 1) {
      await processTemplate(formData);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <ProcessingStatus status={currentStatus} message={statusMessage} />
        ) : (
          <>
            {step === 0 && (
              <WizardStep key="step1">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  What kind of blog would you like to create today?
                </h1>
                <Input
                  value={formData.blogType}
                  onChange={(e) => updateFormData('blogType', e.target.value)}
                  placeholder="e.g., Travel, Food, Personal, Tech..."
                  className="mb-6"
                />
                <Button onClick={handleNext} disabled={!formData.blogType}>
                  Next
                </Button>
              </WizardStep>
            )}

            {step === 1 && (
              <WizardStep key="step2">
                <h2 className="text-3xl font-bold mb-8">Let's personalize your blog</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Blog Name (2-3 words suggested)
                    </label>
                    <Input
                      value={formData.blogName}
                      onChange={(e) => updateFormData('blogName', e.target.value)}
                      placeholder="Enter blog name"
                      className="mb-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Preferred Color (optional)
                    </label>
                    <ColorInput
                      value={formData.preferredColor}
                      onChange={(color) => updateFormData('preferredColor', color)}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button variant="secondary" onClick={handleBack}>
                      Back
                    </Button>
                    <Button onClick={handleNext}>
                      Generate Theme
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}

            {downloadUrl && (
              <DownloadStep
                blogName={formData.blogName}
                downloadUrl={downloadUrl}
              />
            )}

            {error && (
              <ErrorDisplay error={error} onDismiss={clearError} />
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}