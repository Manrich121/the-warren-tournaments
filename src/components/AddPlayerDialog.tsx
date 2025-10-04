'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Loader2Icon } from 'lucide-react';
import { useAddPlayer } from '@/hooks/useAddPlayer';
import { useUpdatePlayer } from '@/hooks/useUpdatePlayer';
import { Player } from '@prisma/client';

interface AddPlayerDialogProps {
  player?: Player;
  children?: React.ReactNode;
}

export function AddPlayerDialog({ player, children }: AddPlayerDialogProps) {
  const [open, setOpen] = useState(false);
  const addPlayerMutation = useAddPlayer();
  const updatePlayerMutation = useUpdatePlayer();

  const [newPlayerName, setNewPlayerName] = useState('');

  const isEditMode = !!player;

  useEffect(() => {
    if (player) {
      setNewPlayerName(player.name);
    } else {
      setNewPlayerName('');
    }
  }, [player]);

  const handleSubmit = async () => {
    if (!newPlayerName) return;

    if (isEditMode && player) {
      updatePlayerMutation.mutate(
        {
          id: player.id,
          name: newPlayerName
        },
        {
          onSuccess: () => {
            setOpen(false);
          }
        }
      );
    } else {
      addPlayerMutation.mutate(
        { name: newPlayerName },
        {
          onSuccess: () => {
            setNewPlayerName('');
            setOpen(false);
          }
        }
      );
    }
  };

  const currentMutation = isEditMode ? updatePlayerMutation : addPlayerMutation;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>Add New Player</Button>
        </DialogTrigger>
      )}
      <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Player' : 'Add New Player'}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {isEditMode ? 'Update the player information below.' : 'Enter the full name the new player.'}
          </DialogDescription>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="playerName">Full Name</Label>
              <Input
                id="playerName"
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'outline'} type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={currentMutation.isPending}>
              {currentMutation.isPending && <Loader2Icon className="animate-spin" />}
              {isEditMode ? 'Update Player' : 'Add Player'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
