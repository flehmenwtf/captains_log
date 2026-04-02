const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function expandHome(p) {
  if (!p) return p;
  return p.startsWith('~/') ? path.join(os.homedir(), p.slice(2)) : p;
}

function loadConfig(configPath = path.join(__dirname, '..', 'config.json')) {
  const raw = fs.readFileSync(configPath, 'utf8');
  const cfg = JSON.parse(raw);
  cfg.vault_path = expandHome(cfg.vault_path);
  return cfg;
}

module.exports = { loadConfig, expandHome };
