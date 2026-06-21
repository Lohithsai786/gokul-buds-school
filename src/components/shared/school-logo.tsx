interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  darkText?: boolean
  onDark?: boolean
}

export function SchoolLogo({ size = 'md', showText = true, darkText = false, onDark = false }: SchoolLogoProps) {
  const iconSizes = { sm: 32, md: 40, lg: 56 }
  const iconSize = iconSizes[size]

  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer oval border */}
        <ellipse cx="24" cy="24" rx="21" ry="23" stroke="#1a6b3c" strokeWidth="2.5" fill="white" />
        {/* Main leaf bud shape - left half forming "G" curve */}
        <path
          d="M24 6 C13 9 8 16 8 24 C8 32 13 40 24 43 C22 35 21 28 23 20 Z"
          fill="#2e8b57"
        />
        {/* Right leaf fill */}
        <path
          d="M24 6 C33 10 38 17 37 25 C36 31 31 37 24 43 C25 35 27 28 25 20 Z"
          fill="#52b788"
        />
        {/* Inner highlight / bud tip */}
        <ellipse cx="24" cy="10" rx="3" ry="4.5" fill="#a8d8b9" opacity="0.7" />
        {/* Horizontal bar of G */}
        <rect x="24" y="24" width="10" height="3" rx="1.5" fill="#1a6b3c" />
      </svg>

      {showText && (
        <div>
          <div className="flex items-baseline gap-1 leading-none">
            <span
              className={`font-extrabold tracking-tight leading-none ${
                size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg'
              }`}
              style={{ fontFamily: 'inherit' }}
            >
              <span style={{ color: onDark ? '#6ee7a0' : '#1a6b3c' }}>GOKUL</span>{' '}
              <span style={{ color: onDark ? '#fca5a5' : '#c0392b' }}>BUDS</span>
            </span>
          </div>
          <p
            className={`font-medium leading-none mt-0.5 ${
              size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]'
            } ${onDark ? 'text-gray-400' : darkText ? 'text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
          >
            An Elite Preschool
          </p>
        </div>
      )}
    </div>
  )
}
