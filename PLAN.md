# Modernization Plan: my-holidays

## Guiding Principles
- **Pragmatic**: Only change what delivers real value. No yak-shaving.
- **Performant**: Drop heavy dependencies in favor of built-in APIs.
- **Lightweight**: Zero runtime dependencies. The current `node_modules` pulls in lodash (~600 files) and moment (~400 files) for two trivial operations.

---

## Changes

### 1. Drop lodash and moment — zero runtime dependencies

**Why**: This is the single highest-impact change. `lodash` is used for `_.find()` and `_.clone()`, both of which are trivially replaced by native JS. `moment` is used only to parse `YYYYMMDD` strings — a simple string slice does the same thing. Both libraries are officially in maintenance mode and are not recommended for new projects.

**How**:
- `_.find(arr, {date})` → `arr.find(h => h.date.getTime() === target.getTime())`
- `_.clone(arr)` → `[...this.holidays]` (shallow copy of array, same semantics)
- `moment(str, 'YYYYMMDD').toDate()` → `new Date(str.slice(0,4), str.slice(4,6) - 1, str.slice(6,8))` (zero-alloc date parsing)
- `moment().format('YYYY')` → `new Date().getFullYear().toString()`

Result: **0 production dependencies**, install goes from ~1000 files to just this package.

### 2. ES Modules + modern class syntax

**Why**: Node 22 has had stable ESM for years. `"type": "module"` is the idiomatic default for new packages. Constructor-function + `.prototype` is outdated.

**How**:
- Add `"type": "module"` to `package.json`
- Rewrite `index.js` to use `export default class MyHolidays` with `import` for `data.json` (with `assert { type: 'json' }` or the newer `with { type: 'json' }` import attribute)
- Use `class` with a real constructor and methods

### 3. Harden the constructor

**Why**: Currently `new MyHolidays(2025)` silently sets `this.holidays` to `undefined`, then crashes on `.forEach()`. A clear error is better.

**How**: Throw a `RangeError` if the requested year isn't in the dataset. One `if` statement — minimal code.

### 4. Change date strings in data.json to ISO 8601 `YYYY-MM-DD`

**Why**: `20180101` is a non-standard format. `YYYY-MM-DD` is universally understood by `new Date()` and every other tool. This removes the need for manual string slicing in the parser.

**How**: Simple find-and-replace across data.json: `"20180101"` → `"2018-01-01"`, etc.

> **Note**: Actually, `new Date("2018-01-01")` parses as UTC midnight, which may shift the date in local timezones. The manual slice approach `new Date(y, m-1, d)` produces local midnight, which is more correct for calendar dates. So we'll keep the `YYYYMMDD` format and use the slice parser. This avoids a subtle timezone bug. **Skipping this change.**

### 5. Add `"engines"` field to package.json

**Why**: Signals minimum Node.js version. ESM + import attributes need Node >= 18.20.

**How**: Add `"engines": { "node": ">=18.20.0" }`.

### 6. Add `"exports"` field to package.json

**Why**: The modern replacement for `"main"`. Controls the public API surface and works properly with ESM.

**How**: Add `"exports": { ".": "./index.js" }`.

### 7. Modernize test setup

**Why**: mocha 5 is ancient. The Node.js built-in test runner (`node --test`) has been stable since Node 18 and requires zero dependencies.

**How**:
- Replace mocha + should with `node:test` + `node:assert`
- Write a small test file covering `list()`, `check()`, and the invalid-year error
- Update `"scripts": { "test": "node --test" }`
- Remove mocha and should from devDependencies

### 8. Bump version to 2.0.0

**Why**: Switching from CJS to ESM and from constructor function to class is a breaking change for consumers. Semver requires a major bump.

---

## What we're NOT doing (and why)

| Temptation | Why not |
|---|---|
| TypeScript | Adds build step, config files, and complexity for 30 lines of code. Not worth it. |
| JSDoc types | Can add later if needed; the API is tiny and self-documenting. |
| Bundler/rollup | Nothing to bundle. Single file. |
| Prettier/ESLint config | Nice-to-have but out of scope for a 30-line library. |
| CI/CD pipeline | Out of scope — no GitHub Actions in the repo today. |
| Converting data.json to a database | Over-engineering. JSON import is instant. |

---

## Final file layout (unchanged structure)

```
my-holidays/
├── index.js          # ESM, class-based, zero deps
├── index.test.js     # node:test based
├── data.json         # unchanged
├── package.json      # type:module, exports, engines, 0 deps
├── README.md         # updated examples
├── LICENSE
└── .gitignore
```

## Resulting index.js (approximate)

```js
import dataset from './data.json' with { type: 'json' };

export default class MyHolidays {
  constructor(year) {
    const key = year != null ? String(year) : String(new Date().getFullYear());
    const data = dataset[key];
    if (!data) {
      throw new RangeError(`No holiday data for year ${key}`);
    }
    this.holidays = data.map(h => ({
      ...h,
      date: new Date(+h.date.slice(0, 4), +h.date.slice(4, 6) - 1, +h.date.slice(6, 8)),
    }));
  }

  check(date) {
    const t = new Date(date).setHours(0, 0, 0, 0);
    return this.holidays.find(h => h.date.getTime() === t);
  }

  list() {
    return [...this.holidays];
  }
}
```
