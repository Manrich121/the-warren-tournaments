import { useMutation, useQueryClient } from '@tanstack/react-query';
import { keys } from '@/hooks/keys';

const deleteEvent = async (id: number): Promise<void> => {
  const res = await fetch(`/api/events/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Failed to delete event');
  }
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.events() });
    }
  });
};
