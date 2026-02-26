export interface ThemeColors {
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  glow: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
}

export const themes: Record<string, Theme> = {
  'deep-sea': {
    name: 'Deep Sea',
    colors: {
      bg: 'rgb(8, 12, 24)',
      surface: 'rgba(255, 255, 255, 0.03)',
      border: 'rgba(255, 255, 255, 0.08)',
      text: 'rgba(203, 213, 225, 1)',
      textMuted: 'rgba(148, 163, 184, 0.6)',
      accent: 'rgba(56, 189, 248, 0.8)',
      glow: 'rgba(56, 189, 248, 0.15)',
    },
  },
  moonlight: {
    name: 'Moonlight',
    colors: {
      bg: 'rgb(16, 12, 28)',
      surface: 'rgba(255, 255, 255, 0.03)',
      border: 'rgba(255, 255, 255, 0.08)',
      text: 'rgba(210, 208, 226, 1)',
      textMuted: 'rgba(160, 155, 185, 0.6)',
      accent: 'rgba(192, 132, 252, 0.8)',
      glow: 'rgba(192, 132, 252, 0.15)',
    },
  },
  sunlight: {
    name: 'Sunlight',
    colors: {
      bg: 'rgb(255, 252, 248)',
      surface: 'rgba(0, 0, 0, 0.02)',
      border: 'rgba(0, 0, 0, 0.08)',
      text: 'rgba(41, 37, 36, 1)',
      textMuted: 'rgba(87, 83, 78, 0.6)',
      accent: 'rgba(217, 119, 6, 0.9)',
      glow: 'rgba(217, 119, 6, 0.1)',
    },
  },
  forest: {
    name: 'Forest',
    colors: {
      bg: 'rgb(10, 20, 14)',
      surface: 'rgba(255, 255, 255, 0.03)',
      border: 'rgba(255, 255, 255, 0.08)',
      text: 'rgba(196, 215, 200, 1)',
      textMuted: 'rgba(150, 180, 155, 0.6)',
      accent: 'rgba(74, 222, 128, 0.8)',
      glow: 'rgba(74, 222, 128, 0.15)',
    },
  },
  minimal: {
    name: 'Minimal',
    colors: {
      bg: 'rgb(18, 18, 18)',
      surface: 'rgba(255, 255, 255, 0.03)',
      border: 'rgba(255, 255, 255, 0.08)',
      text: 'rgba(212, 212, 212, 1)',
      textMuted: 'rgba(163, 163, 163, 0.6)',
      accent: 'rgba(212, 212, 212, 0.9)',
      glow: 'rgba(212, 212, 212, 0.1)',
    },
  },
};

export function applyTheme(themeId: string) {
  const theme = themes[themeId];
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--deep-sea-bg', theme.colors.bg);
  root.style.setProperty('--deep-sea-surface', theme.colors.surface);
  root.style.setProperty('--deep-sea-border', theme.colors.border);
  root.style.setProperty('--deep-sea-text', theme.colors.text);
  root.style.setProperty('--deep-sea-text-muted', theme.colors.textMuted);
  root.style.setProperty('--deep-sea-accent', theme.colors.accent);
  root.style.setProperty('--deep-sea-glow', theme.colors.glow);
}
