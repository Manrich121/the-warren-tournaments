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

export const useEvents = (params?: { leagueId: string }) => {
  const leagueId = params?.leagueId;
  return useQuery<Event[], Error>({
    queryKey: keys.events(),
    queryFn: fetchEvents,
    initialData: () => [],
    select: data => {
      const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (leagueId) {
        return sortedData.filter(event => event.leagueId === leagueId);
      }
      return sortedData;
    }
  });
};
