import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@prisma/client';
import { keys } from '@/hooks/keys';

const addEvent = async (newEvent: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newEvent)
  });
  if (!res.ok) {
    throw new Error('Failed to add event');
  }
  return res.json();
};

export const useAddEvent = () => {
  const queryClient = useQueryClient();
  return useMutation<Event, Error, Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: addEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.events() });
    }
  });
};
