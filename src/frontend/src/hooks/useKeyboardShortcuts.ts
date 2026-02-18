import { useEffect } from 'react';
import { useInternetIdentity } from './useInternetIdentity';

interface KeyboardShortcutsProps {
  onCtrlN?: () => void;
  onCtrlS?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onCtrlN,
  onCtrlS,
  onEscape,
  enabled = true,
}: KeyboardShortcutsProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+N - Create new note (only when authenticated)
      if (event.ctrlKey && event.key === 'n' && isAuthenticated && onCtrlN) {
        event.preventDefault();
        onCtrlN();
      }

      // Ctrl+S - Save note
      if (event.ctrlKey && event.key === 's' && onCtrlS) {
        event.preventDefault();
        onCtrlS();
      }

      // Escape - Exit editor
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCtrlN, onCtrlS, onEscape, enabled, isAuthenticated]);
}
