# my-holidays

[![NPM](https://nodei.co/npm/my-holidays.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/my-holidays/)

Malaysian Holidays Calendar. Zero dependencies.

### Sample

List all holidays

```js
import MyHolidays from 'my-holidays';
const holidays = new MyHolidays(2026);
holidays.list();
```

Check date for holiday

```js
const result = holidays.check('2026-01-01');
```

```json
{
  "date": "2026-01-01T00:00:00.000Z",
  "name": "New Year's Day",
  "includes": ["National"],
  "excludes": ["Johor", "Kedah", "Kelantan", "Perlis", "Terengganu"],
  "category": "national",
  "replacement": false
}
```

### API

#### `new MyHolidays(year?)`

Creates instance for given year. Defaults to current year. Throws `RangeError` if year not available.

#### `MyHolidays.years()`

Returns available years as sorted number array.

#### `.list(state?)`

List holidays. Pass a state name to filter (e.g. `'Selangor'`, `'Sabah'`).

#### `.check(date, state?)`

Check if a date is a holiday. Accepts `Date` object or date string.

#### `.between(startDate, endDate, state?)`

Get holidays within a date range.

#### `.next(date?, state?)`

Get next upcoming holiday from a given date. Defaults to today.

#### `.isBusinessDay(date, state?)`

Weekend + holiday aware. Handles Fri-Sat weekends for Kelantan, Terengganu, Kedah and Johor's 2025 switch back to Sat-Sun.

#### `.businessDays(startDate, endDate, state?)`

Count business days between two dates.

### Holiday metadata

Each holiday includes computed fields:

- `category` — `'islamic'`, `'cultural'`, `'national'`, or `'state'`
- `replacement` — `true` if this is a replacement/in-lieu holiday

### Data coverage

2018 — 2026

### Source
- [officeholidays](https://www.officeholidays.com/countries/malaysia/)
- [publicholidays](https://publicholidays.com.my/)
- [timeanddate](https://www.timeanddate.com/holidays/malaysia/)
