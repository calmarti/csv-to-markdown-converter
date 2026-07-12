#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Readable } from 'node:stream';
import csvParser from 'csv-parser';

function parseArgs(argv) {

  const options = {
    csv: null,
    title: null,
    partialTitle: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--csv':
        options.csv = argv[index + 1] ?? null;
        index += 1;
        break;
      case '--title':
        options.title = argv[index + 1] ?? null;
        index += 1;
        break;
      case '--partial-title':
        options.partialTitle = argv[index + 1] ?? null;
        index += 1;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function parseCsv(content) {
  return new Promise((resolve, reject) => {
    const rows = [];
    let headers = [];
    let rowNumber = 1;

    Readable.from([content])
      .pipe(csvParser({
        mapHeaders: ({ header }) => header.trim(),
      }))
      .on('headers', (parsedHeaders) => {
        headers = parsedHeaders;
      })
      .on('data', (row) => {
        rowNumber += 1;
        rows.push({ rowNumber, ...row });
      })
      .on('error', reject)
      .on('end', () => {
        resolve({ headers, rows });
      });
  });
}

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildMatches(rows, criteria) {
  const normalizedTitle = normalize(criteria.title);
  const normalizedPartialTitle = normalize(criteria.partialTitle);

  return rows.filter((row) => {
    const titleMatches = normalizedTitle
      ? normalize(row.title) === normalizedTitle
      : true;
    const partialTitleMatches = normalizedPartialTitle
      ? normalize(row.title).includes(normalizedPartialTitle)
      : true;

    return titleMatches && partialTitleMatches;
  });
}

async function validateAndReadCsv(csvPath) {
  if (!csvPath) {
    throw new Error('A CSV file path is required.');
  }

  const resolvedPath = path.resolve(csvPath);
  const content = readFileSync(resolvedPath, 'utf8');
  const { headers, rows } = await parseCsv(content);

  const requiredHeaders = ['title', 'date', 'content'];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  return rows;
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const rows = await validateAndReadCsv(options.csv);
    const matches = buildMatches(rows, {
      title: options.title,
      partialTitle: options.partialTitle,
    });

    const output = {
      matches: matches.map((row) => ({
        rowNumber: row.rowNumber,
        title: row.title,
        date: row.date,
      })),
    };

    process.stdout.write(`${JSON.stringify(output)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

main();
