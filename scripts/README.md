# Dracula's Logbook Scripts

For a simple step-by-step guide, see `../DAILY_LOG_SYSTEM.md`.

## Commands

- `node generate-daily-log.js` — generate today's log note.
- `node log-off.js` — parse today's log and write tracking summaries.
- `node lib/get-clients.js` — JSON list of project folders from Apple Notes.
- `node lib/get-all-tasks.js` — JSON list of incomplete reminders.

## Notes

- JXA integrations require macOS and app permissions for Reminders/Calendar/Notes.
- In non-macOS environments, scripts fall back to safe defaults where possible.
