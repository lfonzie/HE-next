import { render, screen, fireEvent } from '@testing-library/react';
import { EnemCustomizer } from '../EnemCustomizer';
import { useToast } from '@/hooks/use-toast';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the toast function
const mockToast = jest.fn();
(useToast as jest.Mock).mockReturnValue({ toast: mockToast });

describe('EnemCustomizer', () => {
  const mockOnBack = jest.fn();
  const mockOnStart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should ensure difficulty distribution always sums to total questions when changing number of questions', () => {
    render(<EnemCustomizer onBack={mockOnBack} onStart={mockOnStart} />);
    
    // Get the number of questions slider
    const numQuestionsSlider = screen.getByRole('slider', { name: /número de questões/i });
    
    // Change number of questions to 20
    fireEvent.change(numQuestionsSlider, { target: { value: '20' } });
    
    // Check that the difficulty distribution shows the correct total
    const difficultyTitle = screen.getByText(/distribuição de dificuldade/i);
    expect(difficultyTitle).toBeInTheDocument();
    
    // The total should be displayed and should equal 20
    const totalDisplay = screen.getByText(/✓ Total: 20/);
    expect(totalDisplay).toBeInTheDocument();
  });

  it('should show error indicator when difficulty distribution does not match total questions', () => {
    render(<EnemCustomizer onBack={mockOnBack} onStart={mockOnStart} />);
    
    // Get difficulty sliders
    const easySlider = screen.getByRole('slider', { name: /fácil/i });
    const mediumSlider = screen.getByRole('slider', { name: /médio/i });
    const hardSlider = screen.getByRole('slider', { name: /difícil/i });
    
    // Set values that don't sum to the total (15)
    fireEvent.change(easySlider, { target: { value: '10' } });
    fireEvent.change(mediumSlider, { target: { value: '10' } });
    fireEvent.change(hardSlider, { target: { value: '10' } });
    
    // Should show error indicator
    const errorIndicator = screen.getByText(/Total: 30 ≠ 15/);
    expect(errorIndicator).toBeInTheDocument();
  });

  it('should prevent starting exam when difficulty distribution does not sum to total questions', () => {
    render(<EnemCustomizer onBack={mockOnBack} onStart={mockOnStart} />);
    
    // Get difficulty sliders and set invalid values
    const easySlider = screen.getByRole('slider', { name: /fácil/i });
    const mediumSlider = screen.getByRole('slider', { name: /médio/i });
    const hardSlider = screen.getByRole('slider', { name: /difícil/i });
    
    fireEvent.change(easySlider, { target: { value: '10' } });
    fireEvent.change(mediumSlider, { target: { value: '10' } });
    fireEvent.change(hardSlider, { target: { value: '10' } });
    
    // Try to start the exam
    const startButton = screen.getByRole('button', { name: /iniciar simulado/i });
    fireEvent.click(startButton);
    
    // Should show error toast
    expect(mockToast).toHaveBeenCalledWith({
      title: "Erro",
      description: "A distribuição de dificuldade deve somar o número total de questões",
      variant: "destructive"
    });
    
    // Should not call onStart
    expect(mockOnStart).not.toHaveBeenCalled();
  });

  it('should allow starting exam when difficulty distribution sums to total questions', () => {
    render(<EnemCustomizer onBack={mockOnBack} onStart={mockOnStart} />);
    
    // The default distribution should be valid (2+2+1=5, but we have 15 questions)
    // Let's adjust to make it valid
    const numQuestionsSlider = screen.getByRole('slider', { name: /número de questões/i });
    fireEvent.change(numQuestionsSlider, { target: { value: '5' } });
    
    // Try to start the exam
    const startButton = screen.getByRole('button', { name: /iniciar simulado/i });
    fireEvent.click(startButton);
    
    // Should call onStart with valid config
    expect(mockOnStart).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'CUSTOM',
        numQuestions: 5,
        difficultyDistribution: expect.objectContaining({
          easy: expect.any(Number),
          medium: expect.any(Number),
          hard: expect.any(Number),
        })
      })
    );
  });

  it('should auto-correct distribution when number of questions changes', () => {
    render(<EnemCustomizer onBack={mockOnBack} onStart={mockOnStart} />);
    
    // Change number of questions
    const numQuestionsSlider = screen.getByRole('slider', { name: /número de questões/i });
    fireEvent.change(numQuestionsSlider, { target: { value: '30' } });
    
    // The distribution should automatically adjust to sum to 30
    const totalDisplay = screen.getByText(/✓ Total: 30/);
    expect(totalDisplay).toBeInTheDocument();
  });
});
