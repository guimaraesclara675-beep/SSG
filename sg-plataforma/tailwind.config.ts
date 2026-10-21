import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#07193F', accent: '#1A47B8', gold: '#B08A36', ink: '#0B1B3A', muted: '#56627C', line: '#DFE5F0', surface: '#F4F6FB'
      },
      fontFamily: { display: ['Sora', 'system-ui', 'sans-serif'], body: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: []
};
export default config;
