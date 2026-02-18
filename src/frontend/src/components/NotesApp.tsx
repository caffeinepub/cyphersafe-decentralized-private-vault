import { useState, useEffect, useRef } from 'react';
import { useGetAllNotes, useExpiredNotesCleanup } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useVoiceGreeting } from '../hooks/useVoiceGreeting';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import NotesList from './NotesList';
import FullScreenEditorOverlay from './FullScreenEditorOverlay';
import InstallPrompt from './InstallPrompt';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Shield } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from '@tanstack/react-router';
import type { Note } from '../backend';

export default function NotesApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [originX, setOriginX] = useState(0);
  const [originY, setOriginY] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  const dashboardRef = useRef<HTMLDivElement>(null);

  const { data: notes = [], isLoading } = useGetAllNotes();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Initialize voice greeting with proper props
  useVoiceGreeting({
    userName: userProfile?.name || 'Guest',
    muteGreeting: userProfile?.muteGreeting ?? false,
    enabled: !!userProfile,
  });

  // Initialize expired notes cleanup
  useExpiredNotesCleanup();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onCtrlN: () => {
      const rect = dashboardRef.current?.getBoundingClientRect();
      if (rect) {
        setOriginX(rect.left + rect.width / 2);
        setOriginY(rect.top + rect.height / 2);
      }
      setSelectedNote(null);
      setEditorMode('create');
      setShowEditor(true);
    },
    onEscape: () => {
      if (showEditor) {
        handleCloseEditor();
      }
    },
    enabled: true,
  });

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [searchTerm, notes]);

  useEffect(() => {
    if (selectedNote) {
      const updatedNote = notes.find((n) => n.title === selectedNote.title);
      if (updatedNote) {
        setSelectedNote(updatedNote);
      } else {
        setSelectedNote(null);
      }
    }
  }, [notes, selectedNote]);

  const handleSelectNote = (note: Note, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setOriginX(rect.left + rect.width / 2);
    setOriginY(rect.top + rect.height / 2);
    setSelectedNote(note);
    setEditorMode('edit');
    setShowEditor(true);
  };

  const handleOpenNewNote = (event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setOriginX(rect.left + rect.width / 2);
    setOriginY(rect.top + rect.height / 2);
    setSelectedNote(null);
    setEditorMode('create');
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedNote(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Install Prompt for Desktop */}
      <InstallPrompt />

      {/* Desktop Layout: Side-by-Side */}
      {isDesktop ? (
        <div className="flex h-full">
          {/* Left Panel: Notes List */}
          <div className="w-1/2 border-r border-primary/20 flex flex-col">
            {/* Encrypted Badge and Search Bar */}
            <div className="p-4 space-y-3 border-b border-primary/20 glass-card">
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 neon-border">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-xs font-medium text-primary tracking-wide">End-to-End Encrypted</span>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/50" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/30 border-primary/30 focus:border-primary neon-border backdrop-blur-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 p-4 overflow-y-auto">
              <NotesList
                notes={filteredNotes}
                isLoading={isLoading}
                selectedNote={selectedNote}
                onSelectNote={handleSelectNote}
              />
            </div>

            {/* Bottom Navigation */}
            <div className="border-t border-gold/20 p-4 glass-card">
              <div className="flex items-center justify-between">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full p-3 border-2 border-gold/50 hover:border-gold neon-glow-gold-subtle transition-all"
                    >
                      <Shield className="w-5 h-5 text-gold" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="glass-card neon-border border-primary/30">
                    <div className="flex flex-col gap-4 mt-8">
                      <Button
                        variant="ghost"
                        onClick={() => navigate({ to: '/our-story' })}
                        className="justify-start text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        Our Story
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => navigate({ to: '/quick-guide' })}
                        className="justify-start text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        Quick Guide
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => navigate({ to: '/settings' })}
                        className="justify-start text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        Settings
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <Button
                  onClick={handleOpenNewNote}
                  className="new-crypt-button rounded-2xl px-6 py-4 border-2 border-gold flex items-center gap-3 transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5 text-gold" strokeWidth={3} />
                  <span className="text-gold font-bold text-base tracking-wider cyber-font">NEW CRYPT</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel: Full-Screen Editor (Inline) */}
          <div className="w-1/2 flex flex-col">
            {showEditor ? (
              <FullScreenEditorOverlay
                mode={editorMode}
                note={selectedNote}
                onClose={handleCloseEditor}
                originX={originX}
                originY={originY}
                isInlineMode={true}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-4">
                  <div className="text-6xl">📝</div>
                  <p className="text-lg">Select a note to edit or create a new one</p>
                  <p className="text-sm text-muted-foreground/70">Press Ctrl+N to create a new note</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mobile Layout: Stacked */
        <>
          <div 
            ref={dashboardRef}
            className={`dashboard-content ${showEditor ? 'dashboard-spotlight' : ''}`}
          >
            {/* Encrypted Badge and Search Bar */}
            <div className="p-4 space-y-3 border-b border-primary/20 glass-card">
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 neon-border">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-xs font-medium text-primary tracking-wide">End-to-End Encrypted</span>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/50" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/30 border-primary/30 focus:border-primary neon-border backdrop-blur-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 p-4 min-h-0">
              <NotesList
                notes={filteredNotes}
                isLoading={isLoading}
                selectedNote={selectedNote}
                onSelectNote={handleSelectNote}
              />
            </div>
          </div>

          {/* Fixed Bottom Navigation Bar with Glassmorphism */}
          <div className="fixed bottom-0 left-0 right-0 bottom-nav-glass border-t border-gold/20 p-4 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full p-3 border-2 border-gold/50 hover:border-gold neon-glow-gold-subtle transition-all"
                  >
                    <Shield className="w-5 h-5 text-gold" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="glass-card neon-border border-primary/30">
                  <div className="flex flex-col gap-4 mt-8">
                    <Button
                      variant="ghost"
                      onClick={() => navigate({ to: '/our-story' })}
                      className="justify-start text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      Our Story
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate({ to: '/quick-guide' })}
                      className="justify-start text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      Quick Guide
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate({ to: '/settings' })}
                      className="justify-start text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      Settings
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                onClick={handleOpenNewNote}
                className="new-crypt-button rounded-2xl px-8 py-6 border-2 border-gold flex items-center gap-3 transition-all hover:scale-105"
              >
                <Plus className="w-6 h-6 text-gold" strokeWidth={3} />
                <span className="text-gold font-bold text-lg tracking-wider cyber-font">NEW CRYPT</span>
              </Button>
            </div>
          </div>

          {/* Full-Screen Editor Overlay */}
          {showEditor && (
            <FullScreenEditorOverlay
              mode={editorMode}
              note={selectedNote}
              onClose={handleCloseEditor}
              originX={originX}
              originY={originY}
              isInlineMode={false}
            />
          )}
        </>
      )}
    </div>
  );
}
