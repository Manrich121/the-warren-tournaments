import { useQuery } from '@tanstack/react-query';
import { Event } from '@prisma/client';
import { keys } from '@/hooks/keys';

const fetchEvents = async (): Promise<Event[]> => {
  const res = await fetch('/api/events');
  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }
  return res.json();
};

export const useEvents = () => {
  return useQuery<Event[], Error>({
    queryKey: keys.events(),
    queryFn: fetchEvents,
    select: data => data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date descending
  });
};
