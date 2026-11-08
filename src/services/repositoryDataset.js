import {
  fetchRepositorySearchPage,
  GITHUB_SEARCH_MAX_RESULTS,
  GITHUB_SEARCH_PAGE_SIZE,
} from "./githubApi.js";

const INSIGHTS_CACHE_KEY = "project-explorer-insights-dataset-v1";
export const INSIGHTS_QUERY = "stars:>100";
export const INSIGHTS_PAGE_SIZE = GITHUB_SEARCH_PAGE_SIZE;
export const INSIGHTS_MAX_PAGES = Math.ceil(
  GITHUB_SEARCH_MAX_RESULTS / INSIGHTS_PAGE_SIZE,
);

export function getInsightsPageCount(totalCount) {
  const count = Number(totalCount);
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.min(INSIGHTS_MAX_PAGES, Math.ceil(count / INSIGHTS_PAGE_SIZE));
}

export function readInsightsDataset() {
  try {
    const cached = window.localStorage.getItem(INSIGHTS_CACHE_KEY);
    if (!cached) return null;

    const dataset = JSON.parse(cached);
    if (
      !dataset ||
      !Array.isArray(dataset.repositories) ||
      !Number.isInteger(dataset.page) ||
      dataset.page < 1 ||
      dataset.page > INSIGHTS_MAX_PAGES ||
      !dataset.repositories.every(
        (repository) => repository && typeof repository === "object",
      )
    ) {
      throw new Error("Cached repository dataset has an invalid shape.");
    }

    return dataset;
  } catch (error) {
    console.error("Unable to read cached Insights data:", error);
    try {
      window.localStorage.removeItem(INSIGHTS_CACHE_KEY);
    } catch (removeError) {
      console.warn("Unable to remove invalid Insights cache:", removeError);
    }
    return null;
  }
}

export function writeInsightsDataset(dataset) {
  try {
    window.localStorage.setItem(INSIGHTS_CACHE_KEY, JSON.stringify(dataset));
    return true;
  } catch (error) {
    console.warn("Unable to cache Insights data in localStorage:", error);
    return false;
  }
}

export async function fetchInsightsPage(page, signal) {
  const result = await fetchRepositorySearchPage(INSIGHTS_QUERY, "", "stars", page, {
    perPage: INSIGHTS_PAGE_SIZE,
    signal,
  });

  return {
    ...result,
    page,
    query: INSIGHTS_QUERY,
    lastSynced: new Date().toISOString(),
  };
}

export function mergeRepositoryPages(existing, incoming) {
  const byId = new Map(existing.map((repo) => [repo.id, repo]));
  incoming.forEach((repo) => byId.set(repo.id, repo));
  return [...byId.values()];
}
