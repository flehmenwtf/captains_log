const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function assertMacOS() {
  if (process.platform !== 'darwin') {
    throw new Error('JXA helpers require macOS (darwin).');
  }
}

function runJXA(script) {
  assertMacOS();
  const tmpPath = path.join(os.tmpdir(), `jxa-${Date.now()}-${Math.random().toString(36).slice(2)}.js`);
  fs.writeFileSync(tmpPath, script, 'utf8');
  try {
    const result = execFileSync('osascript', ['-l', 'JavaScript', tmpPath], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });
    return result.trim() ? JSON.parse(result.trim()) : null;
  } finally {
    fs.rmSync(tmpPath, { force: true });
  }
}

module.exports = { runJXA, assertMacOS };
