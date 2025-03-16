import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility functions for the OpenFisca Editor application
 * @module lib/utils
 */

/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @param {string} [locale='ja-JP'] - The locale to use for formatting
 * @param {string} [currency='JPY'] - The currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value: number, locale = "ja-JP", currency = "JPY"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format a percentage
 * @param {number} value - The number to format as percentage (0-1)
 * @param {string} [locale='ja-JP'] - The locale to use for formatting
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value: number, locale = "ja-JP"): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Debounce a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>): void => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Parse YAML content
 * @param {string} content - YAML content to parse
 * @returns {any} Parsed YAML object
 */
export function parseYaml(content: string): any {
  try {
    // This is a placeholder. In a real implementation, you would use a library like js-yaml
    // For now, we'll just return a mock object
    return {
      parsed: true,
      content,
    }
  } catch (error) {
    console.error("Error parsing YAML:", error)
    throw new Error("Invalid YAML format")
  }
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

