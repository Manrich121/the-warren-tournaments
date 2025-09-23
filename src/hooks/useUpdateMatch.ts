import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateMatchData {
  id: number;
  round: number;
  player1Score: number;
  player2Score: number;
  draw: boolean;
  eventId: number;
  player1Id: number;
  player2Id: number;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  });
}