import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Note, UserProfile } from '../backend';
import { toast } from 'sonner';
import { speakFeedback } from './useVoiceGreeting';
import { useEffect } from 'react';

// User Profile Queries
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
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Note Queries
export function useGetAllNotes() {
  const { actor, isFetching } = useActor();

  return useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotes();
    },
    enabled: !!actor && !isFetching,
    refetchOnWindowFocus: true,
  });
}

export function useGetNote(title: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Note>({
    queryKey: ['note', title],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getNote(title);
    },
    enabled: !!actor && !isFetching && !!title,
  });
}

export function useCreateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content, selfDestructAt }: { title: string; content: string; selfDestructAt: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createNote(title, content, selfDestructAt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created successfully');
      speakFeedback('Note created');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create note');
    },
  });
}

export function useUpdateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content, selfDestructAt }: { title: string; content: string; selfDestructAt: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNote(title, content, selfDestructAt);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', variables.title] });
      toast.success('Note updated successfully');
      speakFeedback('Note saved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update note');
    },
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteNote(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted successfully');
      speakFeedback('Note deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete note');
    },
  });
}

export function useSearchNotes(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Note[]>({
    queryKey: ['notes', 'search', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchNotes(searchTerm);
    },
    enabled: !!actor && !isFetching && !!searchTerm,
  });
}

// Share Link Queries
export function useCreateShareLink() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ 
      encryptedNote, 
      nonce, 
      expiresAt, 
      viewOnce 
    }: { 
      encryptedNote: Uint8Array; 
      nonce: Uint8Array; 
      expiresAt: bigint | null; 
      viewOnce: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createShareLink(encryptedNote, nonce, expiresAt, viewOnce);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create share link');
    },
  });
}

export function useOpenShareLink() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (shareId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.openShareLink(shareId);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to open share link');
    },
  });
}

// Expired Notes Cleanup
export function useExpiredNotesCleanup() {
  const { data: notes = [] } = useGetAllNotes();
  const { mutate: deleteNote } = useDeleteNote();

  useEffect(() => {
    const now = Date.now() * 1_000_000;
    
    notes.forEach((note) => {
      if (note.selfDestructAt) {
        const expiryTime = Number(note.selfDestructAt);
        if (expiryTime <= now) {
          deleteNote(note.title);
        }
      }
    });
  }, [notes, deleteNote]);
}
