/**
 * Currency formatting utilities for Sri Lankan Rupees (LKR)
 */

/**
 * Formats a number as Sri Lankan Rupees with proper comma separators
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @param showCode - Whether to show the currency code (default: false)
 * @returns Formatted currency string
 */
export const formatLKR = (
  amount: number | string, 
  showSymbol: boolean = true, 
  showCode: boolean = false
): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return showSymbol ? 'Rs. 0.00' : '0.00';
  }

  // Format with Sri Lankan number formatting (comma separation)
  const formattedNumber = numericAmount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (showSymbol && showCode) {
    return `Rs. ${formattedNumber} LKR`;
  } else if (showSymbol) {
    return `Rs. ${formattedNumber}`;
  } else if (showCode) {
    return `${formattedNumber} LKR`;
  } else {
    return formattedNumber;
  }
};

/**
 * Formats currency for display in tables and compact views
 * @param amount - The amount to format
 * @returns Compact currency string
 */
export const formatLKRCompact = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return 'Rs. 0';
  }

  // For large amounts, show in millions/billions
  if (numericAmount >= 1000000000) {
    return `Rs. ${(numericAmount / 1000000000).toFixed(1)}B`;
  } else if (numericAmount >= 1000000) {
    return `Rs. ${(numericAmount / 1000000).toFixed(1)}M`;
  } else if (numericAmount >= 100000) {
    return `Rs. ${(numericAmount / 100000).toFixed(1)}L`; // Lakhs
  } else if (numericAmount >= 1000) {
    return `Rs. ${(numericAmount / 1000).toFixed(1)}K`;
  } else {
    return `Rs. ${numericAmount.toFixed(0)}`;
  }
};

/**
 * Parses a LKR formatted string back to a number
 * @param lkrString - The LKR formatted string
 * @returns Numeric value
 */
export const parseLKR = (lkrString: string): number => {
  // Remove currency symbols and whitespace
  const cleanString = lkrString
    .replace(/Rs\.?/gi, '')
    .replace(/LKR/gi, '')
    .replace(/,/g, '')
    .replace(/\s/g, '');
  
  return parseFloat(cleanString) || 0;
};

/**
 * Validates if a string represents a valid LKR amount
 * @param value - The value to validate
 * @returns Boolean indicating if valid
 */
export const isValidLKRAmount = (value: string): boolean => {
  const parsed = parseLKR(value);
  return !isNaN(parsed) && parsed >= 0;
};

/**
 * Currency input formatting for form fields
 * @param value - The input value
 * @returns Formatted input value
 */
export const formatLKRInput = (value: string): string => {
  // Remove all non-numeric characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  
  // Limit to 2 decimal places
  if (parts[1] && parts[1].length > 2) {
    return `${parts[0]}.${parts[1].substring(0, 2)}`;
  }
  
  return cleanValue;
};

/**
 * Get currency symbol for Sri Lankan Rupees
 */
export const LKR_SYMBOL = 'Rs.';

/**
 * Get currency code for Sri Lankan Rupees
 */
export const LKR_CODE = 'LKR';

/**
 * Common Sri Lankan pricing tiers for healthcare services
 */
export const COMMON_LKR_AMOUNTS = {
  CONSULTATION_FEE: 2500,        // Rs. 2,500
  SPECIALIST_FEE: 5000,          // Rs. 5,000
  EMERGENCY_FEE: 7500,           // Rs. 7,500
  TREATMENT_BASIC: 1500,         // Rs. 1,500
  TREATMENT_ADVANCED: 15000,     // Rs. 15,000
  SURGERY_MINOR: 50000,          // Rs. 50,000
  SURGERY_MAJOR: 250000,         // Rs. 250,000
  ROOM_CHARGE_GENERAL: 3000,     // Rs. 3,000 per day
  ROOM_CHARGE_PRIVATE: 8000,     // Rs. 8,000 per day
  MEDICATION_BASIC: 500,         // Rs. 500
  LAB_TEST_BASIC: 1000,          // Rs. 1,000
  LAB_TEST_ADVANCED: 5000,       // Rs. 5,000
};