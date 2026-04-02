const { runJXA } = require('./jxa');

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function getNoteContent(account, folderName, noteName) {
  return runJXA(`
const app = Application('Notes');
const account = app.accounts.byName("${esc(account)}");
if (!account.exists()) {
  JSON.stringify({ content: '' });
} else {
  const folder = account.folders.byName("${esc(folderName)}");
  if (!folder.exists()) {
    JSON.stringify({ content: '' });
  } else {
    const note = folder.notes.byName("${esc(noteName)}");
    JSON.stringify({ content: note.exists() ? String(note.body()) : '' });
  }
}
`).content;
}

function getFolderNames(account, parentFolder) {
  return runJXA(`
const app = Application('Notes');
const account = app.accounts.byName("${esc(account)}");
if (!account.exists()) {
  JSON.stringify([]);
} else {
  const folder = account.folders.byName("${esc(parentFolder)}");
  if (!folder.exists()) {
    JSON.stringify([]);
  } else {
    JSON.stringify(folder.folders().map(f => String(f.name())));
  }
}
`);
}

function getNoteNames(account, folderName) {
  return runJXA(`
const app = Application('Notes');
const account = app.accounts.byName("${esc(account)}");
if (!account.exists()) {
  JSON.stringify([]);
} else {
  const folder = account.folders.byName("${esc(folderName)}");
  if (!folder.exists()) {
    JSON.stringify([]);
  } else {
    JSON.stringify(folder.notes().map(n => String(n.name())));
  }
}
`);
}

function appendToNote(account, folderName, noteName, content) {
  return runJXA(`
const app = Application('Notes');
const account = app.accounts.byName("${esc(account)}");
if (!account.exists()) {
  JSON.stringify({ ok: false, reason: 'account_not_found' });
} else {
  const folder = account.folders.byName("${esc(folderName)}");
  if (!folder.exists()) {
    JSON.stringify({ ok: false, reason: 'folder_not_found' });
  } else {
    const note = folder.notes.byName("${esc(noteName)}");
    if (!note.exists()) {
      JSON.stringify({ ok: false, reason: 'note_not_found' });
    } else {
      note.body = String(note.body()) + "<br>" + "${esc(content)}";
      JSON.stringify({ ok: true });
    }
  }
}
`);
}

function createNote(account, folderName, name, content = '') {
  return runJXA(`
const app = Application('Notes');
const account = app.accounts.byName("${esc(account)}");
if (!account.exists()) {
  JSON.stringify({ ok: false, reason: 'account_not_found' });
} else {
  const folder = account.folders.byName("${esc(folderName)}");
  if (!folder.exists()) {
    JSON.stringify({ ok: false, reason: 'folder_not_found' });
  } else {
    if (folder.notes.byName("${esc(name)}").exists()) {
      JSON.stringify({ ok: false, reason: 'note_exists' });
    } else {
      const n = app.Note({ name: "${esc(name)}", body: "${esc(content)}" });
      folder.notes.push(n);
      JSON.stringify({ ok: true });
    }
  }
}
`);
}

function noteExists(account, folderName, noteName) {
  return runJXA(`
const app = Application('Notes');
const account = app.accounts.byName("${esc(account)}");
if (!account.exists()) {
  JSON.stringify(false);
} else {
  const folder = account.folders.byName("${esc(folderName)}");
  if (!folder.exists()) {
    JSON.stringify(false);
  } else {
    JSON.stringify(Boolean(folder.notes.byName("${esc(noteName)}").exists()));
  }
}
`);
}

module.exports = {
  getNoteContent,
  getFolderNames,
  getNoteNames,
  appendToNote,
  createNote,
  noteExists
};
