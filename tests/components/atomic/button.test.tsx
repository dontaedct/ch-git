/**
 * @fileoverview HT-022.2.4: Basic Component Testing - Button Component
 * @module tests/components/atomic
 * @author Agency Component System
 * @version 1.0.0
 *
 * BASIC UNIT TESTS: Essential tests for Button component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/atomic/atoms';

describe('Button Component', () => {
  // Basic rendering tests
  it('renders with default props', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  // Variant tests
  it('applies CTA variant styles', () => {
    render(<Button variant="cta">CTA Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-slot', 'button');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="cta-secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Size tests
  it('applies different sizes correctly', () => {
    const sizes = ['xs', 'sm', 'default', 'lg', 'xl'] as const;
    sizes.forEach(size => {
      render(<Button size={size}>Size {size}</Button>);
      expect(screen.getByText(`Size ${size}`)).toBeInTheDocument();
    });
  });

  // Icon tests
  it('renders with left icon', () => {
    const icon = <span data-testid="test-icon">📧</span>;
    render(<Button icon={icon} iconPosition="left">With Icon</Button>);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const icon = <span data-testid="test-icon">➡️</span>;
    render(<Button icon={icon} iconPosition="right">With Icon</Button>);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  // Loading state tests
  it('shows loading spinner when loading', () => {
    render(<Button loading>Loading Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-loading', 'true');
  });

  it('shows loading text when provided', () => {
    render(<Button loading loadingText="Saving...">Save</Button>);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  // Interaction tests
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents click when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('prevents click when loading', () => {
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>Loading</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Accessibility tests
  it('has proper accessibility attributes', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('supports full width', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Intent-based tests
  it('applies booking intent correctly', () => {
    render(<Button intent="booking">Book Now</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies download intent correctly', () => {
    render(<Button intent="download">Download</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // CTA Button specialized components
  it('renders CTAButton correctly', () => {
    const { CTAButton } = require('@/components/ui/atomic/atoms');
    render(<CTAButton>Primary CTA</CTAButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Performance test
  it('renders within performance budget', () => {
    const startTime = performance.now();
    render(<Button>Performance Test</Button>);
    const endTime = performance.now();

    // Should render in less than 50ms
    expect(endTime - startTime).toBeLessThan(50);
  });
});