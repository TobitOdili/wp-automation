import React from 'react';
import { BlogWizard } from './components/BlogWizard';
import { SSHTerminal } from './components/SSHTerminal';
import { validateConfig } from './config/environment';

function App() {
  React.useEffect(() => {
    try {
      validateConfig();
    } catch (error) {
      console.error('Environment configuration error:', error.message);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">WordPress Deployment Automation</h1>
        <BlogWizard />
        <div className="mt-8">
          <SSHTerminal />
        </div>
      </div>
    </div>
  );
}

export default App;