import { useState } from 'react';

/**
 * A custom hook for form validation that's used across various forms.
 * Standardizes error handling and validation logic.
 * 
 * @param initialErrors Initial error state
 * @returns Object containing errors, validate function, and setErrors function
 */
export default function useFormValidation<T extends object>(initialErrors: Partial<T> = {}) {
  const [errors, setErrors] = useState<Partial<T>>(initialErrors);
  
  /**
   * Validates form data against specified rules
   * 
   * @param data Form data to validate
   * @param rules Validation rules for each field
   * @returns Whether the form is valid
   */
  const validate = (data: T, rules: Record<keyof T, (val: any) => string | null>) => {
    const newErrors: Partial<T> = {};
    let isValid = true;
    
    for (const field in rules) {
      if (Object.prototype.hasOwnProperty.call(rules, field)) {
        const error = rules[field](data[field]);
        if (error) {
          newErrors[field] = error as any;
          isValid = false;
        }
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  return { errors, validate, setErrors };
}