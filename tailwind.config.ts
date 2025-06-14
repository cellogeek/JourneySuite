
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
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))', // #FAF8F5
        foreground: 'hsl(var(--foreground))', // #333333
        card: {
          DEFAULT: 'hsl(var(--card))', // #FFFFFF
          foreground: 'hsl(var(--card-foreground))', // #333333
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))', // #FFFFFF
          foreground: 'hsl(var(--popover-foreground))', // #333333
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))', // #6F4E37 (Coffee Brown)
          foreground: 'hsl(var(--primary-foreground))', // #FFFFFF
        },
        secondary: { // A lighter brown or gray for secondary elements
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: { // Lighter gray for muted text/elements
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: { // Can be same as primary or a different coffee theme accent
          DEFAULT: 'hsl(var(--accent))', // #6F4E37
          foreground: 'hsl(var(--accent-foreground))', // #FFFFFF
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: { // Earthy Green
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        border: 'hsl(var(--border))', // #E5E7EB
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))', // #6F4E37
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: { // Sidebar specific theme
          DEFAULT: 'hsl(var(--sidebar-background))', // #FFFFFF
          foreground: 'hsl(var(--sidebar-foreground))', // #333333
          primary: 'hsl(var(--sidebar-primary))', // Coffee brown for active item background
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))', // White text on active
          accent: 'hsl(var(--sidebar-accent))', // Light coffee/beige for hover
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))', // Dark coffee for hover text
          border: 'hsl(var(--sidebar-border))', // #E5E7EB
          ring: 'hsl(var(--sidebar-ring))', // Coffee brown
        },
      },
      borderRadius: {
        lg: 'var(--radius)', // Typically 0.5rem for ShadCN default
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'title-fade-in': 'fadeIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
