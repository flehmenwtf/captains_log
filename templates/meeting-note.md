<%*
const clients = JSON.parse(await tp.system.shell(`node ${tp.vault.adapter.basePath}/scripts/lib/get-clients.js`));
const client = await tp.system.suggester(clients, clients, false, "Select client:");
const startTime = await tp.system.prompt("Start time (HH:MM):");
const endTime = await tp.system.prompt("End time (HH:MM):");
const topic = await tp.system.prompt("Meeting topic:");
-%>

---
###### ── <% client.toUpperCase() %> ────────────────────────────────
###### <% startTime %> - <% endTime %>

### AGENDA
<% topic %>

### DETAILS


### OPPORTUNITIES


### INTERESTING THOUGHTS


### ACTION ITEMS


###### TAGS: #meeting #<% client.toLowerCase().replace(/\s+/g, '_') %> #[[<% tp.file.title %>]]
---
