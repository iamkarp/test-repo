import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useGameStore } from '../engine/store';

export function CommandInput() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const processCommand = useGameStore((state) => state.processCommand);

  // Focus input on mount and when clicking anywhere
  useEffect(() => {
    inputRef.current?.focus();

    const handleClick = () => {
      inputRef.current?.focus();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Process command
    processCommand(trimmed);

    // Clear input
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  return (
    <div className="command-input-container">
      <span className="prompt">&gt;</span>
      <input
        ref={inputRef}
        type="text"
        className="command-input"
        value={input}
        onChange={(e) => setInput(e.target.value.toUpperCase())}
        onKeyDown={handleKeyDown}
        placeholder="Enter command..."
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </div>
  );
}
