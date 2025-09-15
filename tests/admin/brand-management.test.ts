/**
 * @fileoverview Brand Management Admin UI Tests
 * @module tests/admin/brand-management
 * @author OSS Hero System
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrandManagementInterface } from '@/app/admin/brand-management/brand-management-interface';
import { useBrandManagement } from '@/hooks/use-brand-management';
import { logoManager, BRAND_PRESETS } from '@/lib/branding/logo-manager';

// Mock the logo manager
jest.mock('@/lib/branding/logo-manager', () => ({
  logoManager: {
    getCurrentConfig: jest.fn(),
    updateConfig: jest.fn(),
    loadPreset: jest.fn(),
    subscribe: jest.fn(() => () => {}),
    validateConfig: jest.fn(),
    importConfig: jest.fn(),
  },
  BRAND_PRESETS: {
    default: {
      logo: {
        src: '/default-logo.png',
        alt: 'Default logo',
        width: 28,
        height: 28,
        initials: 'DF',
        fallbackBgColor: 'from-blue-600 to-indigo-600',
        showAsImage: true,
      },
      brandName: {
        organizationName: 'Default Organization',
        appName: 'Default App',
        fullBrand: 'Default Organization — Default App',
        shortBrand: 'Default App',
        navBrand: 'Default App',
      },
      isCustom: false,
      presetName: 'default',
    },
    tech: {
      logo: {
        src: '/tech-logo.png',
        alt: 'Tech logo',
        width: 28,
        height: 28,
        initials: 'TC',
        fallbackBgColor: 'from-green-600 to-emerald-600',
        showAsImage: true,
      },
      brandName: {
        organizationName: 'Tech Corp',
        appName: 'TechApp',
        fullBrand: 'Tech Corp — TechApp',
        shortBrand: 'TechApp',
        navBrand: 'TechApp',
      },
      isCustom: false,
      presetName: 'tech',
    },
  },
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Brand Management Admin Interface', () => {
  const mockConfig = {
    logo: {
      src: '/test-logo.png',
      alt: 'Test logo',
      width: 32,
      height: 32,
      initials: 'TL',
      fallbackBgColor: 'from-purple-600 to-violet-600',
      showAsImage: true,
    },
    brandName: {
      organizationName: 'Test Organization',
      appName: 'Test App',
      fullBrand: 'Test Organization — Test App',
      shortBrand: 'Test App',
      navBrand: 'Test App',
    },
    isCustom: true,
    presetName: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (logoManager.getCurrentConfig as jest.Mock).mockReturnValue(mockConfig);
    (logoManager.validateConfig as jest.Mock).mockReturnValue({ isValid: true, errors: [] });
  });

  it('should render brand management interface', () => {
    render(<BrandManagementInterface />);
    
    expect(screen.getByText('Current Brand Configuration')).toBeInTheDocument();
    expect(screen.getByText('Brand Names Configuration')).toBeInTheDocument();
    expect(screen.getByText('Logo Configuration')).toBeInTheDocument();
    expect(screen.getByText('Brand Presets')).toBeInTheDocument();
    expect(screen.getByText('Advanced Configuration')).toBeInTheDocument();
  });

  it('should display current brand configuration', () => {
    render(<BrandManagementInterface />);
    
    expect(screen.getByText('Test Organization — Test App')).toBeInTheDocument();
    expect(screen.getByText('Custom Brand')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should allow editing brand names', async () => {
    render(<BrandManagementInterface />);
    
    const organizationInput = screen.getByLabelText('Organization Name');
    const appNameInput = screen.getByLabelText('App Name');
    
    fireEvent.change(organizationInput, { target: { value: 'New Organization' } });
    fireEvent.change(appNameInput, { target: { value: 'New App' } });
    
    expect(organizationInput).toHaveValue('New Organization');
    expect(appNameInput).toHaveValue('New App');
  });

  it('should allow editing logo configuration', async () => {
    render(<BrandManagementInterface />);
    
    // Switch to logo tab
    fireEvent.click(screen.getByText('Logo & Visual'));
    
    const logoUrlInput = screen.getByLabelText('Logo URL');
    const initialsInput = screen.getByLabelText('Fallback Initials');
    
    fireEvent.change(logoUrlInput, { target: { value: 'https://example.com/new-logo.png' } });
    fireEvent.change(initialsInput, { target: { value: 'NA' } });
    
    expect(logoUrlInput).toHaveValue('https://example.com/new-logo.png');
    expect(initialsInput).toHaveValue('NA');
  });

  it('should display brand presets', () => {
    render(<BrandManagementInterface />);
    
    // Switch to presets tab
    fireEvent.click(screen.getByText('Presets'));
    
    expect(screen.getByText('Default Organization')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('default')).toBeInTheDocument();
    expect(screen.getByText('tech')).toBeInTheDocument();
  });

  it('should allow loading brand presets', async () => {
    (logoManager.loadPreset as jest.Mock).mockReturnValue(true);
    
    render(<BrandManagementInterface />);
    
    // Switch to presets tab
    fireEvent.click(screen.getByText('Presets'));
    
    // Click on tech preset
    const techPreset = screen.getByText('Tech Corp').closest('div');
    if (techPreset) {
      fireEvent.click(techPreset);
    }
    
    expect(logoManager.loadPreset).toHaveBeenCalledWith('tech');
  });

  it('should validate configuration before saving', async () => {
    (logoManager.validateConfig as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['Organization name is required', 'App name is required']
    });
    
    render(<BrandManagementInterface />);
    
    const saveButton = screen.getByText('Save Configuration');
    fireEvent.click(saveButton);
    
    expect(logoManager.validateConfig).toHaveBeenCalled();
  });

  it('should export configuration', () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = jest.fn();
    Object.defineProperty(window.URL, 'createObjectURL', { value: mockCreateObjectURL });
    Object.defineProperty(window.URL, 'revokeObjectURL', { value: mockRevokeObjectURL });
    
    // Mock document.createElement
    const mockClick = jest.fn();
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
    
    render(<BrandManagementInterface />);
    
    // Switch to advanced tab
    fireEvent.click(screen.getByText('Advanced'));
    
    const exportButton = screen.getByText('Export Configuration');
    fireEvent.click(exportButton);
    
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should import configuration', async () => {
    const mockConfig = {
      logo: {
        src: '/imported-logo.png',
        alt: 'Imported logo',
        width: 28,
        height: 28,
        initials: 'IL',
        fallbackBgColor: 'from-red-600 to-pink-600',
        showAsImage: true,
      },
      brandName: {
        organizationName: 'Imported Organization',
        appName: 'Imported App',
        fullBrand: 'Imported Organization — Imported App',
        shortBrand: 'Imported App',
        navBrand: 'Imported App',
      },
      isCustom: true,
    };
    
    (logoManager.importConfig as jest.Mock).mockReturnValue(true);
    
    render(<BrandManagementInterface />);
    
    // Switch to advanced tab
    fireEvent.click(screen.getByText('Advanced'));
    
    const fileInput = screen.getByLabelText(/Import Configuration/i);
    const file = new File([JSON.stringify(mockConfig)], 'brand-config.json', {
      type: 'application/json',
    });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(logoManager.importConfig).toHaveBeenCalledWith(JSON.stringify(mockConfig));
    });
  });

  it('should reset to default configuration', async () => {
    (logoManager.loadPreset as jest.Mock).mockReturnValue(true);
    
    render(<BrandManagementInterface />);
    
    // Switch to advanced tab
    fireEvent.click(screen.getByText('Advanced'));
    
    const resetButton = screen.getByText('Reset to Default');
    fireEvent.click(resetButton);
    
    expect(logoManager.loadPreset).toHaveBeenCalledWith('default');
  });

  it('should show unsaved changes indicator', () => {
    render(<BrandManagementInterface />);
    
    const organizationInput = screen.getByLabelText('Organization Name');
    fireEvent.change(organizationInput, { target: { value: 'Modified Organization' } });
    
    expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
  });

  it('should display validation errors', () => {
    (logoManager.validateConfig as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['Organization name is required']
    });
    
    render(<BrandManagementInterface />);
    
    const organizationInput = screen.getByLabelText('Organization Name');
    fireEvent.change(organizationInput, { target: { value: '' } });
    
    expect(screen.getByText('Organization name is required')).toBeInTheDocument();
  });
});
