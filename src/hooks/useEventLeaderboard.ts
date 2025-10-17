import { useQuery } from '@tanstack/react-query';
import { RankedPlayer } from '@/lib/playerStats';
import { keys } from '@/hooks/keys';

const fetchEventLeaderboard = async (eventId: string): Promise<RankedPlayer[]> => {
  const res = await fetch(`/api/events/${eventId}/leaderboard`);
  if (!res.ok) {
    throw new Error('Failed to fetch event leaderboard');
  }
  return res.json();
};

export const useEventLeaderboard = (eventId: string) => {
  return useQuery<RankedPlayer[], Error>({
    queryKey: keys.eventLeaderboard(eventId),
    queryFn: () => fetchEventLeaderboard(eventId),
    enabled: !!eventId,
  });
};
