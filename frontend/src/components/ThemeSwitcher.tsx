import { useState, useEffect } from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { themeColors } from '@/theme-config';

type Mode = 'light' | 'dark';

export function ThemeSwitcher() {
  const [themeId, setThemeId] = useState<number>(0);
  const [mode, setMode] = useState<Mode>('light');

  useEffect(() => {
    const savedThemeId = localStorage.getItem('themeId');
    const savedMode = localStorage.getItem('mode') as Mode | null;

    const id = savedThemeId ? parseInt(savedThemeId) : 0;
    setThemeId(id);
    if (savedMode) setMode(savedMode);

    applyTheme(id, savedMode || 'light');
  }, []);

  const applyTheme = (id: number, newMode: Mode) => {
    const root = document.documentElement;
    const theme = themeColors.find(t => t.id === id);

    if (!theme) return;

    // 移除所有主题类
    themeColors.forEach(t => {
      root.classList.remove(`theme-${t.id}`);
    });
    root.classList.remove('dark');

    // 应用新主题 (id为0是默认主题,不需要添加class)
    if (id !== 0) {
      root.classList.add(`theme-${id}`);
    }

    // 应用暗色模式
    if (newMode === 'dark') {
      root.classList.add('dark');
    }
  };

  const handleThemeChange = (id: number) => {
    setThemeId(id);
    localStorage.setItem('themeId', id.toString());
    applyTheme(id, mode);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('mode', newMode);
    applyTheme(themeId, newMode);
  };

  const currentTheme = themeColors.find(t => t.id === themeId) || themeColors[0];

  // 按类别分组
  const traditionalLow = themeColors.filter(t => t.category === 'traditional' && t.saturation === 'low');
  const traditionalMedium = themeColors.filter(t => t.category === 'traditional' && t.saturation === 'medium');
  const traditionalHigh = themeColors.filter(t => t.category === 'traditional' && t.saturation === 'high');
  const modern = themeColors.filter(t => t.category === 'modern');

  return (
    <div className="fixed top-4 right-4 flex gap-2 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMode}
        className="bg-background/80 backdrop-blur-sm"
        title={mode === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
      >
        {mode === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-background/80 backdrop-blur-sm"
            title={`当前主题: ${currentTheme.name}`}
          >
            <Palette className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
          <DropdownMenuLabel>中国传统色 · 素雅</DropdownMenuLabel>
          {traditionalLow.map(theme => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`group ${themeId === theme.id ? 'bg-accent' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                  />
                  <span>{theme.name}</span>
                </div>
                <span className="text-xs text-muted-foreground group-data-[highlighted]:text-accent-foreground transition-colors">{theme.description}</span>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>中国传统色 · 温润</DropdownMenuLabel>
          {traditionalMedium.map(theme => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`group ${themeId === theme.id ? 'bg-accent' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                  />
                  <span>{theme.name}</span>
                </div>
                <span className="text-xs text-muted-foreground group-data-[highlighted]:text-accent-foreground transition-colors">{theme.description}</span>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>中国传统色 · 浓艳</DropdownMenuLabel>
          {traditionalHigh.map(theme => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`group ${themeId === theme.id ? 'bg-accent' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                  />
                  <span>{theme.name}</span>
                </div>
                <span className="text-xs text-muted-foreground group-data-[highlighted]:text-accent-foreground transition-colors">{theme.description}</span>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>现代常见色</DropdownMenuLabel>
          {modern.map(theme => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`group ${themeId === theme.id ? 'bg-accent' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                  />
                  <span>{theme.name}</span>
                </div>
                <span className="text-xs text-muted-foreground group-data-[highlighted]:text-accent-foreground transition-colors">{theme.description}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
