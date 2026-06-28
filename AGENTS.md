# Project instructions

## Project goal

This project converts one article row from an external CSV file into one clean, readable Markdown file 

The CSV contains press articles. Each row represents one article and the following are the columns relevant to this project:

* title
* date
* content


## Main workflow

When the user asks to extract, convert, or generate an specific article from the CSV:

1. Read the external CSV file.
2. Locate the requested article by title
3. If there are multiple plausible matches, show the matches and ask the user to choose.
4. Extract the article title, date, and full article content.
5. Generate one Markdown file in `output/` folder.
6. Use the required YAML frontmatter.
7. Do not modify the CSV.
8. Show the path of the created Markdown file.
9. Show the generated file content to the user so he can review it and aprove it or not

## Project structure

```txt
extractor-articulos/
├── AGENTS.md
├── README.md
├── package.json
├── package-lock.json
├── scripts/
│   └── extraer-articulo.js
└── salida/
    └── articulos/
```

## Commands

Use the Node script for extraction:

```bash
node scripts/extraer-articulo.js --titulo "<article title>"
```

The script should read the CSV path from either:

1. a command-line argument:

```bash
--csv "/absolute/path/to/file.csv"
```

or

2. an environment variable:

```bash
CSV_PATH="/absolute/path/to/file.csv"
```

Prefer the environment variable if already configured.

## File rules

Allowed to read all the files inside this project.

Allowed to write:

* `output/`

Do not write anywhere else unless the user explicitly asks.

## CSV rules

## CSV rules

The CSV is read-only.

Never modify, normalize, overwrite, or re-export the CSV.

These are the 3 relavant headers:

- `title`
- `date`
- `content`

Ignore `url` header

If any of these headers is missing, stop and report the problem.

Do not infer alternative column names.

## Output filename rules

Generated Markdown files must go in:

```txt
output/
```

Filename format:

```txt
title-slug-in-original-language.md
```

Example:

```txt
la-tercera-vida-de-teodoro-petkoff.md
```

Slug rules:

1. lowercase
2. remove accents
3. convert `ñ` to `n`
4. remove punctuation
5. replace spaces with hyphens
6. collapse repeated hyphens
7. trim leading/trailing hyphens


## Markdown output format

Each generated file must use this structure:

```md
---
titulo: "<article title>"
fecha: "<YYYY-MM-DD or empty>"
tipo: "articulo-prensa"
estado: "fuente"
origen_csv: "<external CSV path>"
fila_csv: "<row number if known>"
---

# <article title>

<full article content>
```

Do not summarize the article.

Do not rewrite the article.

Do not correct the author's style.

Only normalize line breaks enough to make the Markdown readable.

## Safety rules

Never modify:

* the external CSV
* files outside `salida/articulos/`
* the second brain project
* already generated Markdown files unless the user explicitly asks to overwrite or regenerate

If a target Markdown file already exists, do not overwrite silently.

Instead, report:

```txt
File already exists: <path>
```

and ask whether to overwrite, create a new filename, or stop.

## Review rules

After creating a Markdown file, always show:

```bash
git status
git diff -- salida/articulos/
```

If the file is untracked and `git diff` does not show it, show the created file path and enough content for review.

The user reviews every generated file manually.

## Error handling

If no article matches, say so and suggest using a partial title, exact date, or row number.

If several articles match, show a short numbered list with:

* row number
* title
* date

Then wait for the user to choose.

If the article content cell is empty, create no file and report the issue.
