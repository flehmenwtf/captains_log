const { runJXA } = require('./jxa');

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function runReminders(body) {
  return runJXA(`
ObjC.import('Foundation');
const app = Application('Reminders');
app.includeStandardAdditions = true;
${body}
`);
}

function getRemindersFromList(listName, filters = {}) {
  const f = JSON.stringify(filters);
  return runReminders(`
const listName = "${esc(listName)}";
const filters = ${f};
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

const list = app.lists.byName(listName);
if (!list.exists()) {
  JSON.stringify([]);
} else {
  const reminders = list.reminders().map(r => {
    const due = r.dueDate();
    const dueDate = due ? new Date(due) : null;
    const dueIso = dueDate ? dueDate.toISOString() : null;
    const completed = Boolean(r.completed());
    const body = String(r.body() || '');
    const tags = (body.match(/#[\\w_\\-]+/g) || []).join(' ');
    return {
      id: String(r.id()),
      list: listName,
      name: String(r.name()),
      notes: body,
      completed,
      dueDate: dueIso,
      dueToday: dueDate ? (dueDate >= today && dueDate < tomorrow) : false,
      overdue: dueDate ? (dueDate < today && !completed) : false,
      tags
    };
  });
  let out = reminders;
  if (filters.incomplete) out = out.filter(x => !x.completed);
  if (filters.dueToday) out = out.filter(x => x.dueToday);
  if (filters.overdue) out = out.filter(x => x.overdue);
  if (filters.tag) out = out.filter(x => x.tags.includes(filters.tag));
  JSON.stringify(out);
}
`);
}

function getCompletedToday(listName) {
  return runReminders(`
const list = app.lists.byName("${esc(listName)}");
if (!list.exists()) {
  JSON.stringify([]);
} else {
  const out = list.reminders().filter(r => Boolean(r.completed())).map(r => ({ id: String(r.id()), name: String(r.name()) }));
  JSON.stringify(out);
}
`);
}

function getAllIncompleteTasks() {
  return runReminders(`
const out = [];
for (const list of app.lists()) {
  for (const r of list.reminders()) {
    if (!Boolean(r.completed())) {
      const due = r.dueDate();
      out.push({
        id: String(r.id()),
        list: String(list.name()),
        name: String(r.name()),
        notes: String(r.body() || ''),
        dueDate: due ? new Date(due).toISOString().slice(0, 10) : ''
      });
    }
  }
}
JSON.stringify(out);
`);
}

function completeReminder(listName, reminderName) {
  return runReminders(`
const list = app.lists.byName("${esc(listName)}");
if (!list.exists()) {
  JSON.stringify({ ok: false, reason: 'list_not_found' });
} else {
  const target = list.reminders.byName("${esc(reminderName)}");
  if (!target.exists()) {
    JSON.stringify({ ok: false, reason: 'reminder_not_found' });
  } else {
    target.completed = true;
    JSON.stringify({ ok: true });
  }
}
`);
}

function createReminder(listName, { name, notes = '', dueDate = '', tags = '' }) {
  return runReminders(`
const list = app.lists.byName("${esc(listName)}");
if (!list.exists()) {
  JSON.stringify({ ok: false, reason: 'list_not_found' });
} else {
  const payload = {
    name: "${esc(name)}",
    body: "${esc([notes, tags].filter(Boolean).join('\n').trim())}"
  };
  if ("${esc(dueDate)}") payload.dueDate = new Date("${esc(dueDate)}");
  list.reminders.push(app.Reminder(payload));
  JSON.stringify({ ok: true });
}
`);
}

function updateReminder(listName, reminderName, { name, notes, dueDate, tags } = {}) {
  return runReminders(`
const list = app.lists.byName("${esc(listName)}");
if (!list.exists()) {
  JSON.stringify({ ok: false, reason: 'list_not_found' });
} else {
  const target = list.reminders.byName("${esc(reminderName)}");
  if (!target.exists()) {
    JSON.stringify({ ok: false, reason: 'reminder_not_found' });
  } else {
    if (${name ? 'true' : 'false'}) target.name = "${esc(name || '')}";
    if (${notes !== undefined ? 'true' : 'false'} || ${tags !== undefined ? 'true' : 'false'}) {
      const currentBody = String(target.body() || '');
      const stripped = currentBody.replace(/#[\\w_\\-]+/g, '').trim();
      const nextNotes = ${notes !== undefined ? `"${esc(notes || '')}"` : 'stripped'};
      const nextTags = ${tags !== undefined ? `"${esc(tags || '')}"` : '(currentBody.match(/#[\\w_\\-]+/g) || []).join(" ")'};
      target.body = [nextNotes, nextTags].filter(Boolean).join('\\n').trim();
    }
    if (${dueDate !== undefined ? 'true' : 'false'}) {
      target.dueDate = "${esc(dueDate || '')}" ? new Date("${esc(dueDate || '')}") : null;
    }
    JSON.stringify({ ok: true });
  }
}
`);
}

function pushRecurringReminder(listName, reminderName, daysToPush = 1) {
  return runReminders(`
const list = app.lists.byName("${esc(listName)}");
if (!list.exists()) {
  JSON.stringify({ ok: false, reason: 'list_not_found' });
} else {
  const target = list.reminders.byName("${esc(reminderName)}");
  if (!target.exists()) {
    JSON.stringify({ ok: false, reason: 'reminder_not_found' });
  } else {
    const due = target.dueDate();
    const base = due ? new Date(due) : new Date();
    base.setDate(base.getDate() + ${Number(daysToPush) || 1});
    target.dueDate = base;
    JSON.stringify({ ok: true, dueDate: base.toISOString() });
  }
}
`);
}

function addTagToReminder(listName, reminderName, tag) {
  return runReminders(`
const list = app.lists.byName("${esc(listName)}");
if (!list.exists()) {
  JSON.stringify({ ok: false, reason: 'list_not_found' });
} else {
  const target = list.reminders.byName("${esc(reminderName)}");
  if (!target.exists()) {
    JSON.stringify({ ok: false, reason: 'reminder_not_found' });
  } else {
    const current = String(target.body() || '');
    const tags = new Set((current.match(/#[\\w_\\-]+/g) || []));
    tags.add("${esc(tag)}");
    const notesOnly = current.replace(/#[\\w_\\-]+/g, '').trim();
    target.body = [notesOnly, [...tags].join(' ')].filter(Boolean).join('\\n').trim();
    JSON.stringify({ ok: true });
  }
}
`);
}

function removeTagFromAllReminders(tag) {
  return runReminders(`
let updated = 0;
for (const list of app.lists()) {
  for (const r of list.reminders()) {
    const body = String(r.body() || '');
    if (body.includes("${esc(tag)}")) {
      const cleaned = body
        .split(/\\s+/)
        .filter(t => t !== "${esc(tag)}")
        .join(' ')
        .replace(/\\n\\s+/g, '\\n')
        .trim();
      r.body = cleaned;
      updated += 1;
    }
  }
}
JSON.stringify({ ok: true, updated });
`);
}

function deleteReminder(listName, reminderName) {
  return runReminders(`
const list = app.lists.byName("${esc(listName)}");
if (!list.exists()) {
  JSON.stringify({ ok: false, reason: 'list_not_found' });
} else {
  const target = list.reminders.byName("${esc(reminderName)}");
  if (!target.exists()) {
    JSON.stringify({ ok: false, reason: 'reminder_not_found' });
  } else {
    app.delete(target);
    JSON.stringify({ ok: true });
  }
}
`);
}

module.exports = {
  getRemindersFromList,
  getCompletedToday,
  getAllIncompleteTasks,
  completeReminder,
  createReminder,
  updateReminder,
  pushRecurringReminder,
  addTagToReminder,
  removeTagFromAllReminders,
  deleteReminder
};
