
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Sans', 'SF Pro Text', 'system-ui', 'sans-serif'],
        body: ['Geist Sans', 'SF Pro Text', 'system-ui', 'sans-serif'],
        headline: ['Geist Sans', 'SF Pro Text', 'system-ui', 'sans-serif'],
        code: ['Geist Mono', 'monospace'], // Added Geist Mono for code
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'heading-foreground': 'hsl(var(--heading-foreground))',
        card: { // Card styling is primarily via direct classes like bg-white/70
          DEFAULT: 'hsl(var(--background))', // Fallback, actual card style is glass
          foreground: 'hsl(var(--foreground))',
        },
        popover: { // Popover styling also glassmorphic
          DEFAULT: 'hsl(var(--background))', // Fallback
          foreground: 'hsl(var(--foreground))',
        },
        primary: { // Primary action color (Sky Blue)
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: { // For secondary actions, gradients used directly
          DEFAULT: '#F97316', // Orange-500 as a base
          foreground: '#FFFFFF', // White
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: { // Accent color (Sky Blue)
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))', // e.g., red-500
          foreground: 'hsl(var(--destructive-foreground))', // e.g., white
          background: 'hsl(var(--destructive-background))', // e.g., red-100
          border: 'hsl(var(--destructive-border))', // e.g., red-300
        },
        border: 'hsl(var(--border))', // Soft Slate
        input: 'hsl(var(--input-border))', // Input border color
        ring: 'hsl(var(--ring))', // Focus ring color (Sky Blue)
        
        // Specific colors from the palette for direct use if needed
        'brand-sky': {
          500: '#0EA5E9', // sky-500
        },
        'brand-blue': {
          600: '#2563EB', // blue-600
        },
        'brand-orange': {
          500: '#F97316', // orange-500
        },
        'brand-amber': {
          500: '#F59E0B', // amber-500
        },
        'brand-slate': {
          50: '#F8FAFC',
          200: '#E2E8F0',
          300: '#CBD5E1',
          500: '#64748B',
          600: '#475569',
          900: '#0F172A',
        },
        'brand-text-legend': '#005A9C',

        // Sidebar colors (used by sidebar component variants)
        sidebar: {
          foreground: 'hsl(var(--sidebar-foreground))',
          'active-background': 'hsl(var(--sidebar-active-background))',
          'active-foreground': 'hsl(var(--sidebar-active-foreground))',
          'hover-background': 'hsl(var(--sidebar-hover-background))',
          'hover-foreground': 'hsl(var(--sidebar-hover-foreground))',
          border: 'hsl(var(--sidebar-border))',
        },
      },
      borderRadius: { // Default is var(--radius), specific components use Tailwind classes
        lg: 'var(--radius)', // Can be 0.75rem or 1rem for rounded-xl feel
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem', // For cards
        'full': '9999px', // For buttons
      },
      boxShadow: {
        'soft-sky': '0 4px 14px 0 rgba(14, 165, 233, 0.20)', // shadow-sky-500/20
        'soft-orange': '0 4px 14px 0 rgba(249, 115, 22, 0.20)', // shadow-orange-500/20
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Standard XL
      },
      backgroundImage: {
        'primary-action-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'secondary-action-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        fadeIn: { /* Kept for existing header title */
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0px)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -60px) scale(1.15)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.85)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'title-fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'aurora-blob': 'blob 15s infinite ease-in-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
