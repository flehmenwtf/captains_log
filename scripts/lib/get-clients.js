#!/usr/bin/env node
const { loadConfig } = require('./config');
const { getFolderNames } = require('./jxa-notes');

function main() {
  const config = loadConfig();
  const clients = getFolderNames(config.notes.account, config.notes.projects_folder);
  process.stdout.write(JSON.stringify(clients));
}

if (require.main === module) {
  try {
    main();
  } catch {
    process.stdout.write(JSON.stringify(["Admin"]));
  }
}
