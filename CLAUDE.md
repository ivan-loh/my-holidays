# CLAUDE.md

## Project Overview

**my-holidays** — Node.js library for Malaysian public holidays. Look up holidays by year, check if a date is a holiday, list all holidays with state-level regional info. Published on npm as `my-holidays` v1.0.4.

Flat single-file library: `index.js` (entry point), `data.json` (holiday dataset, 2018–2020), plus config/docs.

## Commands

- `npm test` — runs mocha (no test files committed yet)
- No build step, no linter

## Architecture

- Constructor: `new MyHolidays(year)` — defaults to current year
- `check(date)` — returns matching holiday or undefined
- `list()` — returns cloned array of all holidays for the year
- Data in `data.json` keyed by year string; each entry has `date` (YYYYMMDD), `name`, `includes`/`excludes` (state arrays)
- To add a year: add a new key in `data.json` with an array of holiday objects

## Code Conventions

- `'use strict'`, CommonJS modules, 2-space indentation
- Semicolons used consistently
- Prototype-based methods (not class syntax)
- Dependencies: moment (date parsing), lodash (find/clone)

## Git

- Main branch: `master`
- No CI/CD, no branch protection
