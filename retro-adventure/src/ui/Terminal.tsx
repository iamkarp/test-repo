import { useEffect, useRef } from 'react';
import { useGameStore } from '../engine/store';
import type { LogEntry } from '../engine/types';

function getLogClass(type: LogEntry['type']): string {
  switch (type) {
    case 'command':
      return 'log-command';
    case 'error':
      return 'log-error';
    case 'system':
      return 'log-system';
    case 'narration':
    default:
      return 'log-narration';
  }
}

export function Terminal() {
  const log = useGameStore((state) => state.log);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new log entries
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="terminal" ref={terminalRef}>
      {log.map((entry, index) => (
        <div key={index} className={`log-entry ${getLogClass(entry.type)}`}>
          {entry.text || '\u00A0'}
        </div>
      ))}
    </div>
  );
}
