import KoreanLunarCalendar from './vendor/korean-lunar-calendar/korean-lunar-calendar.js';
import { kasiJieInstants } from './solar-terms.js';
import { buildPillarLayers } from './saju-layers.js';

const stems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const branches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const elements = ['목', '화', '토', '금', '수'];
const stemElements = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const branchElements = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
const branchAnimals = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const colors = ['청록', '붉은색', '황토색', '흰색', '남색'];
const SAJU_ENGINE_VERSION = '1';
const KOREAN_LUNAR_TABLE_VERSION = '0.3.6';

const termNames = ['소한', '입춘', '경칩', '청명', '입하', '망종', '소서', '입추', '백로', '한로', '입동', '대설'];
const termMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const jieLongitudes = [285, 315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255];
const monthOrdinalByName = new Map([['소한', 11], ['입춘', 0], ['경칩', 1], ['청명', 2], ['입하', 3], ['망종', 4], ['소서', 5], ['입추', 6], ['백로', 7], ['한로', 8], ['입동', 9], ['대설', 10]]);

const mod = (n, m) => ((n % m) + m) % m;

function dateParts(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return { year: y, month: m, day: d };
}

function solarLongitudeDegrees(date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const t = (jd - 2451545) / 36525;
  const meanLongitude = mod(280.46646 + t * (36000.76983 + 0.0003032 * t), 360);
  const anomaly = (357.52911 + t * (35999.05029 - 0.0001537 * t)) * Math.PI / 180;
  const equation = (1.914602 - t * (0.004817 + 0.000014 * t)) * Math.sin(anomaly)
    + (0.019993 - 0.000101 * t) * Math.sin(2 * anomaly) + 0.000289 * Math.sin(3 * anomaly);
  const omega = (125.04 - 1934.136 * t) * Math.PI / 180;
  return mod(meanLongitude + equation - 0.00569 - 0.00478 * Math.sin(omega), 360);
}

function computeSolarTermEstimate(year, longitude) {
  const index = jieLongitudes.indexOf(longitude);
  if (!Number.isInteger(year) || index < 0) return null;
  const target = mod(longitude, 360);
  const expected = Date.UTC(year, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11][index], [5, 4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 7][index]);
  let low = expected - 20 * 86400000;
  let high = expected + 20 * 86400000;
  const targetProgress = (ms) => {
    const angle = solarLongitudeDegrees(new Date(ms));
    return mod(angle - target + 180, 360) - 180;
  };
  // The solar longitude is increasing through these target crossings; bisect the signed crossing.
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    if (targetProgress(mid) < 0) low = mid; else high = mid;
  }
  return new Date((low + high) / 2);
}

function solarTermInstant(year, longitude) {
  const index = jieLongitudes.indexOf(longitude);
  const publishedTerm = kasiJieInstants[year]?.[index];
  return publishedTerm ? new Date(publishedTerm) : computeSolarTermEstimate(year, longitude);
}

function getSolarJieInstants(year) {
  return termNames.map((name, i) => ({ name, month: termMonths[i], year, instant: solarTermInstant(year, jieLongitudes[i]) }));
}

export function getSolarTermInstant(year, name) {
  const index = termNames.indexOf(name);
  if (!Number.isInteger(year) || index < 0) return null;
  return solarTermInstant(year, jieLongitudes[index]).toISOString();
}

export function estimateSolarTermInstant(year, name) {
  const index = termNames.indexOf(name);
  if (!Number.isInteger(year) || index < 0) return null;
  return computeSolarTermEstimate(year, jieLongitudes[index]).toISOString();
}

export function calculateAnnualFlow(year, timezone = 'Asia/Seoul') {
  if (!Number.isInteger(year) || year < 1900 || year > 2100) return { error: 'year-out-of-range' };
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { return { error: 'invalid-timezone' }; }
  const terms = [...getSolarJieInstants(year - 1), ...getSolarJieInstants(year), ...getSolarJieInstants(year + 1)];
  const start = terms.find(({ name, year: termYear }) => name === '입춘' && termYear === year);
  const end = terms.find(({ name, year: termYear }) => name === '입춘' && termYear === year + 1);
  if (!start || !end) return { error: 'solar-term-unavailable' };
  const yearIndex = mod(year - 4, 60);
  const yearPillar = pillar(yearIndex % 10, yearIndex % 12);
  const monthStemStart = mod((yearIndex % 10) % 5 * 2 + 2, 10);
  const activeTerms = terms.filter(({ instant }) => instant >= start.instant && instant < end.instant).sort((a, b) => a.instant - b.instant);
  if (activeTerms.length !== 12) return { error: 'solar-month-count-mismatch' };
  const months = activeTerms.map((term) => {
    const ordinal = monthOrdinalByName.get(term.name);
    if (ordinal === undefined) return null;
    const local = zonedParts(term.instant, timezone);
    return {
      term: term.name,
      start: `${local.year}-${String(local.month).padStart(2, '0')}-${String(local.day).padStart(2, '0')}`,
      ordinal,
      pillar: pillar(monthStemStart + ordinal, 2 + ordinal),
      instant: term.instant.toISOString(),
      approximate: !kasiJieInstants[term.year],
    };
  });
  if (months.some((month) => !month)) return { error: 'solar-month-data-invalid' };
  return {
    year,
    yearPillar,
    months,
    start: start.instant.toISOString(),
    end: end.instant.toISOString(),
    timezone,
    solarTermApproximate: months.some((month) => month.approximate),
    basis: '천문 계산 절기시각 또는 태양 황경 근사치 · 입춘 기준 사주 연도',
  };
}

function zonedParts(date, timezone) {
  const values = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  return Object.fromEntries(values.filter((part) => part.type !== 'literal').map(({ type, value }) => [type, Number(value)]));
}

export function localBirthInstants(civil, time, timezone) {
  if (!timezone) return { error: 'timezone-required' };
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { return { error: 'invalid-timezone' }; }
  const [hour, minute] = time.split(':').map(Number);
  const wanted = { year: civil.year, month: civil.month, day: civil.day, hour, minute, second: 0 };
  const naive = Date.UTC(civil.year, civil.month - 1, civil.day, hour, minute);
  const offsets = new Set();
  for (const delta of [-36, -12, 0, 12, 36]) {
    const probe = new Date(naive + delta * 3600000);
    const parts = zonedParts(probe, timezone);
    offsets.add(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - probe.getTime());
  }
  const matches = [...offsets].map((offset) => new Date(naive - offset)).filter((candidate) => {
    const p = zonedParts(candidate, timezone);
    return Object.keys(wanted).every((key) => p[key] === wanted[key]);
  }).sort((a, b) => a - b);
  if (!matches.length) return { error: 'nonexistent-local-time' };
  return { instants: matches, ambiguous: matches.length > 1 };
}

function civilFromInstant(date, timezone) {
  const p = zonedParts(date, timezone);
  return { year: p.year, month: p.month, day: p.day };
}

/**
 * Calculate the current local Four Pillars and the next traditional two-hour branch
 * boundary without relying on the device's current time zone. This is data for a
 * future clock UI; callers must label it as the current-time chart, not a birth chart.
 */
export function calculateCurrentPillarClock(instant = new Date(), timezone = 'Asia/Seoul', dayBoundaryConvention = 'midnight') {
  const now = instant instanceof Date ? new Date(instant.getTime()) : new Date(instant);
  if (!Number.isFinite(now.getTime())) return { error: 'invalid-instant' };
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { return { error: 'invalid-timezone' }; }
  if (!['midnight', 'zi-hour-start'].includes(dayBoundaryConvention)) return { error: 'invalid-day-boundary-convention' };

  const local = zonedParts(now, timezone);
  const date = `${local.year}-${String(local.month).padStart(2, '0')}-${String(local.day).padStart(2, '0')}`;
  const current = calculateSaju({
    date,
    instant: now,
    timezone,
    dayBoundaryConvention,
  });
  if (current.error) return current;

  const start = Date.UTC(local.year, local.month - 1, local.day, 12);
  const boundaryHours = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
  let nextHourBoundary = null;
  // Resolve local wall-clock boundaries through the same historical DST-aware converter
  // used by birth calculations. This avoids assuming the device zone or a fixed UTC offset.
  for (let dayOffset = 0; dayOffset <= 2 && !nextHourBoundary; dayOffset++) {
    const candidateCivilDate = new Date(start + dayOffset * 86400000);
    const candidateDate = `${candidateCivilDate.getUTCFullYear()}-${String(candidateCivilDate.getUTCMonth() + 1).padStart(2, '0')}-${String(candidateCivilDate.getUTCDate()).padStart(2, '0')}`;
    const civil = dateParts(candidateDate);
    for (const hour of boundaryHours) {
      const wall = `${String(hour).padStart(2, '0')}:00`;
      const resolved = localBirthInstants(civil, wall, timezone);
      if (!resolved.instants) continue;
      const future = resolved.instants.filter(candidate => {
        if (candidate <= now) return false;
        const before = zonedParts(new Date(candidate.getTime() - 1000), timezone);
        const after = zonedParts(candidate, timezone);
        const branchBefore = Math.floor(mod(before.hour + 1, 24) / 2);
        const branchAfter = Math.floor(mod(after.hour + 1, 24) / 2);
        return branchBefore !== branchAfter;
      }).sort((a, b) => a - b)[0];
      if (future) { nextHourBoundary = future; break; }
    }
  }
  if (!nextHourBoundary) return { error: 'next-hour-boundary-unavailable' };

  return {
    instant: now.toISOString(),
    timezone,
    localDate: date,
    localTime: `${String(local.hour).padStart(2, '0')}:${String(local.minute).padStart(2, '0')}:${String(local.second).padStart(2, '0')}`,
    yearPillar: current.yearPillar,
    monthPillar: current.monthPillar,
    dayPillar: current.dayPillar,
    hourPillar: current.hourPillar,
    nextHourBoundary: nextHourBoundary.toISOString(),
    secondsUntilNextHourBoundary: Math.ceil((nextHourBoundary.getTime() - now.getTime()) / 1000),
    dayBoundaryConvention,
    lateZiAlternatives: current.calculation.dayBoundaryAlternatives,
    solarTermApproximate: current.calculation.solarTermApproximate,
    calculation: current.calculation,
  };
}

// Korean-calendar table conversion is deterministic and works without ICU or network access.
// The optional timezone argument remains for call-site compatibility; Korean lunar dates are
// table dates and are not recalculated from the phone's locale or time zone.
export function getLunarMonthInfo(year, month, _timezone = 'Asia/Seoul') {
  if (!Number.isInteger(year) || year < 1900 || year > 2050 || !Number.isInteger(month) || month < 1 || month > 12) return { available: false, hasLeapMonth: false };
  const calendar = new KoreanLunarCalendar();
  if (!calendar.setLunarDate(year, month, 1, false)) return { available: false, hasLeapMonth: false };
  const accepted = calendar.setLunarDate(year, month, 1, true);
  const hasLeapMonth = accepted && !!calendar.getLunarCalendar().intercalation;
  return { available: true, hasLeapMonth };
}

export function solarToLunar(isoDate, _timezone = 'Asia/Seoul') {
  const solar = dateParts(isoDate);
  if (!solar) return { available: false, error: 'invalid-date' };
  if (solar.year < 1900 || solar.year > 2050) return { available: false, error: 'date-out-of-range' };
  const calendar = new KoreanLunarCalendar();
  if (!calendar.setSolarDate(solar.year, solar.month, solar.day)) return { available: false, error: 'lunar-unavailable' };
  const lunar = calendar.getLunarCalendar();
  return { available: true, year: lunar.year, month: lunar.month, day: lunar.day, leapMonth: !!lunar.intercalation, basis: 'korean-lunar-calendar-table' };
}

export function lunarToSolar(profile) {
  const lunar = dateParts(profile.date);
  if (!lunar) return { error: 'invalid-date' };
  if (lunar.year < 1900 || lunar.year > 2050) return { error: 'date-out-of-range' };
  const calendar = new KoreanLunarCalendar();
  if (!calendar.setLunarDate(lunar.year, lunar.month, lunar.day, !!profile.leapMonth)) return { error: 'lunar-date-not-found' };
  return { solar: calendar.getSolarCalendar(), basis: 'korean-lunar-calendar-table' };
}

function pillar(stemIndex, branchIndex) {
  const s = mod(stemIndex, 10);
  const b = mod(branchIndex, 12);
  return {
    stem: stems[s], branch: branches[b],
    stemElement: elements[stemElements[s]], branchElement: elements[branchElements[b]],
    stemElementIndex: stemElements[s], branchElementIndex: branchElements[b],
    label: `${stems[s]}${branches[b]}`,
  };
}

export function calculateSaju(profile) {
  const timezone = profile?.timezone || 'Asia/Seoul';
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { return { error: 'invalid-timezone' }; }
  const exactInstant = profile?.instant === undefined ? null : new Date(profile.instant);
  if (profile?.instant !== undefined && !Number.isFinite(exactInstant.getTime())) return { error: 'invalid-instant' };
  if (exactInstant && profile?.calendar === 'lunar') return { error: 'instant-requires-solar-calendar' };
  const requestedDayBoundary = profile?.dayBoundaryConvention;
  if (requestedDayBoundary !== undefined && !['midnight', 'zi-hour-start'].includes(requestedDayBoundary)) return { error: 'invalid-day-boundary-convention' };
  const dayBoundaryConvention = requestedDayBoundary || 'midnight';
  let civil = dateParts(profile?.date);
  let lunarBasis = false;
  if (profile?.calendar === 'lunar') {
    const converted = lunarToSolar(profile);
    if (converted.error) return { error: converted.error };
    civil = converted.solar;
    lunarBasis = true;
  }
  if (exactInstant) civil = civilFromInstant(exactInstant, timezone);
  if (!civil || civil.year < 1900 || civil.year > 2050) return { error: 'date-out-of-range' };

  let birthInstant;
  let ambiguousBirthTime = false;
  if (exactInstant) {
    birthInstant = exactInstant;
  } else if (!profile.timeUnknown && profile.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(profile.time)) return { error: 'invalid-time' };
  if (!exactInstant && !profile.timeUnknown && /^([01]\d|2[0-3]):[0-5]\d$/.test(profile.time || '')) {
    const converted = localBirthInstants(civil, profile.time, timezone);
    if (converted.error) return { error: converted.error };
    birthInstant = converted.instants[0];
    ambiguousBirthTime = converted.ambiguous;
  } else if (!exactInstant) {
    const noon = localBirthInstants(civil, '12:00', timezone);
    if (noon.error) return { error: noon.error };
    birthInstant = noon.instants[0];
  }
  civil = civilFromInstant(birthInstant, timezone);
  const terms = [...getSolarJieInstants(civil.year - 1), ...getSolarJieInstants(civil.year), ...getSolarJieInstants(civil.year + 1)];
  const liChun = terms.find(({ name, instant }) => name === '입춘' && instant.getUTCFullYear() === civil.year);
  const sajuYear = birthInstant < liChun.instant ? civil.year - 1 : civil.year;
  const yearIndex = mod(sajuYear - 4, 60);
  const yearPillar = pillar(yearIndex % 10, yearIndex % 12);
  const priorTerms = terms.filter((term) => term.instant <= birthInstant).sort((a, b) => b.instant - a.instant);
  const activeTerm = priorTerms[0];
  const hasPublishedTermData = !!kasiJieInstants[liChun?.instant.getUTCFullYear()]
    && !!kasiJieInstants[activeTerm?.year];
  const monthOrdinal = monthOrdinalByName.get(activeTerm?.name) ?? 10;
  const monthStemStart = mod((yearIndex % 10) % 5 * 2 + 2, 10);
  const monthPillar = pillar(monthStemStart + monthOrdinal, 2 + monthOrdinal);

  const sameBirthDateTerms = terms.filter((term) => {
    const termCivil = civilFromInstant(term.instant, timezone);
    return termCivil.year === civil.year && termCivil.month === civil.month && termCivil.day === civil.day;
  });
  // The bundled exact table is preferred for 1920–2100. Outside it, the
  // solar-longitude fallback can drift by almost 13 minutes against the table;
  // withhold dependent balance guidance within a conservative 15-minute window.
  const approximateBoundaryTerms = !hasPublishedTermData && !profile.timeUnknown
    ? terms.filter((term) => Math.abs(term.instant.getTime() - birthInstant.getTime()) <= 15 * 60_000)
    : [];
  const uncertainTerms = profile.timeUnknown ? sameBirthDateTerms : approximateBoundaryTerms;
  const termBoundaryUncertain = uncertainTerms.length > 0;

  // Local mean solar time (진태양시 경도 보정): when the birthplace longitude is known and the
  // birth time is known, the day and hour pillars follow the sun at the birthplace
  // (4 minutes per degree) instead of the standard-meridian clock time.
  const longitude = profile?.longitude === undefined || profile?.longitude === null || profile?.longitude === '' ? NaN : Number(profile.longitude);
  const birthTimeKnown = !profile.timeUnknown && (exactInstant || /^([01]\d|2[0-3]):[0-5]\d$/.test(profile.time || ''));
  let solarTimeCorrection = null;
  let dayCivil = civil;
  let birthHour = birthInstant ? Number(new Intl.DateTimeFormat('en', { timeZone: timezone, hour: '2-digit', hourCycle: 'h23' }).format(birthInstant)) : null;
  if (birthTimeKnown && Number.isFinite(longitude) && Math.abs(longitude) <= 180 && profile?.solarTimeCorrection !== false) {
    const zoned = zonedParts(birthInstant, timezone);
    const wallMs = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
    const zoneOffsetMinutes = Math.round((wallMs - Math.floor(birthInstant.getTime() / 1000) * 1000) / 60000);
    const meanSolar = new Date(birthInstant.getTime() + Math.round(longitude * 240000));
    dayCivil = { year: meanSolar.getUTCFullYear(), month: meanSolar.getUTCMonth() + 1, day: meanSolar.getUTCDate() };
    birthHour = meanSolar.getUTCHours();
    solarTimeCorrection = {
      longitude: Math.round(longitude * 100) / 100,
      minutes: Math.round(longitude * 4 - zoneOffsetMinutes),
      localMeanTime: `${String(meanSolar.getUTCHours()).padStart(2, '0')}:${String(meanSolar.getUTCMinutes()).padStart(2, '0')}`,
    };
  }
  const jdn = Math.floor(Date.UTC(dayCivil.year, dayCivil.month - 1, dayCivil.day) / 86400000) + 2440588;
  const civilDayIndex = mod(jdn + 49, 60);
  const lateZiBoundary = !profile.timeUnknown && birthHour === 23;
  const dayIndex = mod(civilDayIndex + (lateZiBoundary && dayBoundaryConvention === 'zi-hour-start' ? 1 : 0), 60);
  const dayPillar = pillar(dayIndex % 10, dayIndex % 12);
  let hourPillar = null;
  if (!profile.timeUnknown && (exactInstant || /^([01]\d|2[0-3]):[0-5]\d$/.test(profile.time || ''))) {
    const hour = birthHour;
    const branchIndex = Math.floor(mod(hour + 1, 24) / 2);
    const hourStem = mod((dayIndex % 10) % 5 * 2 + branchIndex, 10);
    hourPillar = pillar(hourStem, branchIndex);
  }
  const dayBoundaryAlternatives = lateZiBoundary ? ['midnight', 'zi-hour-start'].map(convention => {
    const alternativeDayIndex = mod(civilDayIndex + (convention === 'zi-hour-start' ? 1 : 0), 60);
    const alternativeHourBranch = 0;
    return {
      convention,
      dayPillar: pillar(alternativeDayIndex % 10, alternativeDayIndex % 12),
      hourPillar: pillar(mod((alternativeDayIndex % 10) % 5 * 2 + alternativeHourBranch, 10), alternativeHourBranch),
    };
  }) : [];
  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  const counts = [0, 0, 0, 0, 0];
  for (const item of pillars.filter(Boolean)) {
    counts[item.stemElementIndex] += 1;
    counts[item.branchElementIndex] += 1;
  }
  // A three-pillar chart omits two characters from the hour pillar. Its smallest
  // count is only the smallest among the known six characters, not a valid
  // four-pillar "weakest element". Do not turn that partial count into personal
  // color/action guidance.
  const elementBalanceEligible = !!hourPillar && !termBoundaryUncertain;
  const weakestElementIndex = elementBalanceEligible ? counts.indexOf(Math.min(...counts)) : null;
  const solarTermApproximate = !hasPublishedTermData;
  const uncertainty = [];
  if (profile.timeUnknown) uncertainty.push('birth-time-unknown');
  if (profile.timeUnknown && uncertainTerms.length > 0) uncertainty.push('solar-term-boundary-on-birth-date');
  if (!profile.timeUnknown && approximateBoundaryTerms.length > 0) uncertainty.push('approximate-solar-term-boundary-near-birth-time');
  if (solarTermApproximate) uncertainty.push('solar-term-time-approximated');
  if (ambiguousBirthTime) uncertainty.push('ambiguous-local-time-used-earlier-occurrence');
  if (lateZiBoundary && requestedDayBoundary === undefined) uncertainty.push('late-zi-day-boundary-convention-unconfirmed');
  return {
    solarDate: `${civil.year}-${String(civil.month).padStart(2, '0')}-${String(civil.day).padStart(2, '0')}`,
    yearPillar, monthPillar, dayPillar, hourPillar, counts,
    pillarLayers: buildPillarLayers({ yearPillar, monthPillar, dayPillar, hourPillar }),
    elementCountBasis: hourPillar ? 'four-pillars' : 'three-pillars',
    elementCountCharacters: counts.reduce((sum, count) => sum + count, 0),
    elementBalanceEligible,
    weakestElement: elementBalanceEligible ? elements[weakestElementIndex] : null,
    weakestElementIndex, color: elementBalanceEligible ? colors[weakestElementIndex] : null,
    animal: branchAnimals[yearIndex % 12],
    lunarBasis,
    basis: `한국 음양력 변환표 + ${hasPublishedTermData ? '천문 계산 절기시각 자료' : '태양 황경 절기 근사 계산'}`,
    solarTermApproximate,
    termBoundaryUncertain,
    uncertainTermNames: uncertainTerms.map(({ name }) => name),
    ambiguousBirthTime,
    calculation: {
      engine: `k-saju-four-pillars/${SAJU_ENGINE_VERSION}`,
      inputCalendar: profile.calendar === 'lunar' ? 'lunar' : 'solar',
      inputDate: profile.date,
      normalizedSolarDate: `${civil.year}-${String(civil.month).padStart(2, '0')}-${String(civil.day).padStart(2, '0')}`,
      timezone,
      timePrecision: exactInstant ? 'second' : profile.timeUnknown ? 'unknown' : 'minute',
      dayBoundaryConvention,
      dayBoundaryAlternatives,
      solarTimeCorrection,
      lunarConversion: profile.calendar === 'lunar' || lunarBasis
        ? `korean-lunar-calendar/${KOREAN_LUNAR_TABLE_VERSION}`
        : null,
      solarTermMethod: solarTermApproximate ? 'solar-longitude-approximation' : 'kasi-24-term-table',
      uncertainty,
    },
  };
}

export function getDailyReflection(date = new Date(), chart = null) {
  const civil = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  const jdn = Math.floor(Date.UTC(civil.year, civil.month - 1, civil.day) / 86400000) + 2440588;
  const index = mod(jdn + 49, 60);
  const day = pillar(index % 10, index % 12);
  const prompts = [
    ['작은 시작을 하나 정해 보세요.', '초록이나 청록 계열을 한 가지 더해 보세요.'],
    ['속도를 낮추고 우선순위 하나만 골라 보세요.', '따뜻한 붉은 계열을 포인트로 활용해 보세요.'],
    ['끝내지 못한 일을 짧게 정리해 보세요.', '베이지나 황토색으로 차분한 조합을 만들어 보세요.'],
    ['필요한 말을 간결하게 전해 보세요.', '오프화이트나 은은한 회색을 골라 보세요.'],
    ['잠깐 멈춰 몸과 일정을 정돈해 보세요.', '남색이나 짙은 파랑을 작은 포인트로 써 보세요.'],
  ];
  const [action, outfit] = prompts[day.stemElementIndex];
  const personalIndex = chart?.elementBalanceEligible && Number.isInteger(chart.weakestElementIndex)
    ? chart.weakestElementIndex : null;
  const personalActions = ['초록색을 작은 포인트로 더하고, 새로 시작할 일을 하나 골라 보세요.', '붉은 계열을 취향에 맞게 더해 보고, 잠시 호흡을 고른 뒤 움직여 보세요.', '베이지나 황토색을 활용해 편안한 조합을 만들고, 일정을 하나 정돈해 보세요.', '흰색이나 회색을 더해 단정한 조합을 만들고, 필요한 말을 간결하게 전해 보세요.', '남색이나 파랑을 포인트로 활용하고, 잠깐 멈춰 에너지를 돌아보세요.'];
  return { day, action: personalIndex === null ? action : personalActions[personalIndex], outfit, color: colors[personalIndex ?? day.stemElementIndex], personalElement: elements[personalIndex] || null };
}

// All 24 seasonal terms, reusing the bundled Jie instants and the same solar-longitude solver.
export function getAllSolarTerms(year) {
 if(!Number.isInteger(year)||year<1900||year>2100)return [];
 const names=['소한','대한','입춘','우수','경칩','춘분','청명','곡우','입하','소만','망종','하지','소서','대서','입추','처서','백로','추분','한로','상강','입동','소설','대설','동지'];
 return names.map((name,index)=>{
  if(index%2===0)return{name,index,instant:getSolarTermInstant(year,name)};
  const target=(285+index*15)%360;let low=Date.UTC(year,Math.floor(index/2),15),high=Date.UTC(year,Math.floor(index/2)+1,1);
  for(let i=0;i<60;i++){const mid=(low+high)/2;const delta=mod(solarLongitudeDegrees(new Date(mid))-target+180,360)-180;if(delta<0)low=mid;else high=mid;}
  return{name,index,instant:new Date((low+high)/2).toISOString()};
 });
}
