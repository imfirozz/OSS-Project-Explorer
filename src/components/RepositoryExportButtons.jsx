import { FiDownload } from "react-icons/fi";
import { downloadRepositories } from "../utils/repositoryExport";

function RepositoryExportButtons({
  repositories,
  filename,
  metadata,
  label = "Export",
}) {
  const disabled = repositories.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={label}>
      <span className="mr-1 text-[11px] font-medium text-[#74685D]">{label}</span>
      {["csv", "json"].map((format) => (
        <button
          key={format}
          type="button"
          onClick={() => downloadRepositories(repositories, format, filename, metadata)}
          disabled={disabled}
          aria-label={`Download ${repositories.length} repositories as ${format.toUpperCase()}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E8DCCF] bg-[#FAF6F0] px-3 text-[11px] font-semibold uppercase tracking-wide text-[#4B2E1F] transition-colors hover:bg-[#EFE5D9] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiDownload size={13} />
          {format}
        </button>
      ))}
    </div>
  );
}

export default RepositoryExportButtons;
