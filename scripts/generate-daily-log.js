#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { loadConfig } = require('./lib/config');
const { getWeather } = require('./lib/weather');
const { buildDailyLogMarkdown, buildTimeBlocks } = require('./lib/markdown');
const reminders = require('./lib/jxa-reminders');
const notes = require('./lib/jxa-notes');
const calendar = require('./lib/jxa-calendar');

function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ').split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
}

function randomItem(items, fallback) {
  if (!items || !items.length) return fallback;
  return items[Math.floor(Math.random() * items.length)];
}

async function main() {
  const config = loadConfig();
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  const logDir = path.join(config.vault_path, 'logbook', String(yyyy), mm);
  const logName = `${yyyy}.${mm}.${dd}-log.md`;
  const logPath = path.join(logDir, logName);
  if (fs.existsSync(logPath)) return;

  const fallbackWeather = { high: 70, low: 55, wind: 0, clouds: 0 };

  const [
    weather,
    quotesHtml,
    haikuHtml,
    numeroUno,
    plants,
    workouts,
    calendarEvents,
    lifeTasks,
    lifeOverdue,
    workTasks,
    workOverdue,
    flehmenTasks,
    flehmenOverdue,
    worms,
    listNames,
  ] = await Promise.all([
    getWeather(config).catch(() => fallbackWeather),
    Promise.resolve().then(() => notes.getNoteContent(config.notes.account, config.notes.lists_folder, 'Quotes')).catch(() => ''),
    Promise.resolve().then(() => notes.getNoteContent(config.notes.account, config.notes.lists_folder, '俳葛')).catch(() => ''),
    Promise.resolve().then(() => reminders.getAllIncompleteTasks().find((t) => t.notes.includes(config.numero_uno_tag))).catch(() => null),
    Promise.resolve().then(() => reminders.getRemindersFromList(config.reminders_lists.plants, { incomplete: true })).catch(() => []),
    Promise.resolve().then(() => reminders.getRemindersFromList(config.reminders_lists.workouts, { incomplete: true, dueToday: true })).catch(() => []),
    Promise.resolve().then(() => calendar.getTodayEvents(config.calendar.calendars)).catch(() => []),
    Promise.resolve().then(() => reminders.getRemindersFromList(config.reminders_lists.life, { incomplete: true, dueToday: true })).catch(() => []),
    Promise.resolve().then(() => reminders.getRemindersFromList(config.reminders_lists.life, { incomplete: true, overdue: true })).catch(() => []),
    Promise.resolve().then(() => reminders.getRemindersFromList(config.reminders_lists.work, { incomplete: true, dueToday: true })).catch(() => []),
    Promise.resolve().then(() => reminders.getRemindersFromList(config.reminders_lists.work, { incomplete: true, overdue: true })).catch(() => []),
    Promise.resolve().then(() => reminders.getRemindersFromList(config.reminders_lists.flehmen, { incomplete: true, dueToday: true })).catch(() => []),
    Promise.resolve().then(() => reminders.getRemindersFromList(config.reminders_lists.flehmen, { incomplete: true, overdue: true })).catch(() => []),
    Promise.resolve().then(() => reminders.getRemindersFromList(config.reminders_lists.worms, { incomplete: true })).then((x) => x.sort(() => 0.5 - Math.random()).slice(0, config.worms_count)).catch(() => []),
    Promise.resolve().then(() => notes.getFolderNames(config.notes.account, config.notes.lists_folder)).catch(() => ['Books', 'Movies', 'Music'])
  ]);

  const quoteLines = stripHtml(quotesHtml).split('\n').filter(Boolean);
  const pairIndex = Math.floor(Math.random() * Math.max(1, Math.floor(quoteLines.length / 2))) * 2;
  const quoteText = quoteLines[pairIndex] || 'Stay in motion.';
  const quoteAuthor = (quoteLines[pairIndex + 1] || 'Unknown').replace(/^[-–—]\s*/, '');

  const haikuLines = stripHtml(haikuHtml).split('\n').filter(Boolean);
  const shuffled = [...haikuLines].sort(() => Math.random() - 0.5);
  const haiku = shuffled.slice(0, 3).join('\n') || 'Night sea breathing slow\nSmall sparks gather in the dark\nMorning keeps its blade';

  const md = buildDailyLogMarkdown({
    now,
    weather,
    quoteText,
    quoteAuthor,
    numeroUnoTitle: numeroUno?.name || 'Define the highest-leverage move',
    numeroUnoNotes: numeroUno?.notes || '',
    plants,
    workouts,
    dmnTasks: [],
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
    timeBlocks: buildTimeBlocks(calendarEvents, config.time_blocks)
  });

  fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(logPath, md, 'utf8');

  const vaultName = path.basename(config.vault_path);
  const obsidianUri = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(path.relative(config.vault_path, logPath))}`;
  try {
    execFileSync('open', [obsidianUri]);
  } catch {
    // no-op for non-macOS
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
