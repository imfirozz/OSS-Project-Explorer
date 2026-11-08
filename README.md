# GitOSS — Open Source GitHub Project Explorer

> Discover, analyze, compare, and track exceptional open-source projects.
>
> 🌐 **Live Demo:** [https://gitoss.vercel.app](https://gitoss.vercel.app)

[![Live Demo](https://img.shields.io/badge/Demo-gitoss.vercel.app-000000?logo=vercel&logoColor=white)](https://gitoss.vercel.app)

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router 7](https://img.shields.io/badge/React_Router-v7-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GSAP 3](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![Lenis](https://img.shields.io/badge/Lenis-1.3-black?logo=scroll&logoColor=white)](https://lenis.darkroom.engineering/)
[![Axios](https://img.shields.io/badge/Axios-1.20-5A29E4?logo=axios&logoColor=white)](https://axios-http.com/)
[![Node Tests](https://img.shields.io/badge/Node_Tests-7%20Passed-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![ESLint 10](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-F5A623.svg)](LICENSE)

**GitOSS** is a high-performance, client-side web application designed for developers, engineering managers, and open-source contributors to evaluate and monitor public GitHub repositories. By pairing GitHub's official REST Search API with multi-faceted filtering, side-by-side metric comparison, local bookmarking with private notes, client-side dataset telemetry, and formula-safe data exports, the application delivers a focused discovery workspace without requiring user authentication or third-party tracking.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Application Screenshots](#application-screenshots)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Application Modules](#application-modules)
9. [API Integration and Rate Limits](#api-integration-and-rate-limits)
10. [Data Persistence and Privacy](#data-persistence-and-privacy)
11. [Design System and Accessibility](#design-system-and-accessibility)
12. [Testing and Quality Checks](#testing-and-quality-checks)
13. [Future Roadmap](#future-roadmap)
14. [Author and Acknowledgments](#author-and-acknowledgments)

---

## Overview

Finding the right open-source dependency or monitoring ecosystem activity often requires toggling between multiple browser tabs, evaluating inconsistent README files, and dealing with noise. Standard web searches frequently lack technical nuance, while GitHub's primary interface does not offer side-by-side metric comparison, client-side dataset collection, or private note-taking.

**Open Source GitHub Project Explorer** solves this by providing a unified, client-side exploration suite where developers can:

- **Search Intelligently**: Query across repositories by keyword or target specific users and organizations via `@owner` qualifiers.
- **Filter with Precision**: Narrow results by primary programming language, topic tags, ecosystem domain, minimum star count, and push activity windows.
- **Analyze Ecosystem Data**: Explore aggregated statistics across up to 1,000 repositories, including programming language share, star distributions, and license breakdowns.
- **Compare Candidates Side-by-Side**: Benchmark up to 4 repositories simultaneously across stars, forks, open issues, licenses, and maintenance timestamps.
- **Organize Privately**: Maintain bookmarks and custom evaluation notes stored entirely in the browser's local storage with reactive cross-component synchronization.
- **Export Formatted Data**: Generate clean JSON or Excel-safe CSV spreadsheets with automatic formula injection sanitization.

The application functions entirely client-side, issuing requests directly to GitHub's official REST API from the user's browser without requiring an external intermediary server.

---

## Key Features

### Repository Discovery

- **Keyword & Handle Search**: Direct keyword matching with automated `@owner` detection to filter by GitHub user or organization (e.g., `@facebook`, `@vercel`).
- **Multi-Parametric Filtering**:
  - **Language**: Filter by JavaScript, TypeScript, Python, Java, C++, Go, Rust, and dynamically detected dataset languages.
  - **Category**: Filter by curated domains including Web Development, Machine Learning, Developer Tools, DevOps, Mobile, and Libraries.
  - **Star Count**: Threshold selections from 0 up to 50,000+ stars.
  - **Recency**: Commit activity filters ranging from today, the past 7/30/90 days, or by year.
- **Sorting Options**: Sort by stargazers, forks, or recently updated timestamps.
- **Request Cancellation**: Automated `AbortController` integration canceling in-flight search requests when filters change rapidly.

### Trending and Curated Collections

- **Period Windows**: Daily, weekly, and monthly activity windows based on GitHub `pushed:>=YYYY-MM-DD` commit qualifiers.
- **Velocity Clarification**: Note that trending results represent GitHub Search API sort qualifiers filtered by recent commit activity; they reflect active engagement rather than true historical time-series growth tracking.
- **Curated Category Gateways**: Pre-configured query tags for Artificial Intelligence, Web Development, DevOps, Mobile, and Infrastructure.

### Open-Source Insights

- **Progressive Dataset Collection**: In-browser dataset engine fetching up to 10 consecutive pages (100 results per page, capped at GitHub's 1,000-result search limit).
- **Collection Controls**: One-click dataset accumulation with real-time progress indicators (`Collecting page X of Y`), rate-limit detection, and error recovery.
- **Analytical Metrics**:
  - Programming language market share and percentage breakdown.
  - Stargazer count distribution across collected repositories.
  - Software license breakdown (MIT, Apache-2.0, GPL, BSD, etc.).
  - Aggregated metric calculations (total stars, active projects, maintenance velocity).
- **Data Scope Transparency**: Insights metrics strictly describe the collected client-side dataset snapshot, not the entirety of GitHub.

### Repository Comparison

- **Multi-Repository Benchmarking**: Compare up to 4 repositories simultaneously in a dedicated comparison view.
- **Standardized Metric Grid**: Side-by-side inspection of stars, forks, open issues, license, primary language, created timestamp, and latest push.
- **Metric Highlighting**: Automated visual identification of the highest star and fork counts among compared candidates.
- **Persistent Floating Drawer**: Floating comparison dock accessible across pages, permitting seamless candidate collection while browsing.

### Bookmarks and Personal Notes

- **One-Click Bookmarking**: Instant saving of repository IDs to browser storage.
- **Private Notes**: Inline note editor per repository for recording architectural evaluations, dependency considerations, or audit notes.
- **Reactive Synchronization**: Dispatches custom DOM events (`project-explorer:bookmarks-changed`) to instantly update mounted components across the application.
- **Cross-Tab Awareness**: Native `storage` event listeners ensuring updates in one browser tab reflect in other open tabs.

### Data Export

- **CSV Export**: Clean spreadsheet export with columns for repository name, owner, description, URL, language, topics, stars, forks, open issues, and license.
- **Formula Injection Protection**: Sanitizes values starting with `=`, `+`, `-`, `@`, `\t`, or `\r` by prefixing with a single quote (`'`), preventing spreadsheet formula execution vulnerabilities.
- **Excel Compatibility**: Encoded with UTF-8 Byte Order Mark (`\uFEFF`) to prevent character encoding issues in spreadsheet applications.
- **JSON Export**: Formatted JSON output containing export timestamps, record counts, active query filters, and normalized repository objects.

### Themes and Motion

- **Ivory Sand (Light Mode)**: Warm, high-legibility editorial palette with warm sandstone surfaces and rich espresso typography.
- **Editorial Bronze (Dark Mode)**: Deep bronze-charcoal dark theme with amber highlights and soft parchment text.
- **System Theme Integration**: Respects OS dark mode preference with live dynamic switching.
- **Smooth Inertial Scrolling**: Powered by Lenis with custom easing curves and automatic scroll reset on route changes.
- **Interactive Cursor Swarm**: Custom GSAP particle effect featuring 50 orbital cursor-followers using warm sandstone and bronze palettes.
- **Reduced Motion Support**: Full compliance with `prefers-reduced-motion: reduce`, gracefully disabling Lenis smoothing and cursor swarms in favor of native instant scrolling.

---

## Application Screenshots

| Hero & Exploration View | System Architecture & Insights |
| :---: | :---: |
| ![Project Explorer Hero Preview](src/assets/hero-laptop.png) | *Additional interface captures (Insights, Comparison Matrix, and Bookmarks) can be placed here.* |

> *Tip: Screenshots are loaded via relative paths (`src/assets/`) so they render natively when viewing the repository on GitHub.*

---

## Tech Stack

| Layer | Technology | Version | Purpose in Application |
| :--- | :--- | :--- | :--- |
| **Core Framework** | [React](https://react.dev/) | `^19.2.7` | UI component tree, hooks, Suspense, and lazy loading |
| **DOM Renderer** | [React DOM](https://react.dev/) | `^19.2.7` | Client DOM rendering engine |
| **Build Tool & Server** | [Vite](https://vitejs.dev/) | `^8.1.1` | ESM development server and Rollup production bundling |
| **Routing** | [React Router DOM](https://reactrouter.com/) | `^7.18.5` | Client-side routing, URL search params, and layout routing |
| **Styling Engine** | [Tailwind CSS](https://tailwindcss.com/) | `^4.3.3` | Utility styling integrated via `@tailwindcss/vite` |
| **Animation Engine** | [GSAP](https://greensock.com/gsap/) | `^3.15.1` | Animation timelines, ticker loops, and particle math |
| **React GSAP Bridge** | [@gsap/react](https://greensock.com/react/) | `^2.1.2` | Safe React component lifecycle integration for GSAP |
| **Smooth Scrolling** | [Lenis](https://lenis.darkroom.engineering/) | `^1.3.27` | Smooth inertial scroll provider with ScrollTrigger integration |
| **HTTP Client** | [Axios](https://axios-http.com/) | `^1.20.0` | GitHub REST API client with AbortController support |
| **Iconography** | [React Icons](https://react-icons.github.io/react-icons/) | `^5.7.0` | Feather and FontAwesome SVG icons |
| **Unit Testing** | [Node.js Test Runner](https://nodejs.org/) | `native` | Lightweight unit and regression testing (`node --test`) |
| **Linter** | [ESLint](https://eslint.org/) | `^10.6.0` | Static code analysis with React hooks lint rules |

---

## Architecture

The project follows a modular client-side architecture where data fetching, persistence, presentation, and animation are strictly separated:

```
┌────────────────────────────────────────────────────────┐
│                   React Router v7                      │
│        (AppRoutes: Code-Split Lazy Loaded Views)       │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
 [Pages Layer]       [Components Layer]    [Animation Layer]
 - Home              - AppLayout           - SmoothScrollProvider (Lenis)
 - Explore           - Navbar & Footer     - CursorSwarm (GSAP)
 - Trending          - RepoCard & RepoList - ScrollProgress
 - Insights          - FilterBar           - ScrollTrigger
 - Compare           - ComparisonBar
 - Bookmarks         - RepositoryExport
 - RepositoryDetails - Loader & Skeletons
       │                    │
       └────────────────────┼────────────────────┐
                            │                    │
       ┌────────────────────┴──────────┐         │
       ▼                               ▼         ▼
[Services Layer]                [Storage Layer] [Export Layer]
- githubApi.js                  - localStorage.js  - repositoryExport.js
  • REST Search API               • Bookmarks        • Formula sanitization
  • Repository Details            • Private Notes    • UTF-8 CSV with BOM
  • Rate limit headers            • Comparisons      • Filtered JSON
- repositoryDataset.js          • Insights Cache
  • Dataset collector (1000 max)• Custom Events
  • Aggregation utilities
```

### Architectural Responsibilities

1. **Presentation Layer (`src/pages`, `src/components`)**: Pure React functional components utilizing Tailwind CSS utility tokens. Pages are code-split using `React.lazy` and wrapped in a global `Suspense` boundary.
2. **Routing Layer (`src/routes/AppRoutes.jsx`)**: Declares nested application routes under a shared `AppLayout` shell, managing dynamic URL search parameters for query, filter, and theme states.
3. **Services Layer (`src/services`)**:
   - `githubApi.js`: Handles communication with GitHub's Search and Repository REST endpoints, normalizes payload shapes, extracts rate-limit headers, and accepts `AbortSignal` instances.
   - `repositoryDataset.js`: Orchestrates multi-page data fetching for ecosystem insights up to the 1,000-result search ceiling.
4. **Persistence Layer (`src/utils/localStorage.js`)**: Encapsulates browser storage reads, schema validation, JSON parsing, error recovery, and event dispatching (`project-explorer:bookmarks-changed`).
5. **Export Layer (`src/utils/repositoryExport.js`)**: Implements client-side Blob generation for CSV and JSON file downloads with CSV formula-injection protection.
6. **Animation Layer (`src/components/SmoothScrollProvider.jsx`, `CursorSwarm.jsx`)**: Bridges Lenis smooth scrolling with GSAP's animation ticker, automatically decoupling during reduced-motion modes.

---

## Project Structure

```plaintext
Open-Source/
├── public/                       # Static public assets
│   ├── favicon.svg               # Application browser tab icon
│   └── icons.svg                 # Shared SVG sprite definitions
├── src/
│   ├── assets/                   # Images and visual mockups
│   │   ├── hero-laptop.png       # Desktop mockup asset
│   │   ├── hero.png              # Hero graphic asset
│   │   ├── react.svg             # React logo
│   │   └── vite.svg              # Vite logo
│   ├── components/               # Presentation and interface modules
│   │   ├── AppLayout.jsx         # Global shell (Navbar, Main, Footer)
│   │   ├── BackToTop.jsx         # Scroll-to-top interaction
│   │   ├── CategorySection.jsx   # Curated category cards
│   │   ├── ComparisonBar.jsx     # Floating repository comparison dock
│   │   ├── CursorSwarm.jsx       # GSAP orbital cursor follower
│   │   ├── FilterBar.jsx         # Search and facet filtering controls
│   │   ├── Footer.jsx            # Application footer with links
│   │   ├── Hero.jsx              # Landing hero banner
│   │   ├── Loader.jsx            # Skeleton blocks and spinners
│   │   ├── Navbar.jsx            # Navigation bar with live search and theme switch
│   │   ├── OpenSourceInsightsSection.jsx # Homepage dataset preview
│   │   ├── RepoCard.jsx          # Individual repository display card
│   │   ├── RepoList.jsx          # Repository grid layout container
│   │   ├── RepositoryExportButtons.jsx # One-click CSV/JSON export buttons
│   │   ├── ScrollProgress.jsx    # Viewport scroll progress indicator
│   │   ├── SearchBar.jsx         # Input bar with search triggers
│   │   ├── SmoothScrollProvider.jsx # Lenis inertial scroll wrapper
│   │   ├── Stats.jsx             # Key highlight metric tiles
│   │   ├── StatsChart.jsx        # Data visualization charts
│   │   └── TrendingSection.jsx   # Trending projects showcase
│   ├── hooks/
│   │   └── useBookmarkStatus.js  # Reactive hook for bookmark state & sync
│   ├── pages/                    # Code-split application route views
│   │   ├── About.jsx             # Architectural and design overview
│   │   ├── Bookmarks.jsx         # Saved repositories and note management
│   │   ├── Compare.jsx           # Side-by-side repository comparison matrix
│   │   ├── Explore.jsx           # Repository discovery engine with full filters
│   │   ├── Home.jsx              # Landing showcase and insights snapshot
│   │   ├── Insights.jsx          # Ecosystem analytics and dataset collector
│   │   ├── NotFound.jsx          # 404 error page with navigation fallback
│   │   ├── RepositoryDetails.jsx # Detailed single-repository view
│   │   ├── Search.jsx            # Dedicated keyword search results
│   │   └── Trending.jsx          # High-velocity projects across time periods
│   ├── routes/
│   │   └── AppRoutes.jsx         # React Router v7 configuration & lazy loading
│   ├── services/
│   │   ├── githubApi.js          # GitHub REST API client & response normalizers
│   │   └── repositoryDataset.js  # Multi-page dataset collector & aggregations
│   ├── utils/
│   │   ├── localStorage.js       # Safe browser storage CRUD & event sync
│   │   └── repositoryExport.js   # Client-side CSV/JSON generator & sanitizer
│   ├── App.css                   # Global component rules and typography
│   ├── App.jsx                   # Application root element
│   ├── index.css                 # Tailwind CSS directives and color tokens
│   └── main.jsx                  # React DOM entry point
├── tests/
│   └── project-quality.test.js   # Unit & regression tests for API, storage, & exports
├── .gitignore                    # Git ignore specifications
├── CONTRIBUTING.md               # Contribution workflow guidelines
├── eslint.config.js              # ESLint flat configuration
├── index.html                    # HTML entry point with theme bootstrap script
├── LICENSE                       # MIT License
├── package.json                  # Project manifest, scripts, and dependencies
└── vite.config.js                # Vite build and Tailwind integration config
```

---

## Getting Started

### Prerequisites

- **Node.js**: `20.19+` or `22.12+` (LTS recommended)
- **npm**: `10.0+`

### Installation

Clone the repository and install the project dependencies:

```bash
git clone https://github.com/imfirozz/OSS-Project-Explorer
cd OSS-Project-Explorer
npm install
```

### Development

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Production Build

Compile and bundle the production assets into the `dist/` directory:

```bash
npm run build
```

### Preview

Serve the built production bundle locally to verify behavior and performance:

```bash
npm run preview
```

### Tests and Linting

Run the test suite and static analysis linter:

```bash
# Execute unit and regression tests using the Node.js test runner
npm test

# Run ESLint to verify code quality and style rules
npm run lint
```

---

## Application Modules

### 1. Discovery & Search (`/explore`, `/search`)
- Accepts direct search keywords or `@username` / `@orgname` syntax to inspect projects from specific authors.
- Filters by language, topic, ecosystem category, minimum stars, and recent push dates.
- Updates query strings dynamically in the URL, allowing filter states to be bookmarked and shared.

### 2. Trending Collections (`/trending`)
- Organizes active repositories across **Today** (1 day), **This week** (7 days), and **This month** (30 days).
- Sorts by total stars, forks, or recently pushed commits.
- Uses commit recency thresholds to highlight actively maintained projects.

### 3. Open-Source Insights (`/insights`)
- Progressively collects up to 10 pages of search results (100 items per page) to assemble an analytical snapshot.
- Provides pause and resume capabilities, saving partial datasets locally if rate limits are reached.
- Generates distributions for programming languages, stargazers, and licenses across the collected dataset.

### 4. Repository Comparison (`/compare`)
- Compares up to 4 selected repositories across engagement, maintenance, and metadata metrics.
- Highlights candidates with the most stars and forks for quick visual assessment.
- Driven by a persistent floating comparison drawer visible throughout the application.

### 5. Saved Repositories & Private Notes (`/bookmarks`)
- Stores bookmarked repositories locally in browser storage.
- Includes a dedicated markdown-friendly note editor per repository for keeping private evaluation records.
- Automatically synchronizes across components using custom event dispatching.

### 6. Dataset Export Engine
- Allows one-click export of loaded or collected repositories to CSV or JSON formats.
- Automatically escapes potentially dangerous spreadsheet formulas (`=`, `+`, `-`, `@`) with a leading `'`.
- Formats JSON files with metadata including filter parameters, total counts, and generation timestamps.

---

## API Integration and Rate Limits

Project Explorer interfaces directly with GitHub's official REST API (API version `2022-11-28`):
- **Search API**: `https://api.github.com/search/repositories`
- **Repository Details API**: `https://api.github.com/repos/{owner}/{repo}`

### GitHub Rate Limit Constraints

Official GitHub API limits apply to all client-side queries:

| Rate Limit Type | Documented GitHub Limit | Application Behavior |
| :--- | :--- | :--- |
| **Unauthenticated REST API** | 60 requests per hour per IP | Default mode. The app monitors `x-ratelimit-remaining` and surfaces reset notices when exhausted. |
| **Search API Page Size** | Maximum 100 items per page | Requests are capped at `per_page: 100` (`GITHUB_SEARCH_PAGE_SIZE = 100`). |
| **Search API Result Cap** | Maximum 1,000 accessible results | Enforces `GITHUB_SEARCH_MAX_RESULTS = 1000`. Multi-page Insights collection caps at 10 pages. |
| **Secondary Rate Limits** | Dynamic burst limit for rapid requests | In-flight requests are canceled with `AbortController` when switching filters rapidly to minimize bursts. |

> Reference: [GitHub REST API Rate Limits Documentation](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) and [Searching for Repositories](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories).

---

## Data Persistence and Privacy

The application stores all user preferences, bookmarks, and analytical cache in the browser's `localStorage`. No user credentials, accounts, or analytics tracking libraries are used.

### Verified Storage Keys

| Local Storage Key | Data Type | Purpose & Behavior |
| :--- | :--- | :--- |
| `project-explorer-theme` | `string` (`"light"`, `"dark"`, `"system"`) | Persists active theme preference across browser sessions. |
| `bookmarks` | `number[]` (Array of repository IDs) | Stores saved repository IDs. Emits `project-explorer:bookmarks-changed` event on mutation. |
| `notes` | `Record<string, string>` (Object map) | Stores user-authored private notes keyed by repository ID. |
| `project-explorer-compare` | `object[]` (Array of repository objects) | Stores up to 4 selected repositories for comparison. Emits `project-explorer-compare-updated`. |
| `project-explorer-insights-dataset-v1`| `object` (Dataset snapshot) | Caches multi-page Insights dataset, query metadata, and page index for instant reloads. |

### Storage Integrity & Event Synchronization

- **Graceful Error Recovery**: If stored values are corrupted or modified externally, the storage layer logs a warning, falls back to safe defaults, and removes the malformed key.
- **Cross-Component Synchronization**: When a repository is bookmarked, the app dispatches a custom event (`project-explorer:bookmarks-changed`) on `window` to immediately synchronize all mounted cards.
- **Cross-Tab Awareness**: A native `window.addEventListener("storage", ...)` listener ensures bookmark and comparison changes in one tab are immediately reflected across other open tabs.
- **Data Boundary**: Clearing browser storage removes all saved bookmarks, notes, and cached datasets. Network traffic is restricted strictly to GitHub API requests and public Google Fonts.

---

## Design System and Accessibility

Project Explorer employs a custom editorial design system centered on warm, textured tones, distinct typography, and high visual contrast.

### Palette Specifications

#### Ivory Sand (Light Theme)
- **Background (`--bg-main`)**: `#FAF6F0`
- **Surface / Card (`--bg-card`)**: `#F7F2EB`
- **Featured Accent (`--bg-featured`)**: `#F3E2D0`
- **Brand Accent (`--accent`)**: `#8B5E3C`
- **Primary Text (`--text-main`)**: `#171513`
- **Secondary Text (`--text-muted`)**: `#74685D`
- **Border (`--border-color`)**: `#E8DCCF`

#### Editorial Bronze (Dark Theme)
- **Background (`--bg-main`)**: `#14110F`
- **Surface / Card (`--bg-card`)**: `#1D1916`
- **Elevated (`--bg-elevated`)**: `#28211C`
- **Featured Accent (`--bg-featured`)**: `#35271E`
- **Brand Accent (`--accent`)**: `#C58A5B` (Hover: `#D99A67`)
- **Primary Text (`--text-main`)**: `#F5EEE5`
- **Secondary Text (`--text-secondary`)**: `#BCAF9F`
- **Border (`--border-color`)**: `#44352A`

### Accessibility Features

- **Semantic HTML**: Built with standard landmarks (`<main>`, `<header>`, `<footer>`, `<nav>`, `<aside>`, `<section>`).
- **Reduced Motion**: Full support for `@media (prefers-reduced-motion: reduce)`. When detected, Lenis inertial smoothing is bypassed in favor of native instant scrolling, animations are reduced to `0.01ms`, and the GSAP cursor swarm is deactivated.
- **Focus Indicators**: Explicit outline rings and keyboard focus states on interactive buttons, inputs, and comparison controls.
- **ARIA Attributes**: Accessible names and roles (`aria-label`, `aria-pressed`, `role="status"`, `aria-hidden`) on buttons, icons, and comparison docks.

---

## Testing and Quality Checks

The repository includes automated unit and integration tests executed via Node.js's native test runner (`node --test`).

### Verified Test Suite (`tests/project-quality.test.js`)

```plaintext
▶ GitHub repository pagination
  ✔ uses the API page size and respects GitHub's 1,000-result search cap
  ✔ requests the requested insights page with 100 results
  ✔ caps explicit API page sizes at 100
✔ GitHub repository pagination
▶ browser storage
  ✔ recovers from malformed and wrongly shaped stored values
  ✔ reports storage write failures without crashing the caller
  ✔ announces successful bookmark changes to mounted repository controls
✔ browser storage
▶ repository exports
  ✔ exports CSV safely and JSON with filter metadata
✔ repository exports
ℹ tests 7 | suites 3 | pass 7 | fail 0
```

### Verification Commands

- **Unit Tests**: `npm test` &rarr; 7/7 tests passing across pagination, storage recovery, and CSV formula protection.
- **Static Analysis**: `npm run lint` &rarr; ESLint 10 executes with 0 warnings and 0 errors.
- **Production Compilation**: `npm run build` &rarr; Vite builds the production distribution cleanly with Rollup chunking in ~250ms.

---

## Future Roadmap

The current version of Project Explorer is a high-performance client-side application. The following features represent planned enhancements for an upcoming **Full-Stack edition**:

### Backend and Accounts
- **GitHub OAuth Integration**: Optional sign-in with GitHub to link personal developer accounts.
- **Cloud Database Persistence**: PostgreSQL / MongoDB backing store enabling cross-device synchronization for bookmarks and notes.

### API Infrastructure
- **Dedicated Node.js / Express Gateway**: Server-side proxy for GitHub REST and GraphQL APIs.
- **Redis Cache Layer**: In-memory caching for trending queries and search results to reduce latency and protect rate limits.
- **Rate-Limit-Aware Scheduling**: Authenticated API token management operating within GitHub's 5,000 requests/hour authenticated quota.

### AI Repository Intelligence
- **README & Architecture Summaries**: Server-side LLM summaries detailing architecture patterns, trade-offs, and dependency graphs.
- **Natural Language Search**: Semantic discovery capabilities (e.g., *"lightweight state management library with zero dependencies"*).

### Historical Analytics
- **True Growth Tracking**: Long-term time-series recording of star velocity, fork growth curves, and issue resolution metrics.
- **Maintainer Health Scores**: Activity indexes calculating release frequency, commit cadence, and PR turnaround times.

### Collaboration & Alerts
- **Public Curated Lists**: Shareable repository collections with custom URLs.
- **Release Notifications**: Webhook / email alerts when tracked repositories publish new versions or security advisories.

---

## Author and Acknowledgments

Created and maintained by **Firoz Ansari**:

- **GitHub**: [@imfirozz](https://github.com/imfirozz)
- **LinkedIn**: [https://www.linkedin.com/in/imfirozz/](https://www.linkedin.com/in/imfirozz/)
- **Contact Email**: [imfirozz.dev@gmail.com](mailto:imfirozz.dev@gmail.com)
- **Repository**: [https://github.com/imfirozz/oss-project-explorer](github.com/imfirozz/oss-project-explorer)

Distributed under the [MIT License](LICENSE). Built for the open-source community.
