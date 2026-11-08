import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import Loader from "../components/Loader";

const Home = lazy(() => import("../pages/Home"));
const Explore = lazy(() => import("../pages/Explore"));
const Trending = lazy(() => import("../pages/Trending"));
const Insights = lazy(() => import("../pages/Insights"));
const About = lazy(() => import("../pages/About"));
const RepositoryDetails = lazy(() => import("../pages/RepositoryDetails"));
const Bookmarks = lazy(() => import("../pages/Bookmarks"));
const SearchPage = lazy(() => import("../pages/Search"));
const Compare = lazy(() => import("../pages/Compare"));
const NotFound = lazy(() => import("../pages/NotFound"));

function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/about" element={<About />} />
          <Route path="/repository/:owner/:repo" element={<RepositoryDetails />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
