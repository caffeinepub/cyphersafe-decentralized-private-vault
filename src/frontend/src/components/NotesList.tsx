import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Clock, Timer } from 'lucide-react';
import type { Note } from '../backend';
import { useEffect, useState } from 'react';

interface NotesListProps {
  notes: Note[];
  isLoading: boolean;
  selectedNote: Note | null;
  onSelectNote: (note: Note, event: React.MouseEvent) => void;
}

export default function NotesList({ notes, isLoading, selectedNote, onSelectNote }: NotesListProps) {
  const [, setTick] = useState(0);

  // Force re-render every second to update countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeRemaining = (selfDestructAt?: bigint): string | null => {
    if (!selfDestructAt) return null;

    const now = Date.now() * 1_000_000;
    const expiryTime = Number(selfDestructAt);
    const remainingNs = expiryTime - now;

    if (remainingNs <= 0) return 'Expired';

    const remainingMs = remainingNs / 1_000_000;
    const seconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  if (isLoading) {
    return (
      <Card className="flex-1 p-4 glass-card neon-border border-primary/30">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-primary/20 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-primary/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (notes.length === 0) {
    return (
      <Card className="flex-1 p-8 glass-card neon-border border-primary/30 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50 text-primary" />
          <p className="text-sm">No notes found</p>
          <p className="text-xs mt-1">Create your first note to get started</p>
        </div>
      </Card>
    );
  }

  const sortedNotes = [...notes].sort((a, b) => Number(b.lastModified - a.lastModified));

  return (
    <Card className="flex-1 glass-card neon-border border-primary/30 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-2 space-y-2">
          {sortedNotes.map((note) => {
            const timeRemaining = formatTimeRemaining(note.selfDestructAt);
            
            return (
              <button
                key={note.title}
                onClick={(e) => onSelectNote(note, e)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  selectedNote?.title === note.title
                    ? 'glass-card-selected neon-border border-primary'
                    : 'glass-card-hover neon-border border-primary/20 hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate text-foreground">{note.title}</h3>
                      {timeRemaining && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30 flex-shrink-0">
                          <Timer className="w-3 h-3 text-gold" />
                          <span className="text-xs font-medium text-gold">{timeRemaining}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{note.content}</p>
                    <div className="flex items-center gap-1 text-xs text-primary/70">
                      <Clock className="w-3 h-3" />
                      {formatDate(note.lastModified)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
