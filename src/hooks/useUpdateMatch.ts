import { useMutation, useQueryClient } from '@tanstack/react-query';
import { keys } from '@/hooks/keys';

interface UpdateMatchData {
  id: string;
  round: number;
  player1Score: number;
  player2Score: number;
  draw: boolean;
  eventId: string;
  player1Id: string;
  player2Id: string;
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMatchData) => {
      const response = await fetch(`/api/matches/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          round: data.round,
          player1Score: data.player1Score,
          player2Score: data.player2Score,
          draw: data.draw,
          eventId: data.eventId,
          player1Id: data.player1Id,
          player2Id: data.player2Id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update match');
      }

      return response.json();
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.matches() }),
        queryClient.invalidateQueries({ queryKey: keys.matches({ eventId: variables.eventId }) })
      ]);
    }
  });
}
