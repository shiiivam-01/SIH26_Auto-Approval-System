import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const ThemeToggle = ({ size = 'sm', className }) => {
  const { isDark, toggleTheme } = useTheme();

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 active:scale-95 shadow-2xs select-none',
        'border-slate-300/80 dark:border-slate-700 bg-slate-100 dark:bg-slate-800',
        isSmall ? 'h-5 w-10 p-0.5' : 'h-6.5 w-13 p-0.5',
        className
      )}
    >
      {/* Background track icons */}
      <span className={cn('absolute inset-0 flex items-center justify-between pointer-events-none', isSmall ? 'px-1' : 'px-1.5')}>
        <Sun className={cn('transition-opacity duration-200', isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5', isDark ? 'text-slate-400 opacity-40' : 'text-amber-500 opacity-100')} />
        <Moon className={cn('transition-opacity duration-200', isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5', isDark ? 'text-indigo-400 opacity-100' : 'text-slate-400 opacity-40')} />
      </span>

      {/* Sliding pill knob with icon */}
      <span
        className={cn(
          'pointer-events-none inline-flex transform items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isSmall ? 'h-4 w-4' : 'h-5.5 w-5.5',
          isDark ? (isSmall ? 'translate-x-5' : 'translate-x-6.5') : 'translate-x-0'
        )}
      >
        {isDark ? (
          <Moon className={cn('text-indigo-400 transition-transform duration-300', isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
        ) : (
          <Sun className={cn('text-amber-500 transition-transform duration-300', isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
        )}
      </span>
    </button>
  );
};
