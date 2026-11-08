import axios from "axios";

const SEARCH_API = "https://api.github.com/search/repositories";
const REPOS_API = "https://api.github.com/repos";
export const GITHUB_SEARCH_PAGE_SIZE = 100;
export const GITHUB_SEARCH_MAX_RESULTS = 1000;

const normalizeRepository = (repo = {}) => {
  if (!repo || typeof repo !== "object") {
    return null;
  }

  return {
    ...repo,
    owner: repo.owner || {},
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    description: repo.description ?? "No description provided.",
    stargazers_count: Number(repo.stargazers_count) || 0,
    forks_count: Number(repo.forks_count) || 0,
    open_issues_count: Number(repo.open_issues_count) || 0,
  };
};

export const fetchRepositorySearchPage = async (
  query = "react",
  language = "",
  sort = "stars",
  page = 1,
  filters = {}
) => {
  const rawQuery = typeof query === "string" ? query.trim() : "";
  const ownerQuery = rawQuery.replace(/^@/, "");
  const isOwnerSearch =
    rawQuery.startsWith("@") && /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(ownerQuery);
  const searchTerms = isOwnerSearch ? `user:${ownerQuery}` : rawQuery || "stars:>100";
  const qualifiers = [];

  if (language) qualifiers.push(`language:${language}`);
  if (filters.topic) qualifiers.push(`topic:${filters.topic}`);
  if (filters.category) qualifiers.push(`topic:${filters.category}`);
  if (Number(filters.minStars) > 0) qualifiers.push(`stars:>=${Number(filters.minStars)}`);
  if (filters.updatedAfter) qualifiers.push(`pushed:>=${filters.updatedAfter}`);

  const searchQuery = [searchTerms, ...qualifiers].join(" ");

  const response = await axios.get(SEARCH_API, {
    params: {
      q: searchQuery,
      sort,
      order: "desc",
      per_page: Math.min(
        GITHUB_SEARCH_PAGE_SIZE,
        Math.max(1, Number(filters.perPage) || GITHUB_SEARCH_PAGE_SIZE),
      ),
      page,
    },
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: filters.signal,
  });

  if (response?.status !== 200) {
    throw new Error(`GitHub API request failed: ${response?.status || "unknown status"}`);
  }

  const items = Array.isArray(response?.data?.items) ? response.data.items : [];
  return {
    repositories: items.map(normalizeRepository).filter(Boolean),
    totalCount: Number(response?.data?.total_count) || 0,
    incompleteResults: Boolean(response?.data?.incomplete_results),
    rateLimit: {
      remaining: Number(response.headers?.["x-ratelimit-remaining"]),
      resetAt: response.headers?.["x-ratelimit-reset"]
        ? Number(response.headers["x-ratelimit-reset"]) * 1000
        : null,
    },
  };
};

export const fetchRepositories = async (
  query = "react",
  language = "",
  sort = "stars",
  page = 1,
  filters = {}
) => {
  const result = await fetchRepositorySearchPage(query, language, sort, page, filters);
  return result.repositories;
};

export const fetchRepositoryDetails = async (owner, repo) => {
  try {
    const response = await axios.get(`${REPOS_API}/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("GitHub Repository API Error:", error.response?.status);
    return null;
  }
};

export const fetchRepositoryById = async (repoId) => {
  try {
    const response = await axios.get(`https://api.github.com/repositories/${repoId}`, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("GitHub Repository Lookup Error:", error.response?.status);
    return null;
  }
};
