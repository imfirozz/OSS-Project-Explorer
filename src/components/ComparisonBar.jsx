import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLayers, FiX } from "react-icons/fi";
import { getComparedRepos, saveComparedRepos } from "../utils/localStorage";

function ComparisonBar() {
  const [compared, setCompared] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    function checkCompared() {
      setCompared(getComparedRepos());
    }
    checkCompared();

    window.addEventListener("storage", checkCompared);
    // Custom event listener for cross-component updates within the app
    window.addEventListener("project-explorer-compare-updated", checkCompared);

    return () => {
      window.removeEventListener("storage", checkCompared);
      window.removeEventListener("project-explorer-compare-updated", checkCompared);
    };
  }, []);

  const removeRepo = (id) => {
    const next = compared.filter((repo) => repo.id !== id);
    saveComparedRepos(next);
    setCompared(next);
    window.dispatchEvent(new Event("project-explorer-compare-updated"));
  };

  const clearAll = () => {
    saveComparedRepos([]);
    setCompared([]);
    window.dispatchEvent(new Event("project-explorer-compare-updated"));
  };

  if (compared.length === 0) return null;

  return (
    <aside
      aria-label="Repository comparison drawer"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[min(92vw,640px)] rounded-2xl border border-[#D8C6B3] bg-[#FAF6F0] p-4 shadow-[0_16px_40px_rgba(75,46,31,0.18)] backdrop-blur-md"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3E2D0] text-[#8B5E3C]">
            <FiLayers size={18} />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-[13px] font-semibold text-[#171513]">
              Compare repositories ({compared.length}/4)
            </p>
            <div className="flex flex-wrap gap-1 mt-0.5 max-w-[320px]">
              {compared.map((repo) => (
                <span
                  key={repo.id}
                  className="inline-flex items-center gap-1 rounded-md bg-[#EFE5D9] px-2 py-0.5 text-[11px] font-medium text-[#4B2E1F]"
                >
                  <span className="truncate max-w-[100px]">{repo.name}</span>
                  <button
                    type="button"
                    onClick={() => removeRepo(repo.id)}
                    aria-label={`Remove ${repo.name} from comparison`}
                    className="text-[#74685D] hover:text-[#171513]"
                  >
                    <FiX size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg px-3 py-2 text-[12px] font-medium text-[#74685D] transition-colors hover:bg-[#EFE5D9] hover:text-[#4B2E1F]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => navigate("/compare")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4B2E1F] px-4 py-2.5 text-[13px] font-semibold text-[#FAF6F0] transition-colors hover:bg-[#8B5E3C]"
          >
            Compare now
          </button>
        </div>
      </div>
    </aside>
  );
}

export default ComparisonBar;
