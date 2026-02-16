import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Profile, HomeworkEntry, Fee, Message } from '../backend';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Profile | null>({
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
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile updated successfully', {
        action: {
          label: 'Undo',
          onClick: () => {
            // Undo will be handled by UndoManager
          },
        },
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

export function useUndoProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phone: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.undoProfile(phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile change undone');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to undo profile change');
    },
  });
}

export function useGetAttendance(classId: string, studentPhone: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['attendance', classId, studentPhone],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAttendance(classId, studentPhone);
    },
    enabled: !!actor && !actorFetching && !!classId && !!studentPhone,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, studentPhone, present }: { classId: string; studentPhone: string; present: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAttendance(classId, studentPhone, present);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance marked successfully', {
        action: {
          label: 'Undo',
          onClick: () => {
            // Undo will be handled by UndoManager
          },
        },
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark attendance');
    },
  });
}

export function useUndoAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, studentPhone }: { classId: string; studentPhone: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.undoAttendance(classId, studentPhone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance change undone');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to undo attendance');
    },
  });
}

export function useGetHomework(classId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<HomeworkEntry | null>({
    queryKey: ['homework', classId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getHomework(classId);
    },
    enabled: !!actor && !actorFetching && !!classId,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useAddHomework() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, entry }: { classId: string; entry: HomeworkEntry }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHomework(classId, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      toast.success('Homework added successfully', {
        action: {
          label: 'Undo',
          onClick: () => {
            // Undo will be handled by UndoManager
          },
        },
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add homework');
    },
  });
}

export function useDeleteHomework() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHomework(classId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      toast.success('Homework deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete homework');
    },
  });
}

export function useUndoHomework() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.undoHomework(classId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      toast.success('Homework change undone');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to undo homework');
    },
  });
}

export function useGetFees(phone: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Fee | null>({
    queryKey: ['fees', phone],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getFees(phone);
    },
    enabled: !!actor && !actorFetching && !!phone,
    refetchInterval: 15000, // Poll every 15 seconds
  });
}

export function useUpdateFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phone, fee }: { phone: string; fee: Fee }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFee(phone, fee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Fee updated successfully', {
        action: {
          label: 'Undo',
          onClick: () => {
            // Undo will be handled by UndoManager
          },
        },
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update fee');
    },
  });
}

export function useUndoFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phone: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.undoFee(phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Fee change undone');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to undo fee');
    },
  });
}

export function useGetMessages() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMessages();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: Message) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}

export function useGetAllProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Profile[]>({
    queryKey: ['allProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}
