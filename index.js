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
    const d = date instanceof Date ? date : new Date(date);
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return this.holidays.find(h => h.date.getTime() === t);
  }

  list() {
    return [...this.holidays];
  }
}
