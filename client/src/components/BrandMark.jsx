import { cx } from "../lib/utils.js";

function BrandMark({ className, logoClassName, size = 60, withWordmark = true }) {
  const companyName = "OCS M\u00e9decins";
  const subBrand = "M\u00e9decins";

  if (!withWordmark) {
    return (
      <svg
        aria-label={companyName}
        className={cx("shrink-0", className, logoClassName)}
        height={size}
        role="img"
        viewBox="0 0 120 120"
        width={size}
      >
        <path
          d="M66 22C40.6 22 21 42 21 66s19.6 44 45 44c13.6 0 26.3-5.6 35-15.5"
          fill="none"
          stroke="#4bc7c3"
          strokeLinecap="round"
          strokeWidth="20"
        />
        <path
          d="M83 22.5h6.2"
          stroke="#4bc7c3"
          strokeLinecap="round"
          strokeWidth="20"
        />
        <g transform="translate(66 11)">
          <rect x="0" y="10" width="18" height="18" rx="5" transform="rotate(-45 0 10)" fill="#53bda7" />
          <rect x="14" y="10" width="18" height="18" rx="5" transform="rotate(-45 14 10)" fill="#4caaa0" />
          <rect x="0" y="24" width="18" height="18" rx="5" transform="rotate(-45 0 24)" fill="#f5be3c" />
          <rect x="14" y="24" width="18" height="18" rx="5" transform="rotate(-45 14 24)" fill="#f1c54b" />
        </g>
      </svg>
    );
  }

  return (
    <div className={cx("inline-flex items-center", className)}>
      <svg
        aria-label={`${companyName} Home Visit Doctors`}
        className={cx("block", logoClassName)}
        height={size}
        role="img"
        viewBox="0 0 470 120"
        width={size * 3.95}
      >
        <g>
          <path
            d="M67 21C42 21 22 41 22 66s20 44 45 44c13.7 0 26.2-5.4 34.7-15"
            fill="none"
            stroke="#4bc7c3"
            strokeLinecap="round"
            strokeWidth="20"
          />
          <path d="M83.5 21.5h6" stroke="#4bc7c3" strokeLinecap="round" strokeWidth="20" />
          <g transform="translate(66 10)">
            <rect
              x="0"
              y="10"
              width="18"
              height="18"
              rx="5"
              transform="rotate(-45 0 10)"
              fill="#53bda7"
            />
            <rect
              x="14"
              y="10"
              width="18"
              height="18"
              rx="5"
              transform="rotate(-45 14 10)"
              fill="#4caaa0"
            />
            <rect
              x="0"
              y="24"
              width="18"
              height="18"
              rx="5"
              transform="rotate(-45 0 24)"
              fill="#f5be3c"
            />
            <rect
              x="14"
              y="24"
              width="18"
              height="18"
              rx="5"
              transform="rotate(-45 14 24)"
              fill="#f1c54b"
            />
          </g>
          <line x1="116" y1="20" x2="116" y2="99" stroke="#55b7bf" strokeWidth="3.6" />
        </g>

        <text
          x="135"
          y="58"
          fill="#4fccc9"
          fontFamily="Poppins, 'Nunito Sans', Arial, sans-serif"
          fontSize="44"
          fontWeight="800"
          letterSpacing="-1.2"
        >
          OCS
        </text>
        <text
          x="234"
          y="58"
          fill="#e8bd47"
          fontFamily="Poppins, 'Nunito Sans', Arial, sans-serif"
          fontSize="42"
          fontWeight="500"
          letterSpacing="-1.1"
        >
          {subBrand}
        </text>
        <text
          x="136"
          y="92"
          fill="#6e8050"
          fontFamily="'Nunito Sans', Arial, sans-serif"
          fontSize="24"
          fontWeight="600"
          letterSpacing="-0.2"
        >
          Home Visit Doctors
        </text>
      </svg>
    </div>
  );
}

export default BrandMark;
