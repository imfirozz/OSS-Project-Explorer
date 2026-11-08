import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import TrendingSection from "../components/TrendingSection";
import OpenSourceInsightsSection from "../components/OpenSourceInsightsSection";
import {
  fetchInsightsPage,
  INSIGHTS_MAX_PAGES,
  INSIGHTS_PAGE_SIZE,
  mergeRepositoryPages,
  readInsightsDataset,
  writeInsightsDataset,
} from "../services/repositoryDataset";

function getCachedDataset() {
  try {
    return readInsightsDataset();
  } catch (error) {
    console.error("Unable to read cached homepage repository data:", error);
    return null;
  }
}

function Home() {
  const [dataset, setDataset] = useState(getCachedDataset);
  const [loadingDataset, setLoadingDataset] = useState(() => !dataset);
  const [autoCollect, setAutoCollect] = useState(true);
  const [datasetError, setDatasetError] = useState("");

  useEffect(() => {
    document.title = "Project Explorer | Open-source discovery";
  }, []);

  useEffect(() => {
    if (!autoCollect) return undefined;
    const maxPages = dataset
      ? Math.min(
          INSIGHTS_MAX_PAGES,
          Math.ceil(dataset.totalCount / INSIGHTS_PAGE_SIZE),
        )
      : INSIGHTS_MAX_PAGES;
    if (dataset && dataset.page >= maxPages) return undefined;

    const controller = new AbortController();
    let collected = dataset;
    async function collectDataset() {
      try {
        if (!collected) {
          collected = await fetchInsightsPage(1, controller.signal);
          if (controller.signal.aborted) return;
          writeInsightsDataset(collected);
        }

        const availablePages = Math.min(
          INSIGHTS_MAX_PAGES,
          Math.ceil(collected.totalCount / INSIGHTS_PAGE_SIZE),
        );
        for (let page = collected.page + 1; page <= availablePages; page += 1) {
          if (
            collected.rateLimit?.remaining === 0 &&
            (!collected.rateLimit.resetAt ||
              collected.rateLimit.resetAt > Date.now())
          ) {
            throw new Error(
              "GitHub Search API rate limit reached. The collected data is saved; reload later to continue.",
            );
          }
          const result = await fetchInsightsPage(page, controller.signal);
          if (controller.signal.aborted) return;
          collected = {
            ...result,
            repositories: mergeRepositoryPages(
              collected.repositories,
              result.repositories,
            ),
            incompleteResults: Boolean(
              collected.incompleteResults || result.incompleteResults,
            ),
          };
          writeInsightsDataset(collected);
          if (result.repositories.length < INSIGHTS_PAGE_SIZE) break;
        }
        setDataset(collected);
        setDatasetError("");
      } catch (error) {
        if (controller.signal.aborted) return;
        if (collected) setDataset(collected);
        setAutoCollect(false);
        console.error("Unable to collect homepage repository data:", error);
        setDatasetError(
          error?.response?.data?.message ||
            error?.message ||
            "Repository data collection stopped before all available results were loaded.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingDataset(false);
        }
      }
    }

    collectDataset();

    return () => controller.abort();
  }, [autoCollect, dataset]);

  return (
    <div id="top" className="home-page relative overflow-x-clip bg-[#FAF6F0] text-[#171513]">
      <Hero dataset={dataset} />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-[#E8DCCF]" />
      </div>
      <CategorySection repositories={dataset?.repositories || []} />
      <TrendingSection />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-[#E8DCCF]" />
      </div>
      <OpenSourceInsightsSection
        dataset={dataset}
        loading={loadingDataset}
        error={datasetError}
      />
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 rounded-[24px] border border-[#E8DCCF] bg-[#F3E2D0] px-6 py-9 sm:px-10 sm:py-12 lg:flex-row lg:items-end lg:justify-between lg:px-14">
          <div className="max-w-2xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
              Your next discovery
            </p>
            <h2 className="m-0 text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-[#171513]">
              Your next favourite project is out there.
            </h2>
            <p className="mb-0 mt-4 text-[14px] leading-7 text-[#74685D] sm:text-[15px]">
              Explore open-source ideas, discover useful tools, and find
              something worth building.
            </p>
          </div>
          <Link
            to="/explore"
            className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#4B2E1F] px-5 text-[14px] font-semibold text-[#FAF6F0] transition-colors hover:bg-[#65432F]"
          >
            Start exploring
            <FiArrowUpRight
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              size={16}
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
