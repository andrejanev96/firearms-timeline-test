/**
 * Email validation utilities
 */

/** Common disposable email domains to block */
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  '0-mail.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
];

/** RFC 5322 compliant email regex pattern */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/** Maximum email length per RFC 5321 */
const MAX_EMAIL_LENGTH = 254;

/**
 * Validates email format according to RFC 5322
 */
export const validateEmailFormat = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validates email length
 */
export const validateEmailLength = (email: string): boolean => {
  return email.length <= MAX_EMAIL_LENGTH;
};

/**
 * Validates email domain has proper structure
 */
export const validateEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1];
  return !!(domain && domain.length >= 3 && domain.includes('.'));
};

/**
 * Checks if email is from a disposable email service
 */
export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
};

/**
 * Comprehensive email validation with detailed error messages
 */
export const validateEmail = (
  email: string
): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (!validateEmailFormat(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  if (!validateEmailLength(email)) {
    return { valid: false, error: 'Email address is too long' };
  }

  if (!validateEmailDomain(email)) {
    return { valid: false, error: 'Please enter a valid email domain' };
  }

  if (isDisposableEmail(email)) {
    return { valid: false, error: 'Please use a permanent email address' };
  }

  return { valid: true };
};

/**
 * React Hook Form compatible validation rules
 */
export const emailValidationRules = {
  required: 'Email is required',
  validate: {
    validFormat: (value: string) => {
      return validateEmailFormat(value) || 'Please enter a valid email address';
    },
    validLength: (value: string) => {
      return validateEmailLength(value) || 'Email address is too long';
    },
    validDomain: (value: string) => {
      return validateEmailDomain(value) || 'Please enter a valid email domain';
    },
    noDisposable: (value: string) => {
      return !isDisposableEmail(value) || 'Please use a permanent email address';
    },
  },
};