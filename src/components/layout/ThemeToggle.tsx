'use client';

import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { de } from '@/lib/i18n/de';
import { useTheme } from '@/store/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? de.header.switchToLight : de.header.switchToDark;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
