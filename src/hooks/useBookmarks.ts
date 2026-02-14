import { useStorage } from "@/context/StorageContext";

export function useBookmarks() {
  const { bookmarks, addBookmark, removeBookmark, toggleBookmark } = useStorage();

  return {
    bookmarks,
    add: addBookmark,
    remove: removeBookmark,
    toggle: toggleBookmark,
  };
}
