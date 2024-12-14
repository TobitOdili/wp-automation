import React from 'react';
import { BlogWizard } from './components/BlogWizard';
import { validateConfig } from './config/environment';

function App() {
  // Validate environment configuration on app start
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
        <BlogWizard />
      </div>
    </div>
  );
}

export default App;