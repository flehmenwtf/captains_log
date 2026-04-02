<%*
const name = await tp.system.prompt("Contact name:");
const discipline = await tp.system.prompt("Discipline/role:");
-%>

---
### <% name %>
###### DISCIPLINE: <% discipline %>

###### Website:
###### Social:
###### Contact:

### NOTABLE WORK
-

###### TAGS: #rolodex #<% discipline.toLowerCase().replace(/\s+/g, '_') %>
---
