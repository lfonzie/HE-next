// lib/utils/__tests__/latex-normalization.test.ts
// Test suite for LaTeX normalization functionality

import { 
  normalizeFormulas, 
  normalizeObjectFormulas, 
  containsLatex,
  logLatexDetection,
  normalizeFormulasWithLogging 
} from '@/lib/utils/latex-normalization';

describe('LaTeX Normalization', () => {
  describe('normalizeFormulas', () => {
    it('should convert chemical formulas with subscripts', () => {
      expect(normalizeFormulas('CO_2')).toBe('CO₂');
      expect(normalizeFormulas('H_2O')).toBe('H₂O');
      expect(normalizeFormulas('C_6H_{12}O_6')).toBe('C₆H₁₂O₆');
      expect(normalizeFormulas('Ca(OH)_2')).toBe('Ca(OH)₂');
      expect(normalizeFormulas('H_2SO_4')).toBe('H₂SO₄');
    });

    it('should convert mathematical expressions with superscripts', () => {
      expect(normalizeFormulas('x^2')).toBe('x²');
      expect(normalizeFormulas('x^3')).toBe('x³');
      expect(normalizeFormulas('x^{2+3}')).toBe('x²⁺³');
      expect(normalizeFormulas('a^2 + b^2')).toBe('a² + b²');
    });

    it('should convert LaTeX arrows', () => {
      expect(normalizeFormulas('\\rightarrow')).toBe('→');
      expect(normalizeFormulas('\\leftarrow')).toBe('←');
      expect(normalizeFormulas('\\leftrightarrow')).toBe('↔');
      expect(normalizeFormulas('\\Rightarrow')).toBe('⇒');
      expect(normalizeFormulas('\\longrightarrow')).toBe('⟶');
    });

    it('should convert arrows with text annotations', () => {
      expect(normalizeFormulas('\\xrightarrow{\\text{luz, clorofila}}')).toBe('→ [luz, clorofila]');
      expect(normalizeFormulas('\\xrightarrow{\\text{calor}}')).toBe('→ [calor]');
      expect(normalizeFormulas('\\xleftarrow{\\text{enzima}}')).toBe('← [enzima]');
    });

    it('should convert Greek letters', () => {
      expect(normalizeFormulas('\\alpha')).toBe('α');
      expect(normalizeFormulas('\\beta')).toBe('β');
      expect(normalizeFormulas('\\gamma')).toBe('γ');
      expect(normalizeFormulas('\\pi')).toBe('π');
      expect(normalizeFormulas('\\theta')).toBe('θ');
      expect(normalizeFormulas('\\lambda')).toBe('λ');
    });

    it('should convert mathematical symbols', () => {
      expect(normalizeFormulas('\\times')).toBe('×');
      expect(normalizeFormulas('\\div')).toBe('÷');
      expect(normalizeFormulas('\\pm')).toBe('±');
      expect(normalizeFormulas('\\leq')).toBe('≤');
      expect(normalizeFormulas('\\geq')).toBe('≥');
      expect(normalizeFormulas('\\neq')).toBe('≠');
      expect(normalizeFormulas('\\infty')).toBe('∞');
      expect(normalizeFormulas('\\sum')).toBe('∑');
      expect(normalizeFormulas('\\int')).toBe('∫');
    });

    it('should convert fractions', () => {
      expect(normalizeFormulas('\\frac{1}{2}')).toBe('½');
      expect(normalizeFormulas('\\frac{1}{3}')).toBe('⅓');
      expect(normalizeFormulas('\\frac{2}{3}')).toBe('⅔');
      expect(normalizeFormulas('\\frac{1}{4}')).toBe('¼');
      expect(normalizeFormulas('\\frac{3}{4}')).toBe('¾');
    });

    it('should handle text commands', () => {
      expect(normalizeFormulas('\\text{reagente}')).toBe('reagente');
      expect(normalizeFormulas('\\text{produto}')).toBe('produto');
    });

    it('should handle complex expressions', () => {
      const input = 'A reação \\xrightarrow{\\text{luz, clorofila}} produz CO_2 + H_2O';
      const expected = 'A reação → [luz, clorofila] produz CO₂ + H₂O';
      expect(normalizeFormulas(input)).toBe(expected);
    });

    it('should handle edge cases', () => {
      expect(normalizeFormulas('')).toBe('');
      expect(normalizeFormulas(null as any)).toBe(null);
      expect(normalizeFormulas(undefined as any)).toBe(undefined);
      expect(normalizeFormulas('No LaTeX here')).toBe('No LaTeX here');
    });

    it('should handle mixed content', () => {
      const input = 'A fórmula da água é H_2O e a do dióxido de carbono é CO_2. A reação \\xrightarrow{\\text{calor}} produz energia.';
      const expected = 'A fórmula da água é H₂O e a do dióxido de carbono é CO₂. A reação → [calor] produz energia.';
      expect(normalizeFormulas(input)).toBe(expected);
    });
  });

  describe('normalizeObjectFormulas', () => {
    it('should normalize strings in objects', () => {
      const input = {
        title: 'Aula sobre CO_2',
        content: 'A fórmula é H_2O',
        slides: [
          { title: 'Slide 1', content: 'CO_2 + H_2O' },
          { title: 'Slide 2', content: '\\xrightarrow{\\text{calor}}' }
        ]
      };

      const expected = {
        title: 'Aula sobre CO₂',
        content: 'A fórmula é H₂O',
        slides: [
          { title: 'Slide 1', content: 'CO₂ + H₂O' },
          { title: 'Slide 2', content: '→ [calor]' }
        ]
      };

      expect(normalizeObjectFormulas(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = ['CO_2', 'H_2O', '\\xrightarrow{\\text{calor}}'];
      const expected = ['CO₂', 'H₂O', '→ [calor]'];
      expect(normalizeObjectFormulas(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        lesson: {
          title: 'Química',
          content: 'CO_2 + H_2O',
          quiz: {
            question: 'Qual é a fórmula da água?',
            answer: 'H_2O'
          }
        }
      };

      const expected = {
        lesson: {
          title: 'Química',
          content: 'CO₂ + H₂O',
          quiz: {
            question: 'Qual é a fórmula da água?',
            answer: 'H₂O'
          }
        }
      };

      expect(normalizeObjectFormulas(input)).toEqual(expected);
    });

    it('should handle non-string values', () => {
      const input = {
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        string: 'CO_2'
      };

      const expected = {
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        string: 'CO₂'
      };

      expect(normalizeObjectFormulas(input)).toEqual(expected);
    });
  });

  describe('containsLatex', () => {
    it('should detect LaTeX commands', () => {
      expect(containsLatex('\\alpha')).toBe(true);
      expect(containsLatex('\\xrightarrow')).toBe(true);
      expect(containsLatex('\\frac{1}{2}')).toBe(true);
    });

    it('should detect subscripts and superscripts', () => {
      expect(containsLatex('CO_2')).toBe(true);
      expect(containsLatex('x^2')).toBe(true);
      expect(containsLatex('H_{2}O')).toBe(true);
    });

    it('should detect math mode', () => {
      expect(containsLatex('$x^2$')).toBe(true);
      expect(containsLatex('$$\\alpha$$')).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(containsLatex('No LaTeX here')).toBe(false);
      expect(containsLatex('CO₂')).toBe(false);
      expect(containsLatex('H₂O')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(containsLatex('')).toBe(false);
      expect(containsLatex(null as any)).toBe(false);
      expect(containsLatex(undefined as any)).toBe(false);
    });
  });

  describe('logLatexDetection', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log when LaTeX is detected', () => {
      logLatexDetection('CO_2 + H_2O', 'test-context');
      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️ LaTeX detected in test-context:',
        expect.objectContaining({
          context: 'test-context',
          text: 'CO_2 + H_2O',
          timestamp: expect.any(String)
        })
      );
    });

    it('should not log when no LaTeX is detected', () => {
      logLatexDetection('No LaTeX here', 'test-context');
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('normalizeFormulasWithLogging', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should normalize and log LaTeX detection', () => {
      const result = normalizeFormulasWithLogging('CO_2 + H_2O', 'test-context');
      expect(result).toBe('CO₂ + H₂O');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should not log when no changes are made', () => {
      const result = normalizeFormulasWithLogging('CO₂ + H₂O', 'test-context');
      expect(result).toBe('CO₂ + H₂O');
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Real-world examples', () => {
    it('should handle photosynthesis equation', () => {
      const input = '6CO_2 + 6H_2O \\xrightarrow{\\text{luz, clorofila}} C_6H_{12}O_6 + 6O_2';
      const expected = '6CO₂ + 6H₂O → [luz, clorofila] C₆H₁₂O₆ + 6O₂';
      expect(normalizeFormulas(input)).toBe(expected);
    });

    it('should handle combustion equation', () => {
      const input = 'CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O';
      const expected = 'CH₄ + 2O₂ → CO₂ + 2H₂O';
      expect(normalizeFormulas(input)).toBe(expected);
    });

    it('should handle mathematical expressions', () => {
      const input = 'x^2 + y^2 = z^2 \\Rightarrow \\sqrt{x^2 + y^2} = z';
      const expected = 'x² + y² = z² ⇒ √x² + y² = z';
      expect(normalizeFormulas(input)).toBe(expected);
    });

    it('should handle complex lesson content', () => {
      const input = `
        A fotossíntese é o processo pelo qual as plantas convertem CO_2 e H_2O em glicose.
        A equação é: 6CO_2 + 6H_2O \\xrightarrow{\\text{luz, clorofila}} C_6H_{12}O_6 + 6O_2
        A energia necessária vem da luz solar e é capturada pela clorofila.
      `;
      
      const expected = `
        A fotossíntese é o processo pelo qual as plantas convertem CO₂ e H₂O em glicose.
        A equação é: 6CO₂ + 6H₂O → [luz, clorofila] C₆H₁₂O₆ + 6O₂
        A energia necessária vem da luz solar e é capturada pela clorofila.
      `;
      
      expect(normalizeFormulas(input)).toBe(expected);
    });
  });
});
