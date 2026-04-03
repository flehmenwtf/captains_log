# Dracula's Logbook Dashboard

## Recent Daily Logs

```dataview
TABLE date, created
FROM "logbook"
WHERE contains(tags, "day_log")
SORT date DESC
LIMIT 14
```

## Meetings This Week

```dataview
TABLE file.mtime as "Updated"
FROM "meeting_notes"
SORT file.mtime DESC
LIMIT 20
```

## Active Projects

```dataview
TABLE file.mtime as "Updated"
FROM "project_logs"
SORT file.mtime DESC
LIMIT 20
```
