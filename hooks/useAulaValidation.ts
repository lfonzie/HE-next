'use client'

import { useState, useCallback } from 'react'

interface FormData {
  topic: string
  targetLevel?: string
  focusArea?: string
  schoolId?: string
}

interface FormErrors {
  topic?: string
  targetLevel?: string
  focusArea?: string
  schoolId?: string
}

interface ValidationRules {
  topic: {
    required: boolean
    minLength: number
    maxLength: number
    pattern?: RegExp
  }
  targetLevel: {
    required: boolean
    allowedValues: string[]
  }
  focusArea: {
    required: boolean
    maxLength: number
  }
  schoolId: {
    required: boolean
    pattern?: RegExp
  }
}

const DEFAULT_VALIDATION_RULES: ValidationRules = {
  topic: {
    required: true,
    minLength: 5,
    maxLength: 500,
    pattern: /^[a-zA-Z0-9\s\u00C0-\u017F.,!?()-]+$/
  },
  targetLevel: {
    required: false,
    allowedValues: ['Básico', 'Intermediário', 'Avançado', '6º ano', '7º ano', '8º ano', '9º ano', 'Ensino Médio']
  },
  focusArea: {
    required: false,
    maxLength: 200
  },
  schoolId: {
    required: false,
    pattern: /^[a-zA-Z0-9-_]+$/
  }
}

export function useAulaValidation(customRules?: Partial<ValidationRules>) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  
  const rules = { ...DEFAULT_VALIDATION_RULES, ...customRules }

  // Validate individual field
  const validateField = useCallback((field: keyof FormData, value: any): string | null => {
    const rule = rules[field]
    if (!rule) return null

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field} é obrigatório`
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null
    }

    // String length validation
    if (typeof value === 'string') {
      if ('minLength' in rule && value.length < rule.minLength) {
        return `${field} deve ter pelo menos ${rule.minLength} caracteres`
      }
      if ('maxLength' in rule && value.length > rule.maxLength) {
        return `${field} deve ter no máximo ${rule.maxLength} caracteres`
      }
    }

    // Pattern validation
    if ('pattern' in rule && rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        return `${field} contém caracteres inválidos`
      }
    }

    // Allowed values validation
    if ('allowedValues' in rule && rule.allowedValues) {
      if (!rule.allowedValues.includes(value)) {
        return `${field} deve ser um dos valores: ${rule.allowedValues.join(', ')}`
      }
    }

    return null
  }, [rules])

  // Validate entire form
  const validateForm = useCallback((formData: FormData): FormErrors => {
    const newErrors: FormErrors = {}

    Object.keys(formData).forEach(field => {
      const error = validateField(field as keyof FormData, formData[field as keyof FormData])
      if (error) {
        newErrors[field as keyof FormErrors] = error
      }
    })

    setErrors(newErrors)
    return newErrors
  }, [validateField])

  // Validate single field and update errors
  const validateAndSetField = useCallback((field: keyof FormData, value: any) => {
    const error = validateField(field, value)
    
    setErrors(prev => {
      const newErrors = { ...prev }
      if (error) {
        newErrors[field] = error
      } else {
        delete newErrors[field]
      }
      return newErrors
    })

    return !error
  }, [validateField])

  // Mark field as touched
  const touchField = useCallback((field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
  }, [])

  // Check if form is valid
  const isFormValid = useCallback((formData: FormData): boolean => {
    const validationErrors = validateForm(formData)
    return Object.keys(validationErrors).length === 0
  }, [validateForm])

  // Get field error (only if touched)
  const getFieldError = useCallback((field: keyof FormErrors): string | undefined => {
    return touched[field] ? errors[field] : undefined
  }, [errors, touched])

  // Check if field has error
  const hasFieldError = useCallback((field: keyof FormErrors): boolean => {
    return touched[field] && !!errors[field]
  }, [errors, touched])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  // Clear specific field error
  const clearFieldError = useCallback((field: keyof FormErrors) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  // Reset validation state
  const resetValidation = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])

  // Validate on change
  const validateOnChange = useCallback((field: keyof FormData, value: any) => {
    touchField(field)
    return validateAndSetField(field, value)
  }, [touchField, validateAndSetField])

  // Get validation summary
  const getValidationSummary = useCallback(() => {
    const totalFields = Object.keys(rules).length
    const fieldsWithErrors = Object.keys(errors).length
    const touchedFields = Object.keys(touched).length

    return {
      totalFields,
      fieldsWithErrors,
      touchedFields,
      isValid: fieldsWithErrors === 0,
      isComplete: touchedFields === totalFields,
      errorRate: totalFields > 0 ? (fieldsWithErrors / totalFields) * 100 : 0
    }
  }, [rules, errors, touched])

  return {
    // State
    errors,
    touched,
    
    // Actions
    validateForm,
    validateField,
    validateAndSetField,
    validateOnChange,
    touchField,
    clearErrors,
    clearFieldError,
    resetValidation,
    
    // Computed
    isFormValid,
    getFieldError,
    hasFieldError,
    getValidationSummary,
    
    // Rules
    rules
  }
}


