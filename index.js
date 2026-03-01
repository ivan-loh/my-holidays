import dataset from './data.json' with { type: 'json' };

const FRI_SAT_STATES = new Set([
  'Johor', 'Kedah', 'Kelantan', 'Terengganu',
]);

const JOHOR_SAT_SUN_FROM = new Date(2025, 0, 1);

function normalizeDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isWeekend(date, state) {
  const day = date.getDay();
  if (state && FRI_SAT_STATES.has(state)) {
    if (state === 'Johor' && date >= JOHOR_SAT_SUN_FROM) {
      return day === 0 || day === 6;
    }
    return day === 5 || day === 6;
  }
  return day === 0 || day === 6;
}

function matchesState(holiday, state) {
  if (!state) return true;
  if (holiday.includes.includes('National')) {
    return !holiday.excludes.includes(state);
  }
  return holiday.includes.includes(state);
}

const ISLAMIC = /Hari Raya|Aidilfitri|Haji|Awal Ramadan|Nuzul Al-Quran|Israk|Mikraj|Awal Muharram|Prophet Muhammad|Mawlid|Arafat/i;
const CULTURAL = /Chinese New Year|Thaipusam|Deepavali|Wesak|Harvest Festival|Hari Gawai|Christmas|Good Friday/i;
const STATE = /Sultan|Governor|Raja Perlis|YDPB|Installation|Hari Hol|Georgetown|Sarawak Day|Federal Territory Day|Declaration of Melaka|Independence Declaration/i;
const REPLACEMENT = /Holiday$|Replacement|in lieu/i;

function categorize(name) {
  if (ISLAMIC.test(name)) return 'islamic';
  if (CULTURAL.test(name)) return 'cultural';
  if (STATE.test(name)) return 'state';
  return 'national';
}

function isReplacement(name) {
  return REPLACEMENT.test(name);
}

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
      category: categorize(h.name),
      replacement: isReplacement(h.name),
    }));
  }

  static years() {
    return Object.keys(dataset).map(Number).sort((a, b) => a - b);
  }

  check(date, state) {
    const t = normalizeDate(date).getTime();
    const matches = this.holidays.filter(h => h.date.getTime() === t);
    if (state) {
      return matches.find(h => matchesState(h, state));
    }
    return matches[0];
  }

  list(state) {
    if (state) {
      return this.holidays.filter(h => matchesState(h, state));
    }
    return [...this.holidays];
  }

  between(startDate, endDate, state) {
    const start = normalizeDate(startDate).getTime();
    const end = normalizeDate(endDate).getTime();
    return this.holidays.filter(h => {
      const t = h.date.getTime();
      return t >= start && t <= end && matchesState(h, state);
    });
  }

  next(date, state) {
    const t = normalizeDate(date || new Date()).getTime();
    for (const h of this.holidays) {
      if (h.date.getTime() > t && matchesState(h, state)) {
        return h;
      }
    }
    return undefined;
  }

  isBusinessDay(date, state) {
    const d = normalizeDate(date);
    if (isWeekend(d, state)) return false;
    const t = d.getTime();
    return !this.holidays.some(h => h.date.getTime() === t && matchesState(h, state));
  }

  businessDays(startDate, endDate, state) {
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);
    const holidaySet = new Set(
      this.holidays
        .filter(h => matchesState(h, state))
        .map(h => h.date.getTime())
    );
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      if (!isWeekend(current, state) && !holidaySet.has(current.getTime())) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
}
