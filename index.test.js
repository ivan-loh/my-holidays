import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import MyHolidays from './index.js';

describe('MyHolidays', () => {
  describe('constructor', () => {
    it('loads holidays for a valid year', () => {
      const mh = new MyHolidays(2018);
      assert.ok(mh.holidays.length > 0);
    });

    it('throws RangeError for a year with no data', () => {
      assert.throws(() => new MyHolidays(1999), {
        name: 'RangeError',
        message: 'No holiday data for year 1999',
      });
    });

    it('parses dates as local Date objects', () => {
      const mh = new MyHolidays(2018);
      const first = mh.holidays[0];
      assert.ok(first.date instanceof Date);
      assert.equal(first.date.getFullYear(), 2018);
      assert.equal(first.date.getMonth(), 0); // January
      assert.equal(first.date.getDate(), 1);
    });
  });

  describe('list()', () => {
    it('returns a shallow copy of holidays', () => {
      const mh = new MyHolidays(2018);
      const list = mh.list();
      assert.ok(Array.isArray(list));
      assert.equal(list.length, mh.holidays.length);
      assert.notEqual(list, mh.holidays); // different array reference
    });
  });

  describe('check()', () => {
    it('finds a holiday by date string', () => {
      const mh = new MyHolidays(2018);
      const result = mh.check('2018-01-01');
      assert.ok(result);
      assert.equal(result.name, "New Year's Day");
    });

    it('finds a holiday by Date object', () => {
      const mh = new MyHolidays(2018);
      const result = mh.check(new Date(2018, 0, 1));
      assert.ok(result);
      assert.equal(result.name, "New Year's Day");
    });

    it('returns undefined for a non-holiday date', () => {
      const mh = new MyHolidays(2018);
      const result = mh.check('2018-03-15');
      assert.equal(result, undefined);
    });
  });
});
