#!/usr/bin/env node
const reminders = require('./jxa-reminders');

function main() {
  const tasks = reminders.getAllIncompleteTasks();
  process.stdout.write(JSON.stringify(tasks));
}

if (require.main === module) {
  try {
    main();
  } catch {
    process.stdout.write(JSON.stringify([]));
  }
}
