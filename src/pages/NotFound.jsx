import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-[30px] border border-[#E8DCCF] bg-[#F7F2EB] p-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
          404 Error
        </p>
        <h1 className="mt-3 text-[clamp(2.5rem,5vw,4rem)] font-semibold tracking-[-0.06em] text-[#171513]">
          This page could not be found.
        </h1>
        <p className="mt-4 text-[16px] leading-8 text-[#74685D]">
          The route you requested is unavailable or no longer exists.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/" className="rounded-full bg-[#4B2E1F] px-5 py-3 text-sm font-medium text-[#FAF6F0]">
            Return home
          </Link>
          <Link to="/explore" className="rounded-full border border-[#E8DCCF] bg-[#FAF6F0] px-5 py-3 text-sm font-medium text-[#4B2E1F]">
            Explore repositories
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
