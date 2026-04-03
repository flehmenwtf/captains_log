const { runJXA } = require('./jxa');

function getTodayEvents(calendarNames = []) {
  return runJXA(`
ObjC.import('Foundation');
const Calendar = Application('Calendar');
const calNames = ${JSON.stringify(calendarNames)};
const now = new Date();
const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const end = new Date(start); end.setDate(end.getDate() + 1);
const selected = calNames.length ? Calendar.calendars.whose({ name: { _in: calNames } })() : Calendar.calendars();
const events = [];
for (const c of selected) {
  for (const e of c.events.whose({ startDate: { _greaterThanEquals: start }, endDate: { _lessThanEquals: end } })()) {
    events.push({
      title: String(e.summary()),
      startDate: new Date(e.startDate()).toISOString(),
      endDate: new Date(e.endDate()).toISOString(),
      location: String(e.location() || ''),
      calendar: String(c.name())
    });
  }
}
JSON.stringify(events);
`);
}

module.exports = { getTodayEvents };
