// Custom event system for cross-component updates when bookmarks change
const BOOKMARKS_UPDATE_EVENT = "gf:bookmarks:update";
const TOKEN_UPDATE_EVENT = "gf:token:update";

export function emitBookmarksUpdate() {
  window.dispatchEvent(new Event(BOOKMARKS_UPDATE_EVENT));
}

export function emitTokenUpdate() {
  window.dispatchEvent(new Event(TOKEN_UPDATE_EVENT));
}

export function onBookmarksUpdate(callback: () => void) {
  window.addEventListener(BOOKMARKS_UPDATE_EVENT, callback);
  return () => window.removeEventListener(BOOKMARKS_UPDATE_EVENT, callback);
}

export function onTokenUpdate(callback: () => void) {
  window.addEventListener(TOKEN_UPDATE_EVENT, callback);
  return () => window.removeEventListener(TOKEN_UPDATE_EVENT, callback);
}
