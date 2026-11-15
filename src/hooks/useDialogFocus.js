import { useEffect, useRef } from 'react';

export function useDialogFocus(open, onEscape) {
  const escape = useRef(onEscape);
  escape.current = onEscape;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => [...document.querySelectorAll('[role="dialog"] button:not(:disabled), [role="dialog"] input:not(:disabled)')];
    focusable()[0]?.focus();
    const handle = event => {
      if (event.key === 'Escape') escape.current?.();
      if (event.key === 'Tab') {
        const nodes = focusable();
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (!nodes.length) { event.preventDefault(); return; }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handle);
    return () => { document.removeEventListener('keydown', handle); document.body.style.overflow = overflow; previous?.focus(); };
  }, [open]);
}
