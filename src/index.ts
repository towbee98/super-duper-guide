import express from 'express';
import { sha256, isPalindrome, charFrequency, parseNaturalQuery } from './utils';
import {
  saveString,
  getStringByValue,
  getAllStrings,
  deleteStringById,
} from './storage';
import { AnalyzedString, StringProperties } from './types';

type Request = express.Request;
type Response = express.Response;

const app = express();
app.use(express.json());

// POST /strings
app.post('/strings', (req: Request, res: Response) => {
  const { value } = req.body;

  // Validation
  if (value === undefined) {
    return res.status(400).json({ error: 'Missing "value" field' });
  }
  if (typeof value !== 'string') {
    return res.status(422).json({ error: '"value" must be a string' });
  }

  // Check if already exists
  const existing = getStringByValue(value);
  if (existing) {
    return res.status(409).json({ error: 'String already exists' });
  }

  // Compute properties
  const hash = sha256(value);
  const freqMap = charFrequency(value);
  const props: StringProperties = {
    length: value.length,
    is_palindrome: isPalindrome(value),
    unique_characters: Object.keys(freqMap).length,
    word_count: value.trim() === '' ? 0 : value.trim().split(/\s+/).length,
    sha256_hash: hash,
    character_frequency_map: freqMap,
  };

  const analyzed: AnalyzedString = {
    id: hash,
    value,
    properties: props,
    created_at: new Date().toISOString(),
  };

  saveString(analyzed);
  return res.status(201).json(analyzed);
});

// GET /strings/:value
app.get('/strings/:value', (req: Request, res: Response) => {
  const value = req.params.value;
  const record = getStringByValue(value);
  if (!record) {
    return res.status(404).json({ error: 'String not found' });
  }
  return res.json(record);
});

// GET /strings (with filters)
app.get('/strings', (req: Request, res: Response) => {
  const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;
  let data = getAllStrings();

  // Apply filters
  if (is_palindrome !== undefined) {
    const flag = is_palindrome === 'true';
    data = data.filter(s => s.properties.is_palindrome === flag);
  }
  if (min_length !== undefined) {
    const min = parseInt(min_length as string, 10);
    if (isNaN(min)) return res.status(400).json({ error: 'Invalid min_length' });
    data = data.filter(s => s.properties.length >= min);
  }
  if (max_length !== undefined) {
    const max = parseInt(max_length as string, 10);
    if (isNaN(max)) return res.status(400).json({ error: 'Invalid max_length' });
    data = data.filter(s => s.properties.length <= max);
  }
  if (word_count !== undefined) {
    const wc = parseInt(word_count as string, 10);
    if (isNaN(wc)) return res.status(400).json({ error: 'Invalid word_count' });
    data = data.filter(s => s.properties.word_count === wc);
  }
  if (contains_character !== undefined) {
    const char = (contains_character as string).charAt(0);
    data = data.filter(s => s.value.includes(char));
  }

  const filters_applied = {
    is_palindrome: is_palindrome ? is_palindrome === 'true' : undefined,
    min_length: min_length ? parseInt(min_length as string, 10) : undefined,
    max_length: max_length ? parseInt(max_length as string, 10) : undefined,
    word_count: word_count ? parseInt(word_count as string, 10) : undefined,
    contains_character: contains_character ? (contains_character as string).charAt(0) : undefined,
  };

  return res.json({
    data,
    count: data.length,
    filters_applied,
  });
});

// GET /strings/filter-by-natural-language
app.get('/strings/filter-by-natural-language', (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "query" parameter' });
  }

  try {
    const parsed = parseNaturalQuery(query);
    // Reuse the main /strings endpoint logic with parsed filters
    let data = getAllStrings();

    if (parsed.is_palindrome !== undefined) {
      data = data.filter(s => s.properties.is_palindrome === parsed.is_palindrome);
    }
    if (parsed.min_length !== undefined) {
      data = data.filter(s => s.properties.length >= parsed.min_length);
    }
    if (parsed.word_count !== undefined) {
      data = data.filter(s => s.properties.word_count === parsed.word_count);
    }
    if (parsed.contains_character !== undefined) {
      data = data.filter(s => s.value.includes(parsed.contains_character));
    }

    return res.json({
      data,
      count: data.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsed,
      },
    });
  } catch (err) {
    return res.status(400).json({ error: 'Unable to parse natural language query' });
  }
});

// DELETE /strings/:value
app.delete('/strings/:value', (req: Request, res: Response) => {
  const value = req.params.value;
  const record = getStringByValue(value);
  if (!record) {
    return res.status(404).json({ error: 'String not found' });
  }
  deleteStringById(record.id);
  return res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ String Analyzer running on port ${PORT}`);
});
