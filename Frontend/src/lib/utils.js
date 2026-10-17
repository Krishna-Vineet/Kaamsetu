import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes properly
 * @param {...string} inputs - Class names or conditional class objects
 * @returns {string} - Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a readable string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options
  }
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions)
}

/**
 * Truncates a string to a specified length and adds ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated string
 */
export function truncateString(str, length = 50) {
  if (!str || str.length <= length) return str
  return `${str.substring(0, length)}...`
}