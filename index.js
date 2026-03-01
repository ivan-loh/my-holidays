import dataset from './data.json' with { type: 'json' };

const FRI_SAT_STATES = new Set(['Johor', 'Kedah', 'Kelantan', 'Terengganu']);
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

const ISLAMIC_RE     = /Hari Raya|Aidilfitri|Haji|Awal Ramadan|Nuzul Al-Quran|Israk|Mikraj|Awal Muharram|Prophet Muhammad|Mawlid|Arafat/i;
const CULTURAL_RE    = /Chinese New Year|Thaipusam|Deepavali|Wesak|Harvest Festival|Hari Gawai|Christmas|Good Friday/i;
const ROYAL_STATE_RE = /Sultan|Governor|Raja Perlis|YDPB|Installation|Hari Hol|Georgetown|Sarawak Day|Federal Territory Day|Declaration of Melaka|Independence Declaration/i;
const REPLACEMENT_RE = /Holiday$|Replacement|in lieu/i;

function categorize(name) {
  if (ISLAMIC_RE.test(name)) return 'islamic';
  if (CULTURAL_RE.test(name)) return 'cultural';
  if (ROYAL_STATE_RE.test(name)) return 'state';
  return 'national';
}

function isReplacement(name) {
  return REPLACEMENT_RE.test(name);
}

export default class MyHolidays {

  constructor(year) {
    const key = year != null ? String(year) : String(new Date().getFullYear());
    const raw = dataset[key];
    if (!raw) throw new RangeError(`No holiday data for year ${key}`);

    this.holidays = raw.map(entry => ({
      ...entry,
      date:        new Date(+entry.date.slice(0, 4), +entry.date.slice(4, 6) - 1, +entry.date.slice(6, 8)),
      category:    categorize(entry.name),
      replacement: isReplacement(entry.name),
    }));
  }

  static years() {
    return Object.keys(dataset).map(Number).sort((a, b) => a - b);
  }

  check(date, state) {
    const target = normalizeDate(date).getTime();
    return this.holidays.find(h =>
      h.date.getTime() === target && matchesState(h, state)
    );
  }

  list(state) {
    if (state) return this.holidays.filter(h => matchesState(h, state));
    return [...this.holidays];
  }

  between(startDate, endDate, state) {
    const start = normalizeDate(startDate).getTime();
    const end   = normalizeDate(endDate).getTime();
    return this.holidays.filter(h => {
      const t = h.date.getTime();
      return t >= start && t <= end && matchesState(h, state);
    });
  }

  next(date, state) {
    const after = normalizeDate(date || new Date()).getTime();
    return this.holidays.find(h =>
      h.date.getTime() > after && matchesState(h, state)
    );
  }

  isBusinessDay(date, state) {
    const normalized = normalizeDate(date);
    if (isWeekend(normalized, state)) return false;
    const t = normalized.getTime();
    return !this.holidays.some(h =>
      h.date.getTime() === t && matchesState(h, state)
    );
  }

  businessDays(startDate, endDate, state) {
    const start = normalizeDate(startDate);
    const end   = normalizeDate(endDate);

    const holidayTimes = new Set(
      this.holidays
        .filter(h => matchesState(h, state))
        .map(h => h.date.getTime())
    );

    let count = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      if (!isWeekend(cursor, state) && !holidayTimes.has(cursor.getTime())) {
        count++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return count;
  }
}
