


import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"


export function OTPInput({ length = 6, onChange, onComplete, className }) {
  const [values, setValues] = useState(new Array(length).fill(""))
  const inputRefs = useRef([])

  useEffect(() => {
    const otpValue = values.join("")
    onChange?.(otpValue)

    if (otpValue.length === length) {
      onComplete?.(otpValue)
    }
  }, [values, length, onChange, onComplete])

  const handleChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newValues = [...values]
    newValues[index] = value
    setValues(newValues)

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!values[index] && index > 0) {
        // If current input is empty, focus previous and clear it
        inputRefs.current[index - 1]?.focus()
        const newValues = [...values]
        newValues[index - 1] = ""
        setValues(newValues)
      } else {
        // Clear current input
        const newValues = [...values]
        newValues[index] = ""
        setValues(newValues)
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length)

    if (!/^\d+$/.test(pastedData)) return

    const newValues = [...values]
    for (let i = 0; i < pastedData.length && i < length; i++) {
      newValues[i] = pastedData[i]
    }
    setValues(newValues)

    // Focus the next empty input or the last input
    const nextEmptyIndex = newValues.findIndex((val) => !val)
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className={cn("flex gap-2 sm:gap-3 justify-center", className)}>
      {values.map((value, index) => (
        <Input
          key={index}
          ref={(el) => {inputRefs.current[index] = el}}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-semibold rounded-lg border-2 transition-all duration-200",
            "focus:border-[#445FA2] focus:ring-[#445FA2] focus:ring-2",
            value ? "border-[#445FA2] bg-[#445FA2]/10" : "border-gray-200 bg-white/80",
            "hover:border-[#445FA2]/50 hover:shadow-sm",
            "bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500",
          )}
          autoComplete="one-time-code"
          aria-label={`Enter OTP digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
