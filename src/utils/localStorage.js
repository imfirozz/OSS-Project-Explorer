function readStoredValue(key, fallback, isValid) {
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return fallback;

    const parsed = JSON.parse(value);
    if (!isValid(parsed)) throw new TypeError(`Invalid stored value for "${key}".`);
    return parsed;
  } catch (error) {
    console.warn(`Unable to read "${key}" from localStorage; using defaults.`, error);
    try {
      window.localStorage.removeItem(key);
    } catch (removeError) {
      console.warn(`Unable to clear invalid "${key}" from localStorage.`, removeError);
    }
    return fallback;
  }
}

function writeStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Unable to save "${key}" to localStorage.`, error);
    return false;
  }
}

export const getBookmarks = () =>
  readStoredValue("bookmarks", [], Array.isArray);

export const saveBookmarks = (bookmarks) => {
  if (!Array.isArray(bookmarks)) {
    throw new TypeError("Bookmarks must be an array.");
  }
  const saved = writeStoredValue("bookmarks", bookmarks);
  if (saved && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event("project-explorer:bookmarks-changed"));
  }
  return saved;
};

export const getComparedRepos = () =>
  readStoredValue(
    "project-explorer-compare",
    [],
    (value) => Array.isArray(value) && value.every((repo) => repo && typeof repo === "object"),
  );

export const saveComparedRepos = (repos) => {
  if (!Array.isArray(repos)) {
    throw new TypeError("Compared repositories must be an array.");
  }
  return writeStoredValue("project-explorer-compare", repos);
};

export const getNotes = () =>
  readStoredValue("notes", {}, (value) => (
    value !== null && typeof value === "object" && !Array.isArray(value)
  ));

export const saveNotes = (notes) => {
  if (notes === null || typeof notes !== "object" || Array.isArray(notes)) {
    throw new TypeError("Repository notes must be an object.");
  }
  return writeStoredValue("notes", notes);
};
