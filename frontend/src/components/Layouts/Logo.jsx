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
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-neutral-900 text-white shadow-glow transition duration-300 group-hover:scale-105 group-hover:border-white/30">
        <IzzuLogoMark className="h-6 w-6" />
      </span>
      <span className="hidden font-semibold tracking-tight text-white sm:block">
        <span className="text-lg">{APP_NAME}</span>
      </span>
    </Link>
  );
};

export default Logo;
