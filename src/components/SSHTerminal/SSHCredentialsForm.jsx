import React from 'react';

export function SSHCredentialsForm({ 
  credentials,
  onChange,
  disabled
}) {
  const handleChange = (field) => (e) => {
    onChange({
      ...credentials,
      [field]: field === 'host' ? e.target.value.trim() : e.target.value
    });
  };

  return (
    <div className="space-y-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Host</label>
        <input
          type="text"
          value={credentials.host}
          onChange={handleChange('host')}
          placeholder="Enter hostname or IP"
          className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 
                   focus:outline-none focus:border-blue-500"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          value={credentials.username}
          onChange={handleChange('username')}
          placeholder="Enter username"
          className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 
                   focus:outline-none focus:border-blue-500"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={credentials.password}
          onChange={handleChange('password')}
          placeholder="Enter password"
          className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 
                   focus:outline-none focus:border-blue-500"
          disabled={disabled}
          autoComplete="current-password"
        />
      </div>
    </div>
  );
}