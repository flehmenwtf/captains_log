<%*
const clients = JSON.parse(await tp.system.shell(`node ${tp.vault.adapter.basePath}/scripts/lib/get-clients.js`));
const client = await tp.system.suggester(clients, clients, false, "Select client/parent:");
const projectName = await tp.system.prompt("Project name:");
const realm = await tp.system.suggester(["Work", "Life", "Flehmen"], ["work", "life", "flehmen"], false, "Realm:");
const now = tp.date.now("YYYY.MM.DD HH:mm");
-%>

---
###### PROJECT: <% projectName.toUpperCase() %>
###### REALM: #<% realm %>
###### PARENT: #<% client.toLowerCase().replace(/\s+/g, '_') %>

### Resources
── >>[[<% tp.file.title %>]] <% now %> ──
-
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

### Research


### Ideas // Concepts
── >>[[<% tp.file.title %>]] <% now %> ──
-
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

### Scratchpad


### Next Steps


###### TAGS: #project #<% client.toLowerCase().replace(/\s+/g, '_') %> #<% projectName.toLowerCase().replace(/\s+/g, '_') %>
---
