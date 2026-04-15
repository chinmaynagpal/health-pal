export default function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="hp-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34C759" />
          <stop offset="1" stopColor="#1F8A39" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#hp-g)" />
      <path
        d="M11 10.5c0-1.2.9-2 2.1-2 1 0 1.8.6 2.3 1.5l.6 1.1.6-1.1c.5-.9 1.3-1.5 2.3-1.5 1.2 0 2.1.8 2.1 2 0 2.8-5 6-5 6s-5-3.2-5-6Z"
        fill="white"
      />
      <path
        d="M9 22.5h3.3l1.4-3 2 5 1.6-4 1.4 2h4.8"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
