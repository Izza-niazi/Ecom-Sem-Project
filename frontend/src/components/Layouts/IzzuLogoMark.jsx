/**
 * Playful inline mark for izzumarket — mini storefront + sparkles (no raster assets).
 */
const IzzuLogoMark = ({ className = "h-7 w-7" }) => (
  <svg
    className={className}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    {/* sparkles */}
    <path
      d="M32 6l.6 1.8L34.5 9l-1.9.7L32 11.5l-.6-1.8-1.9-.7 1.9-.7L32 6zM8 4l.4 1.3 1.4.5-1.4.5L8 7.7 7.6 6.4 6.2 5.9l1.4-.5L8 4z"
      fill="currentColor"
      className="text-amber-200/90"
    />
    {/* awning */}
    <path
      d="M5 14h30v3H5v-3z"
      fill="currentColor"
      className="text-white/95"
    />
    <path
      d="M5 14L9 9h22l4 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className="text-white/95"
      fill="none"
    />
    <path
      d="M8 14V11M14 14v-2.5M20 14V11M26 14v-2.5M32 14V11"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      className="text-rose-200/80"
    />
    {/* shop body */}
    <path
      d="M7 17h26v12a3 3 0 01-3 3H10a3 3 0 01-3-3V17z"
      fill="currentColor"
      className="text-white/90"
    />
    {/* door */}
    <rect
      x="16"
      y="22"
      width="8"
      height="10"
      rx="1"
      fill="currentColor"
      className="text-violet-950/35"
    />
    <circle cx="22.5" cy="27" r="0.9" fill="currentColor" className="text-amber-300" />
    {/* window */}
    <rect x="10" y="19" width="4" height="3.5" rx="0.6" fill="currentColor" className="text-sky-200/50" />
    <rect x="26" y="19" width="4" height="3.5" rx="0.6" fill="currentColor" className="text-sky-200/50" />
  </svg>
);

export default IzzuLogoMark;
