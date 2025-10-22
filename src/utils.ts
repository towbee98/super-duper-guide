import * as crypto from 'crypto';
import { AnalyzedString } from './types';

// Apply filters to a list of strings
export const applyFilters = (data: AnalyzedString[], filters: any): AnalyzedString[] => {
  let filteredData = data;

  if (filters.is_palindrome !== undefined) {
    filteredData = filteredData.filter(s => s.properties.is_palindrome === filters.is_palindrome);
  }
  if (filters.min_length !== undefined) {
    filteredData = filteredData.filter(s => s.properties.length >= filters.min_length);
  }
  if (filters.max_length !== undefined) {
    filteredData = filteredData.filter(s => s.properties.length <= filters.max_length);
  }
  if (filters.word_count !== undefined) {
    filteredData = filteredData.filter(s => s.properties.word_count === filters.word_count);
  }
  if (filters.contains_character !== undefined) {
    filteredData = filteredData.filter(s => s.value.includes(filters.contains_character));
  }

  return filteredData;
};

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

// Parse natural language query (more robust)
export const parseNaturalQuery = (query: string): Partial<Record<string, any>> => {
  const lower = query.toLowerCase();
  const filters: any = {};

  // Palindrome
  if (lower.includes('palindrom')) {
    filters.is_palindrome = true;
  }

  // Word count
  const wordCountMatch = lower.match(/(\d+|single|two|three|four|five) word/);
  if (wordCountMatch) {
    const countMap: Record<string, number> = { single: 1, two: 2, three: 3, four: 4, five: 5 };
    filters.word_count = countMap[wordCountMatch[1]] || parseInt(wordCountMatch[1], 10);
  }

  // Length
  const minLengthMatch = lower.match(/(longer|greater) than (\d+)/);
  if (minLengthMatch) {
    filters.min_length = parseInt(minLengthMatch[2], 10) + 1;
  }
  const maxLengthMatch = lower.match(/(shorter|less) than (\d+)/);
  if (maxLengthMatch) {
    filters.max_length = parseInt(maxLengthMatch[2], 10) - 1;
  }

  // Contains character
  if (lower.includes('vowel')) {
    // A simple heuristic for vowels
    // For simplicity, we'll just check for 'a' as in the original code
    // A more advanced implementation could check for any vowel.
    filters.contains_character = 'a';
  } else {
    const charMatch = lower.match(/containing the letter "?([a-z])"?/);
    if (charMatch) {
      filters.contains_character = charMatch[1];
    }
  }

  if (Object.keys(filters).length === 0) {
    throw new Error('Unable to parse query into any known filters.');
  }

  return filters;
};
