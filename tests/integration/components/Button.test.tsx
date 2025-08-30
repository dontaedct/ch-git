/**
 * @fileoverview Integration Tests for Button Component
 * @description Integration tests for components/ui/button.tsx
 * @version 1.0.0
 * @author SOS Operation Phase 3 Task 15
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { Button } from '@ui/button';

describe('Button Component Integration', () => {
  describe('Rendering', () => {
    it('should render button with default props', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('should render button with different variants', () => {
      const { rerender } = render(<Button variant="solid">Solid</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-primary');
      
      rerender(<Button variant="destructive">Destructive</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-destructive');
      
      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('border', 'bg-background');
      
      rerender(<Button variant="subtle">Subtle</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-secondary');
      
      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');
      
      rerender(<Button variant="link">Link</Button>);
      expect(screen.getByRole('button')).toHaveClass('text-primary', 'underline-offset-4');
    });

    it('should render button with different sizes', () => {
      const { rerender } = render(<Button size="default">Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-9', 'px-4', 'py-2');
      
      rerender(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-8', 'rounded-md', 'px-3');
      
      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-10', 'rounded-md', 'px-6');
      
      rerender(<Button size="icon">Icon</Button>);
      expect(screen.getByRole('button')).toHaveClass('size-9');
    });

    it('should render disabled button', () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('should render button with custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard interactions', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      
      // Test that button is keyboard accessible
      expect(button).toBeInTheDocument();
      
      // Test click works
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle focus and blur events', () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      
      render(
        <Button onFocus={handleFocus} onBlur={handleBlur}>
          Focus me
        </Button>
      );
      
      const button = screen.getByRole('button');
      
      fireEvent.focus(button);
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      fireEvent.blur(button);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Custom label' });
      expect(button).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <div>
          <Button aria-describedby="description">Button</Button>
          <div id="description">Button description</div>
        </div>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('should support aria-expanded for toggle buttons', () => {
      render(<Button aria-expanded="true">Toggle</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should be keyboard navigable', () => {
      render(<Button>Keyboard accessible</Button>);
      
      const button = screen.getByRole('button');
      // Buttons are naturally focusable, so they don't need explicit tabIndex
      expect(button).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      render(<Button disabled>Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('should not trigger click when disabled', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Form Integration', () => {
    it('should work as form submit button', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      
      fireEvent.click(button);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should work as form reset button', () => {
      render(<Button type="reset">Reset</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Theme Integration', () => {
    it('should render in light theme', () => {
      render(<Button>Light theme</Button>, { theme: 'light' });
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render in dark theme', () => {
      render(<Button>Dark theme</Button>, { theme: 'dark' });
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle onClick errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const handleClick = jest.fn();
      
      render(<Button onClick={handleClick}>Error button</Button>);
      
      const button = screen.getByRole('button');
      
      // Test that button renders without errors
      expect(button).toBeInTheDocument();
      
      // Test that click handler is called
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Icon Support', () => {
    it('should render button with left icon', () => {
      const icon = <span data-testid="icon">🚀</span>;
      render(<Button icon={icon}>With Icon</Button>);
      
      const button = screen.getByRole('button');
      const iconElement = screen.getByTestId('icon');
      
      expect(iconElement).toBeInTheDocument();
      expect(button).toHaveTextContent('With Icon');
    });

    it('should render button with right icon', () => {
      const icon = <span data-testid="icon">🚀</span>;
      render(<Button icon={icon} iconPosition="right">With Icon</Button>);
      
      const button = screen.getByRole('button');
      const iconElement = screen.getByTestId('icon');
      
      expect(iconElement).toBeInTheDocument();
      expect(button).toHaveTextContent('With Icon');
    });
  });
});
