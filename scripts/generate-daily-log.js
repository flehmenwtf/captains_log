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
  const skipApple = process.env.SKIP_APPLE_INTEGRATIONS === '1';
  console.log(`[generate-daily-log] starting (skipApple=${skipApple})`);
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  const logDir = path.join(config.vault_path, 'logbook');
  const logName = `${yyyy}.${mm}.${dd}-log.md`;
  const logPath = path.join(logDir, logName);
  if (fs.existsSync(logPath)) {
    console.log(`[generate-daily-log] note already exists: ${logPath}`);
    return;
  }

  const fallbackWeather = { high: 70, low: 55, wind: 0, clouds: 0 };
  const safe = async (label, fn, fallback) => {
    try {
      return await Promise.resolve().then(fn);
    } catch (error) {
      console.warn(`[generate-daily-log] ${label} unavailable: ${error.message}`);
      return fallback;
    }
  };

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
    safe('weather', () => getWeather(config), fallbackWeather),
    safe('quotes', () => (skipApple ? '' : notes.getNoteContent(config.notes.account, config.notes.lists_folder, 'Quotes')), ''),
    safe('haiku', () => (skipApple ? '' : notes.getNoteContent(config.notes.account, config.notes.lists_folder, '俳葛')), ''),
    safe('numero_uno', () => (skipApple ? null : reminders.getAllIncompleteTasks().find((t) => t.notes.includes(config.numero_uno_tag))), null),
    safe('plants', () => (skipApple ? [] : reminders.getRemindersFromList(config.reminders_lists.plants, { incomplete: true })), []),
    safe('workouts', () => (skipApple ? [] : reminders.getRemindersFromList(config.reminders_lists.workouts, { incomplete: true, dueToday: true })), []),
    safe('calendar', () => (skipApple ? [] : calendar.getTodayEvents(config.calendar.calendars)), []),
    safe('life_tasks', () => (skipApple ? [] : reminders.getRemindersFromList(config.reminders_lists.life, { incomplete: true, dueToday: true })), []),
    safe('life_overdue', () => (skipApple ? [] : reminders.getRemindersFromList(config.reminders_lists.life, { incomplete: true, overdue: true })), []),
    safe('work_tasks', () => (skipApple ? [] : reminders.getRemindersFromList(config.reminders_lists.work, { incomplete: true, dueToday: true })), []),
    safe('work_overdue', () => (skipApple ? [] : reminders.getRemindersFromList(config.reminders_lists.work, { incomplete: true, overdue: true })), []),
    safe('flehmen_tasks', () => (skipApple ? [] : reminders.getRemindersFromList(config.reminders_lists.flehmen, { incomplete: true, dueToday: true })), []),
    safe('flehmen_overdue', () => (skipApple ? [] : reminders.getRemindersFromList(config.reminders_lists.flehmen, { incomplete: true, overdue: true })), []),
    safe('worms', () => (skipApple ? [] : reminders.getRemindersFromList(config.reminders_lists.worms, { incomplete: true }).sort(() => 0.5 - Math.random()).slice(0, config.worms_count)), []),
    safe('lists', () => (skipApple ? ['Books', 'Movies', 'Music'] : notes.getFolderNames(config.notes.account, config.notes.lists_folder)), ['Books', 'Movies', 'Music'])
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
  console.log(`[generate-daily-log] note created: ${logPath}`);

  const vaultName = path.basename(config.vault_path);
  const obsidianUri = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(path.relative(config.vault_path, logPath))}`;
  try {
    execFileSync('open', [obsidianUri]);
  } catch {
    // no-op for non-macOS
  }
  console.log('[generate-daily-log] done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
