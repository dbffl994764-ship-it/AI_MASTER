// Lunar conversion is outside this step's solar-date UI. Keep the reference
// engine import-safe and explicit about the unavailable optional conversion.
export default class KoreanLunarCalendar {
  setLunarDate() { return false; }
  setSolarDate() { return false; }
  getLunarCalendar() { return {}; }
  getSolarCalendar() { return {}; }
}
