import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';


export function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  disabled = false,
  error = false 
}) {
  const [otpValues, setOtpValues] = useState(
    Array(length).fill('').map((_, i) => value[i] || '')
  );
  const inputRefs = useRef([]);

  // Update internal state when value prop changes
  useEffect(() => {
    const newValues = Array(length).fill('').map((_, i) => value[i] || '');
    setOtpValues(newValues);
  }, [value, length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, inputValue) => {
    // Only allow single digit
    if (inputValue.length > 1) return;
    
    const newValues = [...otpValues];
    newValues[index] = inputValue;
    setOtpValues(newValues);
    
    // Update parent component
    onChange(newValues.join(''));
    
    // Auto-focus next input
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        // Focus previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newValues = [...otpValues];
        newValues[index] = '';
        setOtpValues(newValues);
        onChange(newValues.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newValues = Array(length).fill('').map((_, i) => pastedData[i] || '');
    setOtpValues(newValues);
    onChange(newValues.join(''));
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex justify-center space-x-2">
      {otpValues.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          className={`w-12 h-12 text-center text-lg font-semibold rounded-lg transition-all duration-200 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
            'focus:border-[#445FA2] focus:ring-[#445FA2]'
          }`}
        />
      ))}
    </div>
  );
}