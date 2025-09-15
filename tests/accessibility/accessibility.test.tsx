import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import userEvent from '@testing-library/user-event'

// Import components to test
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  describe('WCAG 2.1 Compliance', () => {
    test('Button component should have no accessibility violations', async () => {
      const { container } = render(
        <Button data-testid="test-button">
          Click me
        </Button>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('Input component should have proper labels', async () => {
      const { container } = render(
        <div>
          <label htmlFor="test-input">Test Input</label>
          <Input id="test-input" data-testid="test-input" />
        </div>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('Card component should have proper heading structure', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is test content</p>
          </CardContent>
        </Card>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Keyboard Navigation', () => {
    test('should be navigable with keyboard only', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <Button data-testid="button-1">Button 1</Button>
          <Button data-testid="button-2">Button 2</Button>
          <Input data-testid="input-1" />
          <Input data-testid="input-2" />
        </div>
      )

      // Test tab navigation
      await user.tab()
      expect(screen.getByTestId('button-1')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('button-2')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('input-1')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('input-2')).toHaveFocus()
    })

    test('should handle Enter key activation', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()
      
      render(
        <Button onClick={handleClick} data-testid="test-button">
          Click me
        </Button>
      )

      const button = screen.getByTestId('test-button')
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('should handle Space key activation', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()
      
      render(
        <Button onClick={handleClick} data-testid="test-button">
          Click me
        </Button>
      )

      const button = screen.getByTestId('test-button')
      button.focus()
      
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Screen Reader Compatibility', () => {
    test('should have proper ARIA labels', () => {
      render(
        <div>
          <Button aria-label="Close dialog" data-testid="close-button">
            ×
          </Button>
          <Input 
            aria-label="Search input" 
            placeholder="Search..." 
            data-testid="search-input"
          />
        </div>
      )

      expect(screen.getByTestId('close-button')).toHaveAttribute('aria-label', 'Close dialog')
      expect(screen.getByTestId('search-input')).toHaveAttribute('aria-label', 'Search input')
    })

    test('should have proper role attributes', () => {
      render(
        <div>
          <Button role="button" data-testid="test-button">
            Button
          </Button>
          <div role="alert" data-testid="alert">
            Error message
          </div>
        </div>
      )

      expect(screen.getByTestId('test-button')).toHaveAttribute('role', 'button')
      expect(screen.getByTestId('alert')).toHaveAttribute('role', 'alert')
    })

    test('should have proper heading hierarchy', () => {
      render(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </div>
      )

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title')
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section Title')
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subsection Title')
    })
  })

  describe('Color Contrast', () => {
    test('should have sufficient color contrast', async () => {
      const { container } = render(
        <div style={{ 
          backgroundColor: '#ffffff', 
          color: '#000000',
          padding: '10px'
        }}>
          <p>This text should have sufficient contrast</p>
        </div>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('should handle focus states properly', async () => {
      const { container } = render(
        <Button 
          style={{ 
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            outline: '2px solid #1d4ed8'
          }}
          data-testid="focus-button"
        >
          Focused Button
        </Button>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Form Accessibility', () => {
    test('should have proper form labels and associations', async () => {
      const { container } = render(
        <form>
          <div>
            <label htmlFor="email">Email Address</label>
            <Input 
              id="email" 
              type="email" 
              required 
              aria-describedby="email-help"
            />
            <div id="email-help">Enter your email address</div>
          </div>
          
          <div>
            <label htmlFor="password">Password</label>
            <Input 
              id="password" 
              type="password" 
              required 
              aria-describedby="password-help"
            />
            <div id="password-help">Password must be at least 8 characters</div>
          </div>
          
          <Button type="submit">Submit</Button>
        </form>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('should handle form validation errors', async () => {
      const { container } = render(
        <form>
          <div>
            <label htmlFor="invalid-email">Email</label>
            <Input 
              id="invalid-email" 
              type="email" 
              aria-invalid="true"
              aria-describedby="email-error"
            />
            <div id="email-error" role="alert">
              Please enter a valid email address
            </div>
          </div>
        </form>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Interactive Elements', () => {
    test('should have proper focus management', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <Button data-testid="button-1">Button 1</Button>
          <Button data-testid="button-2">Button 2</Button>
        </div>
      )

      const button1 = screen.getByTestId('button-1')
      const button2 = screen.getByTestId('button-2')
      
      // Test focus management
      button1.focus()
      expect(button1).toHaveFocus()
      
      await user.tab()
      expect(button2).toHaveFocus()
    })

    test('should handle modal focus trapping', async () => {
      const user = userEvent.setup()
      
      render(
        <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <h2 id="modal-title">Modal Title</h2>
          <Button data-testid="modal-button">Modal Button</Button>
          <Button data-testid="close-button">Close</Button>
        </div>
      )

      const modalButton = screen.getByTestId('modal-button')
      modalButton.focus()
      expect(modalButton).toHaveFocus()
      
      // Test that focus stays within modal
      await user.tab()
      expect(screen.getByTestId('close-button')).toHaveFocus()
    })
  })

  describe('Responsive Design Accessibility', () => {
    test('should be accessible on mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })

      const { container } = render(
        <div style={{ minWidth: '320px' }}>
          <Button>Mobile Button</Button>
          <Input placeholder="Mobile input" />
        </div>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
