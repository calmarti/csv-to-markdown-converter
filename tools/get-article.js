#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Readable } from 'node:stream';
import csvParser from 'csv-parser';

function parseArgs(argv) {
  const options = {
    csv: null,
    row: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--csv':
        options.csv = argv[index + 1] ?? null;
        index += 1;
        break;
      case '--row':
        options.row = argv[index + 1] ?? null;
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

function parseRowNumber(value) {
  if (!value) {
    throw new Error('A CSV row number is required.');
  }

  const rowNumber = Number(value);

  if (!Number.isInteger(rowNumber)) {
    throw new Error('CSV row number must be an integer.');
  }

  if (rowNumber < 2) {
    throw new Error('CSV row number must refer to an article row, not the header row.');
  }

  return rowNumber;
}

function getArticleByRowNumber(rows, rowNumber) {
  const article = rows.find((row) => row.rowNumber === rowNumber);

  if (!article) {
    throw new Error(`No article found at CSV row number: ${rowNumber}`);
  }

  return {
    title: article.title,
    date: article.date,
    content: article.content,
  };
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const rowNumber = parseRowNumber(options.row);
    const rows = await validateAndReadCsv(options.csv);
    const article = getArticleByRowNumber(rows, rowNumber);

    process.stdout.write(`${JSON.stringify({ article })}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

main();
