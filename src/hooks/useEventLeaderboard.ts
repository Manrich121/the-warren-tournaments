import { useQuery } from '@tanstack/react-query';
import { keys } from '@/hooks/keys';
import { EventRankedPlayer } from '@/types/PlayerStats';

const fetchEventLeaderboard = async (eventId: string): Promise<EventRankedPlayer[]> => {
  const res = await fetch(`/api/events/${eventId}/leaderboard`);
  if (!res.ok) {
    throw new Error('Failed to fetch event leaderboard');
  }
  return res.json();
};

export const useEventLeaderboard = (eventId: string) => {
  return useQuery<EventRankedPlayer[], Error>({
    queryKey: keys.eventLeaderboard(eventId),
    queryFn: () => fetchEventLeaderboard(eventId),
    enabled: !!eventId
  });
};
