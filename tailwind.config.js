/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			surface: '#0e0e0e',
  			'surface-container': '#191a1a',
  			'surface-container-low': '#131313',
  			'surface-container-high': '#1f2020',
  			'surface-container-highest': '#252626',
  			'surface-container-lowest': '#000000',
  			'surface-bright': '#2c2c2c',
  			'surface-dim': '#0e0e0e',
  			'surface-variant': '#252626',
  			primary: '#c6c6c7',
  			'primary-container': '#454747',
  			'primary-dim': '#b8b9b9',
  			'primary-fixed': '#e2e2e2',
  			'primary-fixed-dim': '#d4d4d4',
  			'on-primary': '#3f4041',
  			'on-primary-fixed': '#3e4040',
  			'on-primary-container': '#d0d0d0',
  			'on-primary-fixed-variant': '#5a5c5c',
  			'inverse-primary': '#5e5f60',
  			secondary: '#9f9d9d',
  			'secondary-container': '#3b3b3b',
  			'secondary-dim': '#9f9d9d',
  			'secondary-fixed': '#e4e2e1',
  			'secondary-fixed-dim': '#d6d4d3',
  			'on-secondary': '#202020',
  			'on-secondary-container': '#c1bfbe',
  			'on-secondary-fixed': '#3f3f3f',
  			'on-secondary-fixed-variant': '#5c5b5b',
  			tertiary: '#fbf9f8',
  			'tertiary-container': '#ecebea',
  			'tertiary-dim': '#ecebea',
  			'tertiary-fixed': '#f5f3f3',
  			'tertiary-fixed-dim': '#e6e5e5',
  			'on-tertiary': '#5f5f5f',
  			'on-tertiary-container': '#565757',
  			'on-tertiary-fixed': '#494a4a',
  			'on-tertiary-fixed-variant': '#666666',
  			'on-surface': '#e7e5e4',
  			'on-surface-variant': '#acabaa',
  			'inverse-surface': '#fcf9f8',
  			'inverse-on-surface': '#565555',
  			outline: '#767575',
  			'outline-variant': '#484848',
  			error: '#ee7d77',
  			'error-dim': '#bb5551',
  			'error-container': '#7f2927',
  			'on-error': '#490106',
  			'on-error-container': '#ff9993',
  			background: '#0e0e0e',
  			'on-background': '#e7e5e4',
  			'surface-tint': '#c6c6c7',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			headline: [
  				'Inter',
  				'sans-serif'
  			],
  			body: [
  				'Inter',
  				'sans-serif'
  			],
  			label: [
  				'Inter',
  				'sans-serif'
  			]
  		}
  	}
  },
  plugins: [],
}