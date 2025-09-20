# LaTeX to Unicode Normalization

This document describes the implementation of LaTeX to Unicode normalization functionality in the HE-next application.

## Overview

The application now includes comprehensive LaTeX normalization to ensure that all mathematical and chemical expressions are displayed using Unicode characters instead of raw LaTeX syntax. This prevents issues where LaTeX commands like `\xrightarrow{\text{...}}` are displayed directly to users.

## Implementation

### Core Files

- **`lib/utils/latex-normalization.ts`** - Main normalization utility
- **`tests/lib/utils/latex-normalization.test.ts`** - Comprehensive test suite
- **Updated system prompts** - Enhanced to explicitly prohibit LaTeX usage

### Key Functions

#### `normalizeFormulas(text: string): string`
Converts LaTeX syntax to Unicode characters in a single string.

**Examples:**
```typescript
normalizeFormulas('CO_2 + H_2O') // → 'CO₂ + H₂O'
normalizeFormulas('\\xrightarrow{\\text{calor}}') // → '→ [calor]'
normalizeFormulas('x^2 + y^2') // → 'x² + y²'
```

#### `normalizeObjectFormulas(obj: any): any`
Recursively normalizes LaTeX in nested objects, arrays, and strings.

**Example:**
```typescript
const lessonData = {
  title: 'Aula sobre CO_2',
  slides: [
    { content: 'H_2O + CO_2' },
    { content: '\\xrightarrow{\\text{luz}}' }
  ]
};

normalizeObjectFormulas(lessonData);
// Result: {
//   title: 'Aula sobre CO₂',
//   slides: [
//     { content: 'H₂O + CO₂' },
//     { content: '→ [luz]' }
//   ]
// }
```

#### `containsLatex(text: string): boolean`
Detects if text contains LaTeX syntax.

#### `logLatexDetection(text: string, context: string): void`
Logs LaTeX detection for monitoring and prompt improvement.

## Supported Conversions

### Chemical Formulas
- `CO_2` → `CO₂`
- `H_2O` → `H₂O`
- `C_6H_{12}O_6` → `C₆H₁₂O₆`
- `Ca(OH)_2` → `Ca(OH)₂`
- `H_2SO_4` → `H₂SO₄`

### Mathematical Expressions
- `x^2` → `x²`
- `x^{2+3}` → `x²⁺³`
- `a^2 + b^2` → `a² + b²`

### Arrows
- `\rightarrow` → `→`
- `\leftarrow` → `←`
- `\leftrightarrow` → `↔`
- `\Rightarrow` → `⇒`
- `\xrightarrow{\text{calor}}` → `→ [calor]`

### Greek Letters
- `\alpha` → `α`
- `\beta` → `β`
- `\gamma` → `γ`
- `\pi` → `π`
- `\theta` → `θ`
- `\lambda` → `λ`

### Mathematical Symbols
- `\times` → `×`
- `\div` → `÷`
- `\pm` → `±`
- `\leq` → `≤`
- `\geq` → `≥`
- `\neq` → `≠`
- `\infty` → `∞`
- `\sum` → `∑`
- `\int` → `∫`
- `\sqrt{x^2 + y^2}` → `√x² + y²`

### Fractions
- `\frac{1}{2}` → `½`
- `\frac{1}{3}` → `⅓`
- `\frac{2}{3}` → `⅔`
- `\frac{1}{4}` → `¼`
- `\frac{3}{4}` → `¾`

## Integration Points

### API Endpoints Updated

1. **`app/api/aulas/generate/route.js`**
   - Normalizes content before parsing
   - Uses `normalizeObjectFormulas` for comprehensive processing

2. **`app/api/generate-lesson-professional/route.ts`**
   - Normalizes raw API response
   - Normalizes parsed lesson data

3. **`app/api/generate-quiz/route.ts`**
   - Normalizes quiz content before parsing
   - Normalizes quiz data structure

### System Prompts Enhanced

Updated prompts in:
- `lib/system-prompts/lessons-structured.ts`
- `lib/system-prompts/lessons-professional-pacing.ts`
- `lib/system-prompts/professor.ts`

**New instructions added:**
```
- PROIBIDO usar comandos LaTeX como \text, \xrightarrow, \frac, \alpha, \beta, etc.
- Para fórmulas químicas: use CO₂, H₂O, C₆H₁₂O₆ (Unicode subscripts)
- Para reações: use →, ⇌, ↑, ↓ (setas Unicode)
- Para expoentes: use x², x³, x⁴ (Unicode superscripts)
- Para frações: use ½, ⅓, ¼ (Unicode fractions) ou escreva "um meio", "um terço"
```

## Testing

The implementation includes comprehensive tests covering:

- ✅ Chemical formula conversions
- ✅ Mathematical expression conversions
- ✅ Arrow conversions (including text annotations)
- ✅ Greek letter conversions
- ✅ Mathematical symbol conversions
- ✅ Fraction conversions
- ✅ Text command handling
- ✅ Complex expression handling
- ✅ Edge cases and error handling
- ✅ Object normalization
- ✅ LaTeX detection
- ✅ Logging functionality
- ✅ Real-world examples (photosynthesis, combustion, etc.)

**Test Results:** 28/28 tests passing ✅

## Usage Examples

### Basic Usage
```typescript
import { normalizeFormulas } from '@/lib/utils/latex-normalization';

const text = 'A fotossíntese: 6CO_2 + 6H_2O \\xrightarrow{\\text{luz}} C_6H_{12}O_6 + 6O_2';
const normalized = normalizeFormulas(text);
// Result: 'A fotossíntese: 6CO₂ + 6H₂O → [luz] C₆H₁₂O₆ + 6O₂'
```

### API Integration
```typescript
// In API route
const rawContent = response.choices[0]?.message?.content || '';
const { normalizeObjectFormulas } = await import('@/lib/utils/latex-normalization');
const normalizedContent = normalizeObjectFormulas(rawContent);
const generatedContent = parseGeneratedContent(normalizedContent);
```

### Monitoring
```typescript
import { logLatexDetection } from '@/lib/utils/latex-normalization';

// Log LaTeX detection for monitoring
logLatexDetection(apiResponse, 'lesson-generation');
```

## Benefits

1. **Consistent Display**: All mathematical and chemical expressions display correctly
2. **Better UX**: No raw LaTeX commands visible to users
3. **Robust Processing**: Handles edge cases and complex expressions
4. **Monitoring**: Logs LaTeX detection for prompt improvement
5. **Comprehensive Coverage**: Supports all common LaTeX patterns
6. **Performance**: Efficient regex-based processing
7. **Maintainable**: Well-tested and documented code

## Future Enhancements

1. **Extended Symbol Support**: Add more mathematical and chemical symbols
2. **Custom Mappings**: Allow custom LaTeX-to-Unicode mappings
3. **Performance Optimization**: Cache compiled regex patterns
4. **Analytics**: Track LaTeX usage patterns for prompt optimization
5. **Configuration**: Make normalization behavior configurable

## Troubleshooting

### Common Issues

1. **Double Escaping**: Ensure regex patterns use correct escaping
2. **Order of Operations**: Process complex patterns before simple ones
3. **Edge Cases**: Test with various input formats
4. **Performance**: Monitor processing time for large objects

### Debugging

```typescript
import { containsLatex, logLatexDetection } from '@/lib/utils/latex-normalization';

// Check if text contains LaTeX
if (containsLatex(text)) {
  logLatexDetection(text, 'debug-context');
}
```

## Conclusion

The LaTeX normalization implementation provides a robust solution for converting LaTeX syntax to Unicode characters, ensuring consistent and proper display of mathematical and chemical expressions throughout the application. The comprehensive test suite and monitoring capabilities make it maintainable and reliable for production use.
