import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateNote, useUpdateNote, useDeleteNote } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Note } from '../backend';
import ShareLinkDialog from './ShareLinkDialog';

interface FullScreenEditorOverlayProps {
  mode: 'create' | 'edit';
  note?: Note | null;
  onClose: () => void;
  originX: number;
  originY: number;
}

// Define Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

export default function FullScreenEditorOverlay({ mode, note, onClose, originX, originY }: FullScreenEditorOverlayProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selfDestructTimer, setSelfDestructTimer] = useState<string>('none');
  const [hasChanges, setHasChanges] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [isClosing, setIsClosing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSaveGlow, setShowSaveGlow] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createNoteMutation = useCreateNote();
  const { mutate: updateNote, isPending: isUpdating } = useUpdateNote();
  const { mutate: deleteNote } = useDeleteNote();

  const isSaving = createNoteMutation.isPending || isUpdating;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        if (finalTranscript) {
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = content.substring(0, start) + finalTranscript + content.substring(end);
            setContent(newContent);
            setHasChanges(true);
            
            setTimeout(() => {
              const newPosition = start + finalTranscript.length;
              textarea.setSelectionRange(newPosition, newPosition);
              textarea.focus();
            }, 0);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          toast.error('Microphone permission denied');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [content, language]);

  // Initialize data for edit mode
  useEffect(() => {
    if (mode === 'edit' && note) {
      setTitle(note.title);
      setContent(note.content);
      
      if (!note.selfDestructAt) {
        setSelfDestructTimer('none');
      } else {
        const now = Date.now() * 1_000_000;
        const expiryTime = Number(note.selfDestructAt);
        const remainingNs = expiryTime - now;
        const remainingSeconds = remainingNs / 1_000_000_000;
        
        if (remainingSeconds <= 3600) {
          setSelfDestructTimer('1hour');
        } else if (remainingSeconds <= 86400) {
          setSelfDestructTimer('1day');
        } else if (remainingSeconds <= 604800) {
          setSelfDestructTimer('1week');
        } else {
          setSelfDestructTimer('1month');
        }
      }
      
      setHasChanges(false);
    } else if (mode === 'create') {
      // Auto-focus title input for new notes
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [mode, note]);

  // Track typing state for save glow
  useEffect(() => {
    if (mode === 'edit' && note) {
      const timerChanged = 
        (selfDestructTimer === 'none' && note.selfDestructAt !== undefined) ||
        (selfDestructTimer !== 'none' && note.selfDestructAt === undefined);
      
      const contentChanged = content !== note.content;
      setHasChanges(contentChanged || timerChanged);
    } else if (mode === 'create') {
      setHasChanges(title.trim() !== '' && content.trim() !== '');
    }
  }, [content, selfDestructTimer, note, mode, title]);

  // Idle detection for save glow
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      setShowSaveGlow(false);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (hasChanges) {
          setShowSaveGlow(true);
        }
      }, 1500);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, hasChanges]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsTyping(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsTyping(true);
  };

  const calculateSelfDestructTimestamp = (timerValue: string): bigint | null => {
    if (timerValue === 'none') return null;
    
    const now = Date.now() * 1_000_000;
    let durationNs = 0n;
    
    switch (timerValue) {
      case '1hour':
        durationNs = BigInt(60 * 60 * 1_000_000_000);
        break;
      case '1day':
        durationNs = BigInt(24 * 60 * 60 * 1_000_000_000);
        break;
      case '1week':
        durationNs = BigInt(7 * 24 * 60 * 60 * 1_000_000_000);
        break;
      case '1month':
        durationNs = BigInt(30 * 24 * 60 * 60 * 1_000_000_000);
        break;
      default:
        return null;
    }
    
    return BigInt(now) + durationNs;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your note');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter some content for your note');
      return;
    }

    const selfDestructAt = calculateSelfDestructTimestamp(selfDestructTimer);

    if (mode === 'create') {
      try {
        await createNoteMutation.mutateAsync({ 
          title: title.trim(), 
          content: content.trim(),
          selfDestructAt
        });
        handleClose();
      } catch (error) {
        console.error('Failed to create note:', error);
      }
    } else if (mode === 'edit' && note) {
      updateNote(
        { title: note.title, content: content.trim(), selfDestructAt },
        {
          onSuccess: () => {
            setHasChanges(false);
            setShowSaveGlow(false);
          },
        }
      );
    }
  };

  const toggleVoiceRecording = async () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        if (recognitionRef.current) {
          recognitionRef.current.lang = language;
        }
        
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Microphone permission error:', error);
        toast.error('Microphone permission denied');
      }
    }
  };

  const toggleLanguage = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    }
    setLanguage(prev => prev === 'en-IN' ? 'hi-IN' : 'en-IN');
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleShareClick = () => {
    if (mode === 'edit' && note) {
      setShowShareDialog(true);
    }
  };

  return (
    <>
      {/* Full-screen overlay with center-out expansion */}
      <div
        className={`fixed inset-0 z-50 editor-overlay ${isClosing ? 'editor-overlay-closing' : ''}`}
        style={{
          '--origin-x': `${originX}px`,
          '--origin-y': `${originY}px`,
        } as React.CSSProperties}
      >
        {/* Minimalist Top Bar */}
        <div className="editor-header">
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="editor-back-button"
            aria-label="Close editor"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="editor-session-label">
            ENCRYPTED SESSION
          </div>

          <div className="flex items-center gap-2">
            {mode === 'edit' && note && (
              <Button
                onClick={handleShareClick}
                variant="ghost"
                size="sm"
                className="editor-share-button"
                aria-label="Share note"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || !content.trim() || isSaving}
              variant="ghost"
              size="sm"
              className={`editor-save-button ${showSaveGlow && hasChanges ? 'editor-save-glow' : ''}`}
              aria-label="Save note"
            >
              {isSaving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-gold border-r-transparent"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Boundless Writing Canvas */}
        <div className="editor-content-wrapper">
          <div className="editor-content-container">
            {/* Title Input */}
            <Input
              ref={titleInputRef}
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={handleTitleChange}
              disabled={mode === 'edit' || isSaving}
              className="editor-title-input"
            />

            {/* Content Textarea */}
            <Textarea
              ref={textareaRef}
              placeholder="Start writing your encrypted note..."
              value={content}
              onChange={handleContentChange}
              disabled={isSaving}
              className="editor-textarea"
            />

            {/* Self-Destruct Timer Selector */}
            <div className="editor-timer-section">
              <label htmlFor="timer-select" className="editor-timer-label">
                Self-Destruct Timer
              </label>
              <Select value={selfDestructTimer} onValueChange={setSelfDestructTimer}>
                <SelectTrigger 
                  id="timer-select"
                  className="editor-timer-select"
                >
                  <SelectValue placeholder="Select timer duration" />
                </SelectTrigger>
                <SelectContent className="editor-timer-dropdown">
                  <SelectItem value="none">No Timer</SelectItem>
                  <SelectItem value="1hour">1 Hour</SelectItem>
                  <SelectItem value="1day">1 Day</SelectItem>
                  <SelectItem value="1week">1 Week</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice Controls */}
            {recognitionRef.current && (
              <div className="editor-voice-controls">
                <Button
                  onClick={toggleLanguage}
                  disabled={isSaving}
                  size="sm"
                  variant="ghost"
                  className="editor-language-button"
                >
                  {language === 'en-IN' ? 'EN' : 'HI'}
                </Button>
                <Button
                  onClick={toggleVoiceRecording}
                  disabled={isSaving}
                  size="sm"
                  variant="ghost"
                  className={`editor-voice-button ${isListening ? 'editor-voice-active' : ''}`}
                >
                  {isListening ? 'Stop Voice' : 'Voice Dictation'}
                </Button>
                {isListening && (
                  <span className="editor-listening-indicator">
                    Listening ({language === 'en-IN' ? 'English' : 'Hindi'})...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Link Dialog */}
      {showShareDialog && note && (
        <ShareLinkDialog
          note={note}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </>
  );
}
