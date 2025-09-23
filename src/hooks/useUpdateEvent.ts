import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@/lib/types';
import { keys } from '@/hooks/keys';

const updateEvent = async (updatedEvent: Partial<Event> & { id: number }): Promise<Event> => {
  const res = await fetch(`/api/events/${updatedEvent.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedEvent)
  });
  if (!res.ok) {
    throw new Error('Failed to update event');
  }
  return res.json();
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation<Event, Error, Partial<Event> & { id: number }>({
    mutationFn: updateEvent,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.event(variables.id) });
    }
  });
};
