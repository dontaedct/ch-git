/**
 * Template Version Manager
 * 
 * Component for managing template versions, including viewing version history,
 * comparing versions, and restoring previous versions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TemplateVersion } from '../../lib/template-storage/TemplateStorage';
import { getTemplateStorage } from '../../lib/template-storage/TemplateStorage';

interface TemplateVersionManagerProps {
  templateId: string;
  currentVersion: string;
  onVersionSelect: (version: TemplateVersion) => void;
  onVersionRestore: (version: TemplateVersion) => void;
  onClose: () => void;
}

export const TemplateVersionManager: React.FC<TemplateVersionManagerProps> = ({
  templateId,
  currentVersion,
  onVersionSelect,
  onVersionRestore,
  onClose
}) => {
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load versions on mount
  useEffect(() => {
    loadVersions();
  }, [templateId]);

  const loadVersions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const templateStorage = getTemplateStorage();
      const templateVersions = await templateStorage.getTemplateVersions(templateId);
      setVersions(templateVersions);
    } catch (err) {
      setError('Failed to load template versions');
      console.error('Error loading versions:', err);
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  const handleVersionSelect = (version: TemplateVersion) => {
    setSelectedVersion(version.id);
    onVersionSelect(version);
  };

  const handleVersionRestore = async (version: TemplateVersion) => {
    if (confirm(`Are you sure you want to restore version ${version.version}? This will create a new version based on the selected one.`)) {
      try {
        onVersionRestore(version);
        onClose();
      } catch (err) {
        setError('Failed to restore version');
        console.error('Error restoring version:', err);
      }
    }
  };

  const handleVersionDelete = async (version: TemplateVersion) => {
    if (confirm(`Are you sure you want to delete version ${version.version}? This action cannot be undone.`)) {
      try {
        const templateStorage = getTemplateStorage();
        await templateStorage.deleteTemplate(templateId, version.version);
        await loadVersions();
      } catch (err) {
        setError('Failed to delete version');
        console.error('Error deleting version:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getVersionStatus = (version: TemplateVersion) => {
    if (version.isActive) return 'Active';
    if (version.version === currentVersion) return 'Current';
    return 'Archived';
  };

  const getVersionStatusColor = (version: TemplateVersion) => {
    if (version.isActive) return 'text-green-600 bg-green-100';
    if (version.version === currentVersion) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading versions...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Template Versions</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and restore previous versions of your template</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {versions.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Versions Found</h3>
              <p className="text-gray-600">This template doesn't have any saved versions yet.</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 transition-all ${
                      selectedVersion === version.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            Version {version.version}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVersionStatusColor(version)}`}>
                            {getVersionStatus(version)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Created:</strong> {formatDate(version.createdAt)}</p>
                          <p><strong>By:</strong> {version.createdBy}</p>
                          {version.description && (
                            <p><strong>Description:</strong> {version.description}</p>
                          )}
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                          <p><strong>Components:</strong> {version.manifest.components.length}</p>
                          <p><strong>Template ID:</strong> {version.manifest.id}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleVersionSelect(version)}
                          className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                        >
                          View
                        </button>
                        
                        {version.version !== currentVersion && (
                          <button
                            onClick={() => handleVersionRestore(version)}
                            className="px-3 py-1 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50"
                          >
                            Restore
                          </button>
                        )}

                        {!version.isActive && version.version !== currentVersion && (
                          <button
                            onClick={() => handleVersionDelete(version)}
                            className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {versions.length} version{versions.length !== 1 ? 's' : ''} found
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadVersions}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Refresh
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-white bg-gray-600 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateVersionManager;
