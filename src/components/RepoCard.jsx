import { useState } from "react";
import {
  FaStar,
  FaCodeBranch,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { FiBookmark, FiCheck } from "react-icons/fi";

import {
  getNotes,
  saveNotes,
} from "../utils/localStorage";
import useBookmarkStatus from "../hooks/useBookmarkStatus";

function RepoCard({ repo }) {
  const { bookmarked, toggleBookmark } = useBookmarkStatus(repo.id);
  const [note, setNote] = useState(() => getNotes()[repo.id] || "");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const description = repo.description || "No description provided.";
  const canExpandDescription = description.length > 120;
  const descriptionId = `repository-description-${repo.id}`;

  const handleNote = (value) => {
    setNote(value);

    const notes = getNotes();
    notes[repo.id] = value;

    saveNotes(notes);
  };

  return (
    <article className="repository-card flex min-h-full min-w-0 flex-col gap-3 rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-4 shadow-sm shadow-[rgba(75,46,31,0.04)] transition-colors duration-200 hover:border-[#CDB79F] hover:bg-[#EFE5D9] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="mb-1 block break-words text-[10px] font-semibold uppercase tracking-[0.14em] text-[#74685D]">
            {repo.owner?.login}
          </span>
          <h2 className="m-0 line-clamp-2 break-words text-lg font-semibold tracking-[-0.04em] text-[#171513]">
            {repo.name}
          </h2>
        </div>

        <button
          type="button"
          onClick={toggleBookmark}
          aria-pressed={bookmarked}
          className={`repository-bookmark flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5E3C] ${
            bookmarked
              ? "border-[#8B5E3C] bg-[#8B5E3C] text-[#FAF6F0]"
              : "border-[#D8C6B3] bg-[#FAF6F0] text-[#74685D] hover:bg-[#EFE5D9] hover:text-[#4B2E1F]"
          }`}
          aria-label={
            bookmarked
              ? `Remove ${repo.full_name || repo.name} from bookmarks`
              : `Bookmark ${repo.full_name || repo.name}`
          }
          title={bookmarked ? "Saved to bookmarks" : "Save to bookmarks"}
        >
          {bookmarked
            ? <FiCheck size={17} aria-hidden="true" />
            : <FiBookmark size={15} aria-hidden="true" />}
        </button>
      </div>

      <div className="min-h-[72px] min-w-0">
        <p
          id={descriptionId}
          className={`break-words text-sm leading-6 text-[#74685D] ${
            descriptionExpanded ? "" : "line-clamp-3"
          }`}
        >
          {description}
        </p>
        {canExpandDescription && (
          <button
            type="button"
            aria-expanded={descriptionExpanded}
            aria-controls={descriptionId}
            onClick={() => setDescriptionExpanded((expanded) => !expanded)}
            className="mt-1 text-xs font-semibold text-[#8B5E3C] underline decoration-[#CDB79F] underline-offset-2 transition-colors hover:text-[#4B2E1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5E3C]"
          >
            {descriptionExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-[#74685D]">
        <span className="inline-flex items-center gap-1" aria-label={`${repo.stargazers_count} stars`}>
          <FaStar size={11} />
          {repo.stargazers_count}
        </span>
        <span className="inline-flex items-center gap-1" aria-label={`${repo.forks_count} forks`}>
          <FaCodeBranch size={11} />
          {repo.forks_count}
        </span>
        {repo.language && (
          <span className="repository-language ml-auto inline-flex max-w-full break-words rounded-full bg-[#F7F2EB] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6D5948]">
            {repo.language}
          </span>
        )}
      </div>

      <textarea
        placeholder="Write notes..."
        aria-label={`Notes for ${repo.full_name || repo.name}`}
        className="repository-notes min-h-[76px] w-full resize-y rounded-xl border border-[#D8C6B3] bg-[#FAF6F0] px-3 py-2 text-sm text-[#171513] outline-none transition focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/15 placeholder:text-[#95877A]"
        value={note}
        onChange={(e) => handleNote(e.target.value)}
      />

      <a
        href={repo.html_url}
        target="_blank"
        rel="noreferrer"
        className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#4B2E1F] transition-colors hover:text-[#8B5E3C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5E3C]"
      >
        View repository
        <FaExternalLinkAlt size={12} />
      </a>
    </article>
  );
}

export default RepoCard;