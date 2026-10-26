/** @type {import('tailwindcss').Config} */

// Colour tokens are CSS variables (RGB triplets) defined in src/index.css,
// once for the light theme and once for the dark theme (DESIGN.md §2). The
// accent preset overrides the `brand-*` variables at run time (src/lib/color.js).
// Class names do not change between themes: `bg-brand-primary` works in both.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;
const semantic = (name) => ({ DEFAULT: token(name), bg: token(`${name}-bg`), fg: token(`${name}-fg`) });

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Each semantic colour has three shades:
      //   DEFAULT = strong (stripes, borders, icons)
      //   bg      = tint (card and badge backgrounds)
      //   fg      = text on the tint
      colors: {
        brand: {
          primary: token('brand-primary'),
          'primary-hover': token('brand-primary-hover'),
          accent: token('brand-accent'),
        },
        surface: {
          page: token('surface-page'),
          card: token('surface-card'),
        },
        // DESIGN.md `text-primary` / `text-muted` → `text-ink` / `text-ink-muted`
        ink: {
          DEFAULT: token('ink'),
          muted: token('ink-muted'),
        },
        line: {
          subtle: token('line-subtle'), // decoration only
          strong: token('line-strong'), // inputs, controls, avatar ring
        },
        danger: token('danger'), // confirm-delete button only

        // Glass surfaces (DESIGN.md §2.6): the fill and the 1 px edge.
        glass: { DEFAULT: token('glass'), edge: token('glass-edge') },
        field: token('field'), // inputs are always solid
        // Text on solid fills: brand buttons, type pills, the danger button.
        'on-brand': token('on-brand'),
        'on-strong': token('on-strong'),
        // Toasts are the inverse of the page (dark in light mode, light in dark mode).
        inverse: token('inverse'),
        'on-inverse': token('on-inverse'),
        scrim: token('scrim'), // modal backdrop
        blob: { 1: token('blob-1'), 2: token('blob-2'), 3: token('blob-3') },

        // M6 tag-style
        type: {
          feature: semantic('type-feature'),
          bug: semantic('type-bug'),
        },

        // M8 due-tint
        due: {
          safe: semantic('due-safe'),
          warning: semantic('due-warning'),
          overdue: semantic('due-overdue'),
          neutral: semantic('due-neutral'),
        },
      },

      // DESIGN.md §3. Sizes are in rem, so the text-size setting scales them.
      fontSize: {
        caption: ['0.8125rem', '1.125rem'], // 13 / 18 px
        'card-title': ['0.9375rem', '1.375rem'], // 15 / 22 px
        wordmark: ['1.75rem', '2rem'], // 28 / 32 px
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

      // iOS-style glass (DESIGN.md §2.6). The shadow values differ per theme,
      // so they are CSS variables too.
      boxShadow: {
        glass: 'var(--shadow-glass)',
        'glass-sm': 'var(--shadow-glass-sm)',
        'glass-lg': 'var(--shadow-glass-lg)',
      },
    },
  },
  plugins: [
    // `reduce-transparency:` — solid surfaces for users who ask for less
    // transparency, in the OS or in Slopify's settings (accessibility).
    ({ addVariant }) => {
      addVariant('reduce-transparency', [
        '@media (prefers-reduced-transparency: reduce)',
        ':root[data-transparency="reduce"] &',
      ]);
    },
  ],
};
