import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@prisma/client';
import { keys } from '@/hooks/keys';

const updateEvent = async (updatedEvent: Partial<Event> & { id: string }): Promise<Event> => {
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
  return useMutation<Event, Error, Partial<Event> & { id: string }>({
    mutationFn: updateEvent,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.events() }),
        queryClient.invalidateQueries({ queryKey: keys.event(variables.id) })
      ]);
    }
  });
};
