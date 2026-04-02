<%*
const tasks = JSON.parse(await tp.system.shell(`node ${tp.vault.adapter.basePath}/scripts/lib/get-all-tasks.js`));
const taskNames = tasks.map(t => `[${t.list}] ${t.name}`);
taskNames.unshift("✏️ Write a new task");
const selected = await tp.system.suggester(taskNames, taskNames, false, "Tomorrow's first move:");

let taskTitle, taskNotes, taskDue, taskFolder, taskTags;
if (selected === "✏️ Write a new task") {
  taskTitle = await tp.system.prompt("Task title:");
  taskNotes = await tp.system.prompt("Notes (optional):", "");
  taskDue = await tp.system.prompt("Due date (YYYY-MM-DD):", tp.date.now("YYYY-MM-DD", 1));
  taskFolder = await tp.system.suggester(["Life", "Work", "Flehmen"], ["Life", "Work", "Flehmen"], false, "List:");
} else {
  const match = tasks.find(t => `[${t.list}] ${t.name}` === selected);
  taskTitle = match.name;
  taskNotes = match.notes || "";
  taskDue = match.dueDate || "";
  taskFolder = match.list;
}
taskTags = "#numero_uno";
-%>

- **Task:** <% taskTitle %>
- **Notes:** <% taskNotes %>
- **Due:** <% taskDue %>
- **Folder:** <% taskFolder %>
- **Tags:** <% taskTags %>
