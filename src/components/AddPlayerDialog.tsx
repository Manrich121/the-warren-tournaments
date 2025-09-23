'use client';

import { useState } from 'react';
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

export function AddPlayerDialog() {
  const [open, setOpen] = useState(false);
  const addPlayerMutation = useAddPlayer();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');

  const handleAddPlayer = async () => {
    if (!newPlayerName || !newPlayerEmail) return;

    addPlayerMutation.mutate(
      { fullName: newPlayerName, wizardsEmail: newPlayerEmail },
      {
        onSuccess: () => {
          setNewPlayerName('');
          setNewPlayerEmail('');
          setOpen(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Player</Button>
      </DialogTrigger>
      <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAddPlayer();
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
          </DialogHeader>
          <DialogDescription>Enter the full name and Wizards Account email of the new player.</DialogDescription>
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
            <div className="space-y-2">
              <Label htmlFor="playerEmail">Email</Label>
              <Input
                id="playerEmail"
                type="email"
                value={newPlayerEmail}
                onChange={e => setNewPlayerEmail(e.target.value)}
                placeholder="john.doe@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'outline'} type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={addPlayerMutation.isPending}>
              {addPlayerMutation.isPending && <Loader2Icon className="animate-spin" />}
              Add Player
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
