#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { loadConfig } = require('./lib/config');

function parseDailyLog(content) {
  const sections = {};
  let currentSection = null;

  for (const line of content.split('\n')) {
    const h2Match = line.match(/^## (.+)/);
    if (h2Match) {
      currentSection = h2Match[1].trim().toUpperCase();
      sections[currentSection] = [];
      continue;
    }
    if (currentSection) sections[currentSection].push(line);
  }

  return sections;
}

function parseTaskSection(lines) {
  const tasks = [];
  let current = null;

  for (const line of lines) {
    const checkMatch = line.match(/^- \[([ x])\] (.+)/i);
    if (checkMatch) {
      if (current) tasks.push(current);
      current = {
        completed: checkMatch[1].toLowerCase() === 'x',
        name: checkMatch[2].trim(),
        client: null,
        due: null,
        isNew: false
      };
      continue;
    }
    if (current) {
      const clientMatch = line.match(/CLIENT:\s*(.+)/i);
      const dueMatch = line.match(/DUE:\s*(.+)/i);
      if (clientMatch) current.client = clientMatch[1].trim();
      if (dueMatch) current.due = dueMatch[1].trim();
    }
  }

  if (current) tasks.push(current);
  return tasks;
}

function parseFocusHours(lines) {
  return lines
    .filter((l) => /^\|\s*\d/.test(l))
    .map((l) => l.split('|').map((p) => p.trim()).filter(Boolean))
    .filter((parts) => parts.length >= 2)
    .map(([time, focus]) => ({ time, focus }));
}

function writeHoursSummary(vaultPath, focusRows) {
  const now = new Date();
  const year = now.getFullYear();
  const week = Math.ceil((((now - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
  const fp = path.join(vaultPath, 'tracking', 'hours', `${year}-W${String(week).padStart(2, '0')}.md`);
  fs.mkdirSync(path.dirname(fp), { recursive: true });

  const tally = new Map();
  for (const { focus } of focusRows) {
    if (!focus) continue;
    tally.set(focus, (tally.get(focus) || 0) + 1);
  }
  const date = now.toISOString().slice(0, 10);
  const columns = [...tally.entries()].flatMap(([k, v]) => [k, `${v}h`]).join(' | ');
  fs.appendFileSync(fp, `| ${date} | ${columns} |\n`);
}

function main() {
  const config = loadConfig();
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const logPath = path.join(config.vault_path, 'logbook', `${yyyy}.${mm}.${dd}-log.md`);

  if (!fs.existsSync(logPath)) {
    throw new Error(`Daily log not found: ${logPath}`);
  }

  const content = fs.readFileSync(logPath, 'utf8');
  const sections = parseDailyLog(content);

  const tasks = parseTaskSection(sections["TODAY'S TASKS"] || []);
  const completedCount = tasks.filter((t) => t.completed).length;

  const focusRows = parseFocusHours(sections['TIME BLOCKS'] || []);
  if (focusRows.length) writeHoursSummary(config.vault_path, focusRows);

  const habitsPath = path.join(config.vault_path, 'tracking', 'habits.md');
  fs.mkdirSync(path.dirname(habitsPath), { recursive: true });
  if (!fs.existsSync(habitsPath)) {
    fs.writeFileSync(habitsPath, '| Date | Good | Bad |\n|---|---|---|\n');
  }

  console.log(JSON.stringify({
    date: `${yyyy}-${mm}-${dd}`,
    parsedSections: Object.keys(sections),
    tasksParsed: tasks.length,
    tasksCompleted: completedCount,
    focusRows: focusRows.length
  }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { parseDailyLog, parseTaskSection };
