import { AnalyzedString } from './types';

// Simple in-memory store (key = sha256 hash)
const store: Record<string, AnalyzedString> = {};

export const saveString = (analyzed: AnalyzedString): void => {
  store[analyzed.id] = analyzed;
};

export const getStringById = (id: string): AnalyzedString | undefined => {
  return store[id];
};

export const getStringByValue = (value: string): AnalyzedString | undefined => {
  const id = require('./utils').sha256(value);
  return store[id];
};

export const getAllStrings = (): AnalyzedString[] => {
  return Object.values(store);
};

export const deleteStringById = (id: string): boolean => {
  if (store[id]) {
    delete store[id];
    return true;
  }
  return false;
};
