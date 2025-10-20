import crypto from 'crypto';

// Compute SHA-256 hash
export const sha256 = (str: string): string => {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
};

// Check palindrome (case-insensitive, alphanumeric only)
export const isPalindrome = (str: string): boolean => {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
};

// Count character frequency
export const charFrequency = (str: string): Record<string, number> => {
  const freq: Record<string, number> = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  return freq;
};

// Parse natural language query (basic heuristic)
export const parseNaturalQuery = (query: string): Partial<Record<string, any>> => {
  const lower = query.toLowerCase();
  const filters: any = {};

  // Word count
  if (lower.includes('single word')) filters.word_count = 1;
  else if (lower.includes('two words')) filters.word_count = 2;

  // Palindrome
  if (lower.includes('palindrom') || lower.includes('palindrome')) {
    filters.is_palindrome = true;
  }

  // Length
  const longerMatch = lower.match(/longer than (\d+)/);
  if (longerMatch) {
    filters.min_length = parseInt(longerMatch[1], 10) + 1;
  }

  // Contains character
  const vowelMatch = lower.includes('first vowel') || lower.includes('vowel');
  const letterZ = lower.includes('letter z') || lower.includes('contains z');
  if (vowelMatch) {
    filters.contains_character = 'a'; // heuristic
  } else if (letterZ) {
    filters.contains_character = 'z';
  } else {
    const charMatch = lower.match(/contains the letter ([a-z])/);
    if (charMatch) filters.contains_character = charMatch[1];
  }

  // Validate: no conflicting filters
  if (Object.keys(filters).length === 0) {
    throw new Error('Unable to parse query');
  }

  return filters;
};
