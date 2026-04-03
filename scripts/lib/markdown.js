function formatTime(d) {
  return `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
}

function buildTimeBlocks(calendarEvents, cfg) {
  const out = [];
  for (let h = cfg.start_hour; h <= cfg.end_hour; h += 1) {
    const next = h + 1;
    const display = `${String(h > 12 ? h - 12 : h).padStart(2, '0')}-${String(next > 12 ? next - 12 : next).padStart(2, '0')}`;
    const overlapping = calendarEvents.filter((e) => {
      const eStart = new Date(e.startDate).getHours();
      const eEnd = new Date(e.endDate).getHours();
      return h >= eStart && h < eEnd;
    });
    out.push({ hour: display, event: overlapping.map((e) => e.title).join(', ') });
  }
  return out;
}

function buildDailyLogMarkdown(input) {
  const {
    now,
    weather,
    quoteText,
    quoteAuthor,
    numeroUnoTitle,
    numeroUnoNotes,
    plants,
    workouts,
    dmnTasks,
    calendarEvents,
    lifeTasks,
    workTasks,
    flehmenTasks,
    lifeOverdue,
    workOverdue,
    flehmenOverdue,
    listNames,
    worms,
    haiku,
    timeBlocks
  } = input;

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
  const hhmm = formatTime(now);
  const ymdDots = `${yyyy}.${mm}.${dd}`;

  return `---
cssclass: daily-log
date: ${yyyy}-${mm}-${dd}
created: ${hhmm}
tags:
  - day_log
  - ${yyyy}.${mm}
---

# DAILY LOG

###### ${dayOfWeek}_${ymdDots}
###### CREATED: ${hhmm} TAGS: #day_log #${yyyy}.${mm}
###### WEATHER: ↑ ${weather.high}°F ↓ ${weather.low}°F ↗ ${weather.wind} mph ☉${weather.clouds}%

---

> *${quoteText}*
> **-${quoteAuthor}**

---

## NUMERO UNO

### ${numeroUnoTitle}
${numeroUnoNotes || ''}

---

## TODAY'S LANDSCAPE

### PLANT CARE
${plants.map((plant) => `#### ${plant.name}\n###### ${plant.recurrenceInfo || ''}\nDid it need water?`).join('\n\n')}

### WORKOUTS
${workouts.map((workout) => `#### ${workout.name}\n###### ${workout.details || ''} ── [DEMO](${workout.url || 'https://example.com'})\nDID YOU GET SWOLL? *Not today.*`).join('\n\n')}

### DMN ACTIVATIONS
${dmnTasks.map((t) => `- ${t.name}`).join('\n')}

### TODAY'S CALENDAR
${calendarEvents.map((e) => `- **${new Date(e.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${new Date(e.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}** │ ${e.title} ${e.location ? '@ ' + e.location : ''}`).join('\n')}

---

## TODAY'S TASKS

### ▌LIFE
${lifeTasks.map((t) => `- [ ] ${t.name}\n  - CLIENT: ${t.list || 'LIFE'}\n  - DUE: ${t.dueDate || ''}`).join('\n')}
${lifeOverdue.length ? `\n> [!overdue] OVERDUE\n${lifeOverdue.map((t) => `> ${t.name}, DUE: ${t.dueDate || ''}`).join('\n')}` : ''}

### ▌WORK
${workTasks.map((t) => `- [ ] ${t.name}\n  - CLIENT: ${t.client || 'ADMIN'}\n  - DUE: ${t.dueDate || ''}`).join('\n')}
${workOverdue.length ? `\n> [!overdue] OVERDUE\n${workOverdue.map((t) => `> ${t.name}, DUE: ${t.dueDate || ''}`).join('\n')}` : ''}

### ▌FLEHMEN
${flehmenTasks.map((t) => `- [ ] ${t.name}\n  - DUE: ${t.dueDate || ''}`).join('\n')}
${flehmenOverdue.length ? `\n> [!overdue] OVERDUE\n${flehmenOverdue.map((t) => `> ${t.name}, DUE: ${t.dueDate || ''}`).join('\n')}` : ''}

---

## TIME BLOCKS

| TIME | FOCUS |
|------|-------|
${timeBlocks.map((block) => `| ${block.hour} | ${block.event || ''} |`).join('\n')}

---

## MEETING NOTES

> [!info] Use Templater: \`Alt+N\` → "Meeting Note" to add meeting notes during the day.

---

## PROJECT LOGS

> [!info] Use Templater: \`Alt+P\` → "Project Log Entry" to add project work during the day.

---

## LISTS
${listNames.map((name) => `\n### ${name.toUpperCase()}\n- `).join('\n')}

---

## WORMS
${worms.map((worm) => `- ∎ ${worm.name}${worm.notes ? `\n  - ${worm.notes}` : ''}${worm.url ? `\n  - LINK: ${worm.url}` : ''}\n  - TAGS: ${worm.tags || ''}`).join('\n\n')}

---

## ROLODEX

> [!info] Use Templater: \`Alt+R\` → "Rolodex Entry" to add a new contact.

---

## TODAY'S AUDIT

**Good Things:**
- 

**Bad Things:**
- 

---

## TOMORROW'S FIRST MOVE

- **Task:** 
- **Notes:** 
- **Due:** 
- **Folder:** 
- **Tags:** 

---

> [!quote] ${haiku}`;
}

module.exports = { buildDailyLogMarkdown, buildTimeBlocks, formatTime };
