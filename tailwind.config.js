/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Design tokens from DESIGN.md §2. Contrast ratios are listed there.
      // Each semantic colour has three shades:
      //   DEFAULT = strong (stripes, borders, icons)
      //   bg      = tint (card and badge backgrounds)
      //   fg      = text on the tint
      colors: {
        brand: {
          primary: '#155E63',
          'primary-hover': '#0E4A4E',
          accent: '#E3F1F1',
        },
        surface: {
          page: '#F6F7F9',
          card: '#FFFFFF',
        },
        // DESIGN.md `text-primary` / `text-muted` → `text-ink` / `text-ink-muted`
        ink: {
          DEFAULT: '#1E2430',
          muted: '#5B6472',
        },
        line: {
          subtle: '#D5D9E0', // decoration only
          strong: '#8A93A3', // inputs, controls, avatar ring
        },
        danger: '#B91C1C', // confirm-delete button only

        // M6 tag-style
        type: {
          feature: { DEFAULT: '#4338CA', bg: '#EEF0FF', fg: '#3730A3' },
          bug: { DEFAULT: '#A21CAF', bg: '#FBEFFC', fg: '#86198F' },
        },

        // M8 due-tint
        due: {
          safe: { DEFAULT: '#15803D', bg: '#EDF7F0', fg: '#166534' },
          warning: { DEFAULT: '#B45309', bg: '#FFF6E5', fg: '#92400E' },
          overdue: { DEFAULT: '#B91C1C', bg: '#FDEDED', fg: '#991B1B' },
          neutral: { DEFAULT: '#64748B', bg: '#F1F3F6', fg: '#475569' },
        },
      },

      // DESIGN.md §3. Fonts are loaded from Google Fonts in index.html.
      fontFamily: {
        heading: ['Lexend', 'system-ui', 'sans-serif'],
        sans: [
          '"Atkinson Hyperlegible Next"',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'sans-serif',
        ],
        mono: [
          '"Atkinson Hyperlegible Mono"',
          'ui-monospace',
          '"Cascadia Mono"',
          'Consolas',
          'monospace',
        ],
      },

      // iOS-style glass (DESIGN.md §2.6). Shadows are soft and wide; blur
      // comes from Tailwind's backdrop-blur utilities.
      boxShadow: {
        glass: '0 8px 32px -8px rgba(30, 36, 48, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'glass-sm': '0 2px 10px -2px rgba(30, 36, 48, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        'glass-lg': '0 24px 64px -12px rgba(30, 36, 48, 0.32)',
      },
    },
  },
  plugins: [
    // `reduce-transparency:` — solid surfaces for users who ask for less
    // transparency in their OS settings (accessibility).
    ({ addVariant }) => {
      addVariant('reduce-transparency', '@media (prefers-reduced-transparency: reduce)');
    },
  ],
};
