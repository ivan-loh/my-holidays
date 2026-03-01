# my-holidays

[![NPM](https://nodei.co/npm/my-holidays.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/my-holidays/)

Malaysian Holidays Calendar

Zero dependencies. Uses only Node.js built-in APIs.

### Usage

List all holidays for a year:

```js
import MyHolidays from 'my-holidays';

const holidays = new MyHolidays(2024);
const list = holidays.list();
```

Check if a date is a holiday:

```js
import MyHolidays from 'my-holidays';

const holidays = new MyHolidays(2024);
const result = holidays.check('2024-01-01');
```

```json
{
  "date": "2024-01-01T00:00:00.000Z",
  "name": "New Year's Day",
  "includes": ["National"],
  "excludes": ["Johor", "Kedah", "Kelantan", "Perlis", "Terengganu"]
}
```

### API

#### `new MyHolidays(year?)`

Creates an instance for the given year. Defaults to the current year. Throws `RangeError` if no data is available for the requested year.

#### `.list()`

Returns a shallow copy of all holidays for the year.

#### `.check(date)`

Accepts a `Date` object or date string. Returns the matching holiday object or `undefined`.

### Data coverage

2018 – 2026

### Source
- [officeholidays](https://www.officeholidays.com/countries/malaysia/)
- [publicholidays](https://publicholidays.com.my/)
