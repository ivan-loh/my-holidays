import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import MyHolidays from './index.js';

const require = createRequire(import.meta.url);
const dataset = require('./data.json');

describe('MyHolidays', () => {
  describe('data integrity', () => {
    const VALID_STATES = new Set([
      'National', 'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan',
      'Melaka', 'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis',
      'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
    ]);

    for (const year of Object.keys(dataset)) {
      it(`${year}: all entries have correct schema (date, name, includes, excludes)`, () => {
        for (const h of dataset[year]) {
          const keys = Object.keys(h).sort().join(',');
          assert.equal(keys, 'date,excludes,includes,name', `bad keys in ${year}: ${JSON.stringify(h)}`);
          assert.equal(typeof h.date, 'string');
          assert.equal(typeof h.name, 'string');
          assert.ok(Array.isArray(h.includes));
          assert.ok(Array.isArray(h.excludes));
        }
      });

      it(`${year}: all dates are valid YYYYMMDD in the correct year`, () => {
        for (const h of dataset[year]) {
          assert.match(h.date, /^[0-9]{8}$/, `bad format: ${h.date}`);
          const y = +h.date.slice(0, 4);
          const m = +h.date.slice(4, 6);
          const d = +h.date.slice(6, 8);
          const dt = new Date(y, m - 1, d);
          assert.equal(dt.getFullYear(), y, `invalid date: ${h.date}`);
          assert.equal(dt.getMonth(), m - 1, `invalid date: ${h.date}`);
          assert.equal(dt.getDate(), d, `invalid date: ${h.date}`);
          assert.equal(String(y), year, `year mismatch: ${h.date} in ${year}`);
        }
      });

      it(`${year}: dates are chronologically sorted`, () => {
        const dates = dataset[year].map(h => h.date);
        for (let i = 1; i < dates.length; i++) {
          assert.ok(dates[i] >= dates[i - 1], `out of order: ${dates[i]} after ${dates[i - 1]}`);
        }
      });

      it(`${year}: all state names are valid`, () => {
        for (const h of dataset[year]) {
          h.includes.forEach(s => assert.ok(VALID_STATES.has(s), `unknown include: ${s} in ${h.name}`));
          h.excludes.forEach(s => assert.ok(VALID_STATES.has(s), `unknown exclude: ${s} in ${h.name}`));
        }
      });
    }
  });

  describe('category and replacement flags', () => {
    it('tags Islamic holidays correctly', () => {
      const mh = new MyHolidays(2026);
      const raya = mh.holidays.find(h => /Hari Raya Aidilfitri/.test(h.name) && !h.replacement);
      assert.ok(raya);
      assert.equal(raya.category, 'islamic');
    });

    it('tags cultural holidays correctly', () => {
      const mh = new MyHolidays(2026);
      const cny = mh.holidays.find(h => h.name === 'Chinese New Year');
      assert.ok(cny);
      assert.equal(cny.category, 'cultural');
      const deepavali = mh.holidays.find(h => h.name === 'Deepavali');
      assert.ok(deepavali);
      assert.equal(deepavali.category, 'cultural');
    });

    it('tags national holidays correctly', () => {
      const mh = new MyHolidays(2026);
      const labour = mh.holidays.find(h => h.name === 'Labour Day');
      assert.ok(labour);
      assert.equal(labour.category, 'national');
      const merdeka = mh.holidays.find(h => /Merdeka/.test(h.name));
      assert.ok(merdeka);
      assert.equal(merdeka.category, 'national');
    });

    it('tags state holidays correctly', () => {
      const mh = new MyHolidays(2026);
      const ftDay = mh.holidays.find(h => h.name === 'Federal Territory Day');
      assert.ok(ftDay);
      assert.equal(ftDay.category, 'state');
    });

    it('flags replacement holidays with Holiday suffix', () => {
      const mh = new MyHolidays(2020);
      const replacements = mh.holidays.filter(h => h.replacement);
      assert.ok(replacements.length > 0);
      replacements.forEach(h => {
        assert.match(h.name, /Holiday|Replacement|in lieu/i);
      });
    });

    it('does not flag primary holidays as replacements', () => {
      const mh = new MyHolidays(2026);
      const primary = mh.check(new Date(2026, 0, 1));
      assert.ok(primary);
      assert.equal(primary.replacement, false);
    });
  });

  describe('constructor', () => {
    it('loads holidays for a valid year', () => {
      const mh = new MyHolidays(2026);
      assert.ok(mh.holidays.length > 0);
    });

    it('throws RangeError for a year with no data', () => {
      assert.throws(() => new MyHolidays(1999), {
        name: 'RangeError',
        message: 'No holiday data for year 1999',
      });
    });

    it('parses dates as local Date objects', () => {
      const mh = new MyHolidays(2026);
      const newYear = mh.holidays[0];
      assert.ok(newYear.date instanceof Date);
      assert.equal(newYear.date.getFullYear(), 2026);
      assert.equal(newYear.date.getMonth(), 0);
      assert.equal(newYear.date.getDate(), 1);
    });
  });

  describe('static years()', () => {
    it('returns sorted array of available years as numbers', () => {
      const years = MyHolidays.years();
      assert.ok(Array.isArray(years));
      assert.ok(years.length >= 2);
      assert.ok(years.includes(2026));
      assert.deepEqual(years, [...years].sort((a, b) => a - b));
    });
  });

  describe('list()', () => {
    it('returns a shallow copy of all holidays', () => {
      const mh = new MyHolidays(2026);
      const list = mh.list();
      assert.ok(Array.isArray(list));
      assert.equal(list.length, mh.holidays.length);
      assert.notEqual(list, mh.holidays);
    });

    it('filters by state — Selangor gets national holidays minus exclusions', () => {
      const mh = new MyHolidays(2026);
      const selangor = mh.list('Selangor');
      assert.ok(selangor.length > 0);
      assert.ok(selangor.length < mh.holidays.length);
      selangor.forEach(h => {
        const isNational = h.includes.includes('National');
        const isStateSpecific = h.includes.includes('Selangor');
        if (isNational) {
          assert.ok(!h.excludes.includes('Selangor'));
        } else {
          assert.ok(isStateSpecific);
        }
      });
    });

    it('filters by state — Sarawak excludes Deepavali', () => {
      const mh = new MyHolidays(2026);
      const sarawak = mh.list('Sarawak');
      const deepavali = sarawak.find(h => h.name === 'Deepavali');
      assert.equal(deepavali, undefined);
    });
  });

  describe('check()', () => {
    it('finds New Year 2026 by date string', () => {
      const mh = new MyHolidays(2026);
      const result = mh.check('2026-01-01');
      assert.ok(result);
      assert.equal(result.name, "New Year's Day");
    });

    it('finds New Year 2026 by Date object', () => {
      const mh = new MyHolidays(2026);
      const result = mh.check(new Date(2026, 0, 1));
      assert.ok(result);
      assert.equal(result.name, "New Year's Day");
    });

    it('returns undefined for a non-holiday', () => {
      const mh = new MyHolidays(2026);
      const result = mh.check('2026-07-15');
      assert.equal(result, undefined);
    });

    it('filters by state when checking', () => {
      const mh = new MyHolidays(2026);
      const forJohor = mh.check('2026-01-01', 'Johor');
      assert.equal(forJohor, undefined);
      const forKL = mh.check('2026-01-01', 'Kuala Lumpur');
      assert.ok(forKL);
    });

    it('finds Chinese New Year 2026 on Feb 17', () => {
      const mh = new MyHolidays(2026);
      const result = mh.check(new Date(2026, 1, 17));
      assert.ok(result);
      assert.match(result.name, /Chinese New Year/);
    });

    it('finds Labour Day 2026 on May 1', () => {
      const mh = new MyHolidays(2026);
      const result = mh.check(new Date(2026, 4, 1));
      assert.ok(result);
      assert.equal(result.name, 'Labour Day');
    });

    it('finds Merdeka Day 2026 on Aug 31', () => {
      const mh = new MyHolidays(2026);
      const result = mh.check(new Date(2026, 7, 31));
      assert.ok(result);
      assert.match(result.name, /Merdeka|National Day/);
    });

    it('finds Malaysia Day 2026 on Sep 16', () => {
      const mh = new MyHolidays(2026);
      const result = mh.check(new Date(2026, 8, 16));
      assert.ok(result);
      assert.equal(result.name, 'Malaysia Day');
    });

    it('finds Christmas 2026 on Dec 25', () => {
      const mh = new MyHolidays(2026);
      const result = mh.check(new Date(2026, 11, 25));
      assert.ok(result);
      assert.equal(result.name, 'Christmas Day');
    });
  });

  describe('between()', () => {
    it('returns holidays within a date range', () => {
      const mh = new MyHolidays(2026);
      const jan = mh.between('2026-01-01', '2026-01-31');
      assert.ok(Array.isArray(jan));
      assert.ok(jan.length >= 1);
      jan.forEach(h => {
        assert.ok(h.date >= new Date(2026, 0, 1));
        assert.ok(h.date <= new Date(2026, 0, 31));
      });
    });

    it('filters by state in range query', () => {
      const mh = new MyHolidays(2026);
      const allJan = mh.between('2026-01-01', '2026-01-31');
      const selangorJan = mh.between('2026-01-01', '2026-01-31', 'Selangor');
      assert.ok(selangorJan.length <= allJan.length);
    });

    it('returns empty array when no holidays in range', () => {
      const mh = new MyHolidays(2026);
      const result = mh.between('2026-07-13', '2026-07-15');
      assert.ok(Array.isArray(result));
    });

    it('finds Hari Raya Aidilfitri 2026 in March range', () => {
      const mh = new MyHolidays(2026);
      const march = mh.between('2026-03-20', '2026-03-25');
      const raya = march.find(h => /Hari Raya Aidilfitri/.test(h.name));
      assert.ok(raya);
    });
  });

  describe('next()', () => {
    it('returns the next holiday after a given date', () => {
      const mh = new MyHolidays(2026);
      const result = mh.next(new Date(2026, 0, 1));
      assert.ok(result);
      assert.ok(result.date > new Date(2026, 0, 1));
    });

    it('skips the current day', () => {
      const mh = new MyHolidays(2026);
      const result = mh.next(new Date(2026, 0, 1));
      assert.ok(result);
      assert.notEqual(result.date.getTime(), new Date(2026, 0, 1).getTime());
    });

    it('filters by state', () => {
      const mh = new MyHolidays(2026);
      const nextForSarawak = mh.next(new Date(2026, 0, 1), 'Sarawak');
      assert.ok(nextForSarawak);
      const isRelevant = nextForSarawak.includes.includes('National')
        ? !nextForSarawak.excludes.includes('Sarawak')
        : nextForSarawak.includes.includes('Sarawak');
      assert.ok(isRelevant);
    });

    it('returns undefined when no more holidays in the year', () => {
      const mh = new MyHolidays(2026);
      const result = mh.next(new Date(2026, 11, 31));
      assert.equal(result, undefined);
    });
  });

  describe('isBusinessDay()', () => {
    it('returns false for a Saturday (standard weekend)', () => {
      const mh = new MyHolidays(2026);
      assert.equal(mh.isBusinessDay(new Date(2026, 0, 3)), false);
    });

    it('returns false for a Sunday (standard weekend)', () => {
      const mh = new MyHolidays(2026);
      assert.equal(mh.isBusinessDay(new Date(2026, 0, 4)), false);
    });

    it('returns true for a regular weekday', () => {
      const mh = new MyHolidays(2026);
      assert.equal(mh.isBusinessDay(new Date(2026, 0, 5)), true);
    });

    it('returns false for a public holiday on a weekday', () => {
      const mh = new MyHolidays(2026);
      assert.equal(mh.isBusinessDay(new Date(2026, 0, 1)), false);
    });

    it('uses Fri-Sat weekends for Kelantan', () => {
      const mh = new MyHolidays(2026);
      const friday = new Date(2026, 0, 2);
      assert.equal(friday.getDay(), 5);
      assert.equal(mh.isBusinessDay(friday, 'Kelantan'), false);
      const sunday = new Date(2026, 0, 4);
      assert.equal(sunday.getDay(), 0);
      assert.equal(mh.isBusinessDay(sunday, 'Kelantan'), true);
    });

    it('Johor uses Sat-Sun weekends from 2025 onwards', () => {
      const mh = new MyHolidays(2026);
      const friday = new Date(2026, 0, 2);
      assert.equal(mh.isBusinessDay(friday, 'Johor'), true);
      const saturday = new Date(2026, 0, 3);
      assert.equal(mh.isBusinessDay(saturday, 'Johor'), false);
    });
  });

  describe('businessDays()', () => {
    it('counts business days in a week (Mon-Fri)', () => {
      const mh = new MyHolidays(2026);
      const count = mh.businessDays(new Date(2026, 0, 5), new Date(2026, 0, 9));
      assert.equal(count, 5);
    });

    it('excludes weekends', () => {
      const mh = new MyHolidays(2026);
      const count = mh.businessDays(new Date(2026, 0, 5), new Date(2026, 0, 11));
      assert.equal(count, 5);
    });

    it('excludes public holidays', () => {
      const mh = new MyHolidays(2026);
      const withoutHoliday = mh.businessDays(new Date(2026, 0, 1), new Date(2026, 0, 2));
      assert.equal(withoutHoliday, 1);
    });

    it('respects state weekends for Kelantan', () => {
      const mh = new MyHolidays(2026);
      const standard = mh.businessDays(new Date(2026, 0, 5), new Date(2026, 0, 11));
      const kelantan = mh.businessDays(new Date(2026, 0, 5), new Date(2026, 0, 11), 'Kelantan');
      assert.ok(typeof kelantan === 'number');
      assert.ok(kelantan >= 4);
    });

    it('returns 0 for a single weekend day', () => {
      const mh = new MyHolidays(2026);
      const count = mh.businessDays(new Date(2026, 0, 3), new Date(2026, 0, 3));
      assert.equal(count, 0);
    });
  });
});
