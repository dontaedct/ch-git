'use client';

import { useAutoSaveInput, useAutoSaveTextarea } from '@/hooks/use-auto-save';
import { useState } from 'react';

export default function AutoSaveDemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const { setElementRef: setNameRef, hasUnsavedChanges: hasNameChanges } = useAutoSaveInput('name', {
    debounceMs: 2000,
  });

  const { setElementRef: setEmailRef, hasUnsavedChanges: hasEmailChanges } = useAutoSaveInput('email', {
    debounceMs: 2000,
  });

  const { setElementRef: setMessageRef, hasUnsavedChanges: hasMessageChanges } = useAutoSaveTextarea('message', {
    debounceMs: 2000,
  });

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const hasAnyChanges = hasNameChanges() || hasEmailChanges() || hasMessageChanges();

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Auto-Save Performance Demo</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Performance Optimizations Applied:</h2>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>✅ Increased debounce interval from 1000ms to 2000ms</li>
          <li>✅ Content diffing to prevent redundant saves</li>
          <li>✅ Batch storage operations</li>
          <li>✅ Event deduplication with passive listeners</li>
          <li>✅ Memory optimization with cleanup</li>
          <li>✅ Smart caching in storage manager</li>
        </ul>
      </div>

      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name {hasNameChanges() && <span className="text-orange-600">(Unsaved)</span>}
          </label>
          <input
            ref={setNameRef}
            type="text"
            id="name"
            value={formData.name}
            onChange={handleInputChange('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email {hasEmailChanges() && <span className="text-orange-600">(Unsaved)</span>}
          </label>
          <input
            ref={setEmailRef}
            type="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message {hasMessageChanges() && <span className="text-orange-600">(Unsaved)</span>}
          </label>
          <textarea
            ref={setMessageRef}
            id="message"
            value={formData.message}
            onChange={handleInputChange('message')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your message"
          />
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Auto-Save Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Name field:</span>
              <span className={hasNameChanges() ? 'text-orange-600 font-medium' : 'text-green-600'}>
                {hasNameChanges() ? 'Unsaved' : 'Saved'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Email field:</span>
              <span className={hasEmailChanges() ? 'text-orange-600 font-medium' : 'text-green-600'}>
                {hasEmailChanges() ? 'Unsaved' : 'Saved'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Message field:</span>
              <span className={hasMessageChanges() ? 'text-orange-600 font-medium' : 'text-green-600'}>
                {hasMessageChanges() ? 'Unsaved' : 'Saved'}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall status:</span>
                <span className={hasAnyChanges ? 'text-orange-600 font-bold' : 'text-green-600 font-bold'}>
                  {hasAnyChanges ? 'Has Unsaved Changes' : 'All Changes Saved'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Testing Instructions</h3>
          <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
            <li>Type in any field - notice the 2-second delay before auto-save</li>
            <li>Type the same content again - no save will occur (content diffing)</li>
            <li>Open browser dev tools and check the console for auto-save logs</li>
            <li>Check localStorage for saved data</li>
            <li>Refresh the page to test recovery functionality</li>
          </ol>
        </div>
      </form>
    </div>
  );
}
