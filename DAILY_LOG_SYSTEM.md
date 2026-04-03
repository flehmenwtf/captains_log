# Daily Log System

A daily logging system built for Obsidian on macOS using Apple Reminders, Calendar, and Notes via JXA.

---

## 0) What this does

- **Morning:** generates today’s log note in your vault (`logbook/YYYY.MM.DD-log.md`).
- **Evening:** parses your daily note and writes tracking summaries (hours/habits scaffolding).
- **During day:** use Templater snippets for meeting/project/rolodex/tomorrow-first-move blocks.

---

## 1) One-time setup (5–10 minutes)

1. Copy this repo’s contents into your Obsidian vault root at:
   - `/Users/cobra/castle/blood-cauldron/`
2. Confirm Node is installed:
   ```bash
   node -v
   ```
   You want **v22+**.
3. (Optional) install dependencies in `scripts/` if you later add any:
   ```bash
   cd /Users/cobra/castle/blood-cauldron/scripts
   npm install
   ```
4. Verify config is set (already populated in this repo):
   - `scripts/config.json`
   - vault path
   - weather API key
   - reminders/calendar/note folder names

---

## 2) macOS permissions (first run)

On first run, macOS should prompt to allow automation access to:
- **Reminders**
- **Notes**
- **Calendar**

Click **Allow** for each prompt.

If prompts do not appear or you clicked Don’t Allow:
- macOS Settings → Privacy & Security → Automation
- Enable permissions for Terminal/iTerm (or your launcher app) to control those apps.

---

## 3) Daily usage

## Morning generation

Run:
```bash
node /Users/cobra/castle/blood-cauldron/scripts/generate-daily-log.js
```

Expected result:
- Creates today’s file at `logbook/YYYY.MM.DD-log.md`
- Opens the note in Obsidian (if URI opening succeeds)


## Evening log-off

Run:
```bash
node /Users/cobra/castle/blood-cauldron/scripts/log-off.js
```

Expected result:
- Parses the daily note sections
- Updates/creates tracking outputs under `tracking/`
- Prints a JSON summary in terminal

---

## 4) Templater usage in Obsidian

Put these in your Obsidian templates folder (already in repo under `templates/`):
- `meeting-note.md`
- `project-log-entry.md`
- `rolodex-entry.md`
- `tomorrow-first-move.md`

Recommended hotkeys:
- Meeting Note → `Alt+N`
- Project Log Entry → `Alt+P`
- Rolodex Entry → `Alt+R`

---

## 5) CSS snippet enablement

In Obsidian:
1. Settings → Appearance → CSS snippets
2. Enable `.obsidian/snippets/03-daily-log.css`

---

## 6) Quick health check commands

```bash
cd /Users/cobra/castle/blood-cauldron/scripts
node --check generate-daily-log.js
node --check log-off.js
node --check lib/*.js
```

---

## 7) Troubleshooting (easy mode)

### “JXA helpers require macOS (darwin)”
You are not running on macOS. Run scripts on your Mac.

### “not authorized to send Apple events”
Grant permissions in Privacy & Security → Automation.

### “AppleEvent timed out (-1712)”
Try a fallback run that skips Apple app reads but still generates the note:
```bash
SKIP_APPLE_INTEGRATIONS=1 node /Users/cobra/castle/blood-cauldron/scripts/generate-daily-log.js
```
Then re-run normally after permissions are granted and apps are responsive.

### “It looks stalled / no prompt returns”
- The generator now prints progress logs (`starting`, `note created`, `done`).
- If weather is slow, it auto-times out (default 8s) and continues with fallback values.
- If you already have today’s note, it exits with `note already exists`.

### Daily log didn’t generate
- Check if today’s note already exists (script exits silently if so).
- Recheck vault path in `scripts/config.json`.

### Weather missing
- Verify API key and internet connection.
- Script has fallback weather values, so generation should still continue.

---

## 8) Your 10-second routine

- Morning: run `generate-daily-log.js`
- Day: fill note + use templates
- Evening: run `log-off.js`

Done.
