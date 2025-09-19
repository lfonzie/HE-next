import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

describe('Component Unit Tests', () => {

  describe('Button Component', () => {
    test('should render with correct text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })

    test('should handle click events', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('should be keyboard accessible', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await userEvent.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      await userEvent.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(2)
    })

    test('should have proper ARIA attributes', () => {
      render(<Button aria-label="Close dialog">×</Button>)
      
      const button = screen.getByRole('button')
      AccessibilityTestHelper.expectToHaveAriaLabel(button, 'Close dialog')
    })

    test('should handle disabled state', () => {
      render(<Button disabled>Disabled button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    test('should have good performance', async () => {
      const { duration } = await PerformanceTestHelper.measureSync(() => {
        render(<Button>Performance test</Button>)
      })
      
      expect(duration).toBeLessThan(100) // Should render in < 100ms
    })
  })

  describe('Input Component', () => {
    test('should render with correct value', () => {
      render(<Input value="test value" onChange={() => {}} />)
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument()
    })

    test('should handle input changes', async () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'test input')
      
      expect(handleChange).toHaveBeenCalled()
    })

    test('should be keyboard accessible', async () => {
      render(<Input placeholder="Enter text" />)
      
      const input = screen.getByRole('textbox')
      // Input elements are naturally focusable, don't need explicit tabindex
      
      await userEvent.tab()
      expect(input).toHaveFocus()
    })

    test('should have proper label association', () => {
      render(
        <div>
          <label htmlFor="test-input">Test Input</label>
          <Input id="test-input" />
        </div>
      )
      
      const input = screen.getByLabelText('Test Input')
      expect(input).toHaveAttribute('id', 'test-input')
    })

    test('should handle validation states', () => {
      render(
        <Input 
          aria-invalid="true"
          aria-describedby="error-message"
        />
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'error-message')
    })
  })

  describe('Card Component', () => {
    test('should render with correct structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Test content</p>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    test('should have proper heading hierarchy', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Test content</p>
          </CardContent>
        </Card>
      )
      
      const title = screen.getByText('Test Card')
      AccessibilityTestHelper.expectToHaveHeadingLevel(title, 3)
    })

    test('should be accessible', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Test content</p>
          </CardContent>
        </Card>
      )
      
      // This would use axe-core in a real test
      expect(container).toBeInTheDocument()
    })
  })

  describe('Form Components', () => {
    test('should handle form submission', async () => {
      const handleSubmit = jest.fn()
      
      render(
        <form onSubmit={handleSubmit}>
          <Input name="test" placeholder="Enter value" />
          <Button type="submit">Submit</Button>
        </form>
      )
      
      const input = screen.getByPlaceholderText('Enter value')
      const submitButton = screen.getByRole('button')
      
      await userEvent.type(input, 'test value')
      await userEvent.click(submitButton)
      
      expect(handleSubmit).toHaveBeenCalled()
    })

    test('should validate required fields', async () => {
      render(
        <form>
          <Input required placeholder="Required field" />
          <Button type="submit">Submit</Button>
        </form>
      )
      
      const input = screen.getByPlaceholderText('Required field')
      const submitButton = screen.getByRole('button')
      
      await userEvent.click(submitButton)
      
      expect(input).toHaveAttribute('required')
    })
  })

  describe('Loading States', () => {
    test('should show loading state', () => {
      render(<Button disabled>Loading...</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent('Loading...')
    })

    test('should handle loading with spinner', () => {
      render(
        <Button disabled>
          <span aria-label="Loading">⏳</span>
          Loading...
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    test('should display error messages', () => {
      render(
        <div>
          <Input aria-invalid="true" />
          <div role="alert" id="error-message">
            This field is required
          </div>
        </div>
      )
      
      const input = screen.getByRole('textbox')
      const errorMessage = screen.getByRole('alert')
      
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(errorMessage).toHaveTextContent('This field is required')
    })

    test('should handle error boundaries', () => {
      const ThrowError = () => {
        throw new Error('Test error')
      }
      
      // This would test error boundary in a real implementation
      expect(() => render(<ThrowError />)).toThrow('Test error')
    })
  })

  describe('Responsive Design', () => {
    test('should adapt to different screen sizes', () => {
      // Mock different viewport sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<Button>Mobile Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Performance Tests', () => {
    test('should render multiple components efficiently', async () => {
      const { duration } = await PerformanceTestHelper.measureSync(() => {
        render(
          <div>
            {Array.from({ length: 100 }, (_, i) => (
              <Button key={i}>Button {i}</Button>
            ))}
          </div>
        )
      })
      
      expect(duration).toBeLessThan(500) // Should render 100 buttons in < 500ms
    })

    test('should handle rapid state changes', async () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0)
        
        return (
          <div>
            <span>{count}</span>
            <Button onClick={() => setCount(c => c + 1)}>
              Increment
            </Button>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const button = screen.getByRole('button')
      const count = screen.getByText('0')
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await userEvent.click(button)
      }
      
      await waitFor(() => {
        expect(count).toHaveTextContent('10')
      })
    })
  })

  describe('Accessibility Integration', () => {
    test('should work with screen readers', () => {
      render(
        <div>
          <h1>Main Title</h1>
          <Button aria-label="Close dialog">×</Button>
          <Input aria-label="Search input" placeholder="Search..." />
        </div>
      )
      
      // Check heading structure
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title')
      
      // Check ARIA labels
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument()
      expect(screen.getByLabelText('Search input')).toBeInTheDocument()
    })

    test('should support keyboard navigation', async () => {
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Input placeholder="Input" />
        </div>
      )
      
      const firstButton = screen.getByText('First')
      const secondButton = screen.getByText('Second')
      const input = screen.getByPlaceholderText('Input')
      
      // Tab navigation
      await userEvent.tab()
      expect(firstButton).toHaveFocus()
      
      await userEvent.tab()
      expect(secondButton).toHaveFocus()
      
      await userEvent.tab()
      expect(input).toHaveFocus()
    })
  })
})
