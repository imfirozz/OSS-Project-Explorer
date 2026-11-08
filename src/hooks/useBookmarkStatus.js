import { useCallback, useEffect, useState } from "react";
import { getBookmarks, saveBookmarks } from "../utils/localStorage";

const BOOKMARKS_CHANGED_EVENT = "project-explorer:bookmarks-changed";

function useBookmarkStatus(repositoryId) {
  const [bookmarked, setBookmarked] = useState(
    () => repositoryId != null && getBookmarks().includes(repositoryId),
  );

  useEffect(() => {
    const syncBookmarkStatus = () => {
      setBookmarked(repositoryId != null && getBookmarks().includes(repositoryId));
    };

    const handleStorage = (event) => {
      if (event.key === "bookmarks") syncBookmarkStatus();
    };

    syncBookmarkStatus();
    window.addEventListener(BOOKMARKS_CHANGED_EVENT, syncBookmarkStatus);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(BOOKMARKS_CHANGED_EVENT, syncBookmarkStatus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [repositoryId]);

  const toggleBookmark = useCallback(() => {
    if (repositoryId == null) return;

    const bookmarks = getBookmarks();
    const next = bookmarks.includes(repositoryId)
      ? bookmarks.filter((id) => id !== repositoryId)
      : [...bookmarks, repositoryId];

    if (saveBookmarks(next)) {
      setBookmarked(next.includes(repositoryId));
    }
  }, [repositoryId]);

  return { bookmarked, toggleBookmark };
}

export default useBookmarkStatus;
