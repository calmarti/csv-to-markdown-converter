# CSV to Markdown Extractor


## Project goal

This project extracts a single press article from a master CSV file and generates a Markdown file.

The JavaScript tools are responsible for deterministic tasks such as reading the CSV and retrieving article data.

You (the agent) are responsible for selecting the appropriate tool, interpreting the results, generating the Markdown according to the template, and presenting it for review.

---

## Project structure

```txt
csv-to-markdown/
├── AGENTS.md
├── README.md
├── package.json
├── tools/
│   ├── search-article.js
│   └── get-article.js
└── output/
```

---

## Tool execution

The project tools are located in:

```txt
tools/
```

When a task requires locating or reading an article, execute the appropriate JavaScript tool instead of implementing the functionality itself.

Do not manually parse the CSV if a project tool exists for the task.

---

## Workflow

When the user requests an article:

1. Determine whether the user identified the article by title, partial title or row number.
2. Run the appropriate tool.
3. If multiple articles match, present the matches and ask the user to choose one.
4. Read the selected row.
5. Generate a Markdown file using the project's frontmatter template.
6. Save the Markdown file in `output/`.
7. Show the generated file to the user for its review

---

## Tool responsibilities

### search-article.js

Responsible only for locating candidate articles.

Input:

* title, passed with `--title`
* partial title, passed with `--partial-title`
* path to csv, passed with `--csv`

Examples:

```sh
node tools/search-article.js --csv /path/to/master.csv --title "Article title"
```
```sh
node tools/search-article.js --csv /path/to/master.csv --partial-title "partial article title"
```

Matching rules:

* Title and partial-title searches are normalized before comparison.
* Normalization is case-insensitive, accent-insensitive, and treats punctuation or other non-alphanumeric characters as word separators.
* `title` must match the normalized CSV title exactly.
* `partial title` must be contained within the normalized CSV title.
* When the user provides only a word or fragment of a title, use `--partial-title`, not `--title`.
* Use `--title` only when the user provides the complete article title.


Output:

* matching CSV row number(s), counted as CSV record numbers including the header row 
* title
* date

Never generates Markdown.

---

### get-article.js

Responsible only for retrieving one complete article.

Input:

* CSV row number, counted as the CSV record number including the header row

Output:

* title
* date
* content

Never generates Markdown.

---

## Agent responsibilities

The agent is responsible for:

* deciding which tool to run
* selecting the correct article
* generating the Markdown
* applying the frontmatter template
* preserving the article text
* choosing the output filename
* saving the Markdown file
* presenting the generated file for review

---

## File rules

The agent may read all files in this project.

The agent may write only inside:

* `output/`

---


## CSV rules

The CSV is read-only.

Never modify, overwrite or re-export it.

The relevant columns are:

* `title`
* `date`
* `content`

Ignore any other columns

If any required column is missing, stop and report the problem.

Do not infer alternative column names.

CSV row numbers refer to CSV record numbers, including the header row. Therefore, the header row is row 1 and the first article row is row 2.



---

## Output rules

Generate one Markdown file per article.

Filename format:

```txt
slug-of-original-article-title-using-only-english-alphabet-letters.md
```
Example of original title:
```txt
Música y petróleo: el sistema del maestro Abreu
```
Example of slug:
```
musica-y-petroleo-el-sistema-del-maestro-abreu
```

Use the project's Markdown template exactly. Never invent or omit frontmatter fields.

Preserve the article text.

Do not summarize, rewrite or interpret the article.

---

### Date format

The CSV date is an ISO-8601 timestamp, for example:

```txt
2023-05-25T12:15:01+02:00
```

Convert that ISO format into the format that will be used in the generated markdown:

```txt
YYYY-MM-DD
```





## Review

After generating the Markdown file:

* show the output path
* show the generated Markdown
* wait for user approval before any further action
