import { useMutation, useQueryClient } from '@tanstack/react-query';
import { keys } from '@/hooks/keys';

interface UpdatePlayerData {
  id: string;
  name: string;
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePlayerData) => {
      const response = await fetch(`/api/players/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update player');
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.players() });
    }
  });
}
