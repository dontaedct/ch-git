/**
 * @fileoverview HT-022.2.4: Basic Component Testing - Input Component
 * @module tests/components/atomic
 * @author Agency Component System
 * @version 1.0.0
 *
 * BASIC UNIT TESTS: Essential tests for Input component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/atomic/atoms';

describe('Input Component', () => {
  // Basic rendering tests
  it('renders input field', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with default value', () => {
    render(<Input defaultValue="Default text" />);
    expect(screen.getByDisplayValue('Default text')).toBeInTheDocument();
  });

  // Label tests
  it('renders with label', () => {
    render(<Input label="Email Address" />);
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  // Helper text tests
  it('renders with helper text', () => {
    render(<Input helper="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  // Variant tests
  it('applies error variant correctly', () => {
    render(<Input variant="error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('data-slot', 'input');
  });

  it('applies success variant correctly', () => {
    render(<Input variant="success" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies warning variant correctly', () => {
    render(<Input variant="warning" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  // Size tests
  it('applies different sizes correctly', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    rerender(<Input size="default" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  // Icon tests
  it('renders with left icon', () => {
    const icon = <span data-testid="left-icon">📧</span>;
    render(<Input icon={icon} iconPosition="left" />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const icon = <span data-testid="right-icon">🔍</span>;
    render(<Input icon={icon} iconPosition="right" />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  // Validation states
  it('shows error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows success message', () => {
    render(<Input success="Valid email address" />);
    expect(screen.getByText('Valid email address')).toBeInTheDocument();
  });

  it('shows warning message', () => {
    render(<Input warning="Check your input" />);
    expect(screen.getByText('Check your input')).toBeInTheDocument();
  });

  // Interaction tests
  it('handles input changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test input' } });

    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test input');
  });

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  // Accessibility tests
  it('has proper accessibility attributes when disabled', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('disabled');
  });

  it('associates label with input correctly', () => {
    render(<Input label="Test Label" />);
    const input = screen.getByLabelText('Test Label');
    const label = screen.getByText('Test Label');

    expect(input).toHaveAttribute('id');
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
  });

  it('associates error message with input', () => {
    render(<Input error="Error message" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('aria-describedby');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('associates helper text with input', () => {
    render(<Input helper="Helper text" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('aria-describedby');
  });

  // Type tests
  it('renders different input types correctly', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url'];

    types.forEach(type => {
      const { unmount } = render(<Input type={type as any} data-testid={`input-${type}`} />);
      const input = screen.getByTestId(`input-${type}`);
      expect(input).toHaveAttribute('type', type);
      unmount();
    });
  });

  // Performance test
  it('renders within performance budget', () => {
    const startTime = performance.now();
    render(<Input label="Performance Test" helper="Test helper" />);
    const endTime = performance.now();

    // Should render in less than 50ms
    expect(endTime - startTime).toBeLessThan(50);
  });

  // Complex scenario test
  it('handles complex input scenario with all features', () => {
    const handleChange = jest.fn();
    const icon = <span data-testid="email-icon">📧</span>;

    render(
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        helper="We'll never share your email"
        icon={icon}
        iconPosition="left"
        size="lg"
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText('Email Address');

    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter your email');
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    expect(screen.getByTestId('email-icon')).toBeInTheDocument();

    // Test interaction
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test@example.com');
  });
});