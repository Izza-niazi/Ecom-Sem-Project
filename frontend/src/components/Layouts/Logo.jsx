import { Link } from "react-router-dom";
import { APP_NAME } from "../../constants/brand";
import IzzuLogoMark from "./IzzuLogoMark";

const Logo = ({ className = "" }) => {
  return (
    <Link
      to="/"
      className={`flex items-center gap-1.5 shrink-0 group ${className}`}
      aria-label={`${APP_NAME} home`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-cyan-600 text-slate-950 shadow-lg shadow-sky-500/25 transition group-hover:shadow-sky-400/40">
        <IzzuLogoMark className="h-6 w-6" />
      </span>
      <span className="hidden font-semibold tracking-tight text-slate-100 sm:block">
        <span className="bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-lg text-transparent">
          {APP_NAME}
        </span>
      </span>
    </Link>
  );
};

export default Logo;
