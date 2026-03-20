# CLAUDE.md

## Project Overview

**my-holidays** is a Node.js library that provides a Malaysian public holidays calendar API. It allows looking up holidays by year, checking if a specific date is a holiday, and listing all holidays with regional information (Malaysian states).

Published on npm as `my-holidays` (v1.0.4).

## Repository Structure

```
my-holidays/
├── index.js       # Main library entry point (~30 lines)
├── data.json      # Holiday dataset organized by year (2018-2020)
├── package.json   # npm configuration
├── README.md      # Usage documentation
├── LICENSE         # MIT License
└── .gitignore     # Node.js ignores
```

This is a flat, single-file library with no subdirectories for source code.

## Tech Stack

- **Runtime:** Node.js (ES5+ JavaScript, CommonJS modules)
- **Dependencies:** moment (date parsing), lodash (find/clone utilities)
- **Test framework:** mocha + should (configured but no test files committed)

## Commands

- **Run tests:** `npm test` (runs `mocha --recursive` with `NODE_ENV=testing`)
- **No build step** — the library is plain JavaScript, no transpilation needed
- **No linter configured**

## Architecture & Code Patterns

- Constructor pattern: `new MyHolidays(year)` — defaults to current year via moment
- Prototype methods: `check(date)` returns a matching holiday object, `list()` returns a cloned array
- Holiday data lives in `data.json`, keyed by year string (e.g., `"2018"`)
- Each holiday entry has: `date` (YYYYMMDD string), `name`, `includes` (states), `excludes` (states)
- Dates are parsed from YYYYMMDD strings to JS Date objects on construction

## Code Conventions

- `'use strict'` at top of files
- CommonJS `require`/`module.exports`
- 2-space indentation
- Spaces around arrow functions and inside parentheses of forEach
- No semicolons are inconsistently used (semicolons are present)

## Data Format (data.json)

```json
{
  "2020": [
    {
      "date": "20200101",
      "name": "New Year's Day",
      "includes": ["National"],
      "excludes": ["Johor", "Kedah", "Kelantan", "Perlis", "Terengganu"]
    }
  ]
}
```

To add a new year, add a new key with the year string and an array of holiday objects.

## Git Workflow

- Main branch: `master`
- No CI/CD pipeline configured
- No branch protection or automated checks
