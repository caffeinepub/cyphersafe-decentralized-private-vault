import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Note, UserProfile } from '../backend';
import { toast } from 'sonner';
import { speakFeedback } from './useVoiceGreeting';
import { useEffect, useRef } from 'react';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useMarkWelcomePopupSeen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.markWelcomePopupSeen();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
}

export function useGetMuteGreetingPreference() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['muteGreeting'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMuteGreetingPreference();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSetMuteGreetingPreference() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mute: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setMuteGreetingPreference(mute);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['muteGreeting'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Preference updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update preference: ${error.message}`);
    },
  });
}

export function useGetAllNotes() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      if (!actor) return [];
      const notes = await actor.getAllNotes();
      
      // Check for expired notes and remove them from the UI
      const now = Date.now() * 1_000_000; // Convert to nanoseconds
      const expiredNotes = notes.filter(note => 
        note.selfDestructAt && Number(note.selfDestructAt) <= now
      );
      
      if (expiredNotes.length > 0) {
        // Show toast for each expired note
        expiredNotes.forEach(() => {
          toast.info('⏳ A note has self-destructed for your privacy.');
        });
        
        // Trigger a refetch to get updated list from backend
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['notes'] });
        }, 100);
      }
      
      return notes;
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000, // Refetch every 30 seconds to check for expired notes
  });

  return query;
}

export function useCreateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  return useMutation({
    mutationFn: async ({ 
      title, 
      content, 
      selfDestructAt 
    }: { 
      title: string; 
      content: string; 
      selfDestructAt?: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createNote(title, content, selfDestructAt ?? null);
    },
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created successfully');
      
      // Play voice feedback if not muted
      if (!userProfile?.muteGreeting) {
        if (variables.selfDestructAt) {
          await speakFeedback('Timer activated. This note will self-destruct for your privacy.');
        } else {
          await speakFeedback('Got it. Your note is now encrypted and safely tucked away in the blockchain.');
        }
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to create note: ${error.message}`);
    },
  });
}

export function useUpdateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  return useMutation({
    mutationFn: async ({ 
      title, 
      content, 
      selfDestructAt 
    }: { 
      title: string; 
      content: string; 
      selfDestructAt?: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNote(title, content, selfDestructAt ?? null);
    },
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note updated successfully');
      
      // Play voice feedback if not muted
      if (!userProfile?.muteGreeting) {
        if (variables.selfDestructAt) {
          await speakFeedback('Timer activated. This note will self-destruct for your privacy.');
        } else {
          await speakFeedback('Got it. Your note is now encrypted and safely tucked away in the blockchain.');
        }
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update note: ${error.message}`);
    },
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteNote(title);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted successfully');
      
      // Play voice feedback if not muted
      if (!userProfile?.muteGreeting) {
        await speakFeedback('Understood. That record has been permanently erased from existence.');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete note: ${error.message}`);
    },
  });
}

export function useSearchNotes(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Note[]>({
    queryKey: ['notes', 'search', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      if (!searchTerm.trim()) {
        return actor.getAllNotes();
      }
      return actor.searchNotes(searchTerm);
    },
    enabled: !!actor && !actorFetching,
  });
}

// Hook to periodically check and clean up expired notes
export function useExpiredNotesCleanup() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check every minute for expired notes
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryClient]);
}

// Share link mutations
export function useCreateShareLink() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      encryptedNote,
      nonce,
      expiresAt,
      viewOnce,
    }: {
      encryptedNote: Uint8Array;
      nonce: Uint8Array;
      expiresAt: bigint | null;
      viewOnce: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createShareLink(encryptedNote, nonce, expiresAt, viewOnce);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create share link: ${error.message}`);
    },
  });
}

export function useOpenShareLink(shareId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[Uint8Array, Uint8Array]>({
    queryKey: ['shareLink', shareId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.openShareLink(shareId);
    },
    enabled: !!actor && !actorFetching && !!shareId,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
}
