import { cx } from "../lib/utils.js";

function BrandMark({
  className,
  logoClassName,
  size = 60,
  subtitle = "Home Visit Doctors",
  titleClassName,
  subtitleClassName,
  withWordmark = true,
}) {
  return (
    <div className={cx("flex items-center gap-3", className)}>
      <svg
        aria-hidden="true"
        className={cx("shrink-0", logoClassName)}
        viewBox="0 0 64 64"
        width={size}
        height={size}
      >
        <path
          d="M37 12C25.4 12 16 21.4 16 33s9.4 21 21 21c8.4 0 15.8-5 19.2-12.4"
          fill="none"
          stroke="#41c8c6"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <circle cx="23" cy="42" r="7.5" fill="#70ddd2" />
        <circle cx="48.5" cy="19.5" r="7.5" fill="#f5c44f" opacity="0.92" />
        <path
          d="M48.5 14v11M43 19.5h11"
          stroke="#ffffff"
          strokeWidth="3.3"
          strokeLinecap="round"
        />
        <circle cx="41.5" cy="10.5" r="2.2" fill="#2d8f98" />
        <circle cx="55.5" cy="27.5" r="2.2" fill="#2d8f98" />
      </svg>

      {withWordmark ? (
        <div className="min-w-0">
          <p
            className={cx(
              "text-[1.1rem] font-extrabold tracking-tight text-[#2d8f98]",
              titleClassName,
            )}
          >
            OCS <span className="font-semibold text-[#f0bc45]">Medecins</span>
          </p>
          <p
            className={cx(
              "text-xs font-semibold uppercase tracking-[0.18em] text-[#5b7f8a]",
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default BrandMark;
