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
import { useAddLeague } from '@/hooks/useAddLeague';

export function AddLeagueDialog() {
  const [open, setOpen] = useState(false);
  const addLeagueMutation = useAddLeague();

  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueStartDate, setNewLeagueStartDate] = useState('');
  const [newLeagueEndDate, setNewLeagueEndDate] = useState('');

  const handleAddLeague = () => {
    if (!newLeagueName || !newLeagueStartDate || !newLeagueEndDate) return;
    addLeagueMutation.mutate(
      {
        name: newLeagueName,
        startDate: new Date(newLeagueStartDate).toISOString(),
        endDate: new Date(newLeagueEndDate).toISOString()
      },
      {
        onSuccess: () => {
          setNewLeagueName('');
          setNewLeagueStartDate('');
          setNewLeagueEndDate('');
          setOpen(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New League</Button>
      </DialogTrigger>
      <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAddLeague();
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Add New League</DialogTitle>
          </DialogHeader>
          <DialogDescription>Enter the name, start date, and end date for the new league.</DialogDescription>
          <div className="space-y-2">
            <Label htmlFor="leagueName">Name</Label>
            <Input
              id="leagueName"
              value={newLeagueName}
              onChange={e => setNewLeagueName(e.target.value)}
              placeholder="League Name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leagueStartDate">Start Date</Label>
              <Input
                id="leagueStartDate"
                type="date"
                value={newLeagueStartDate}
                onChange={e => setNewLeagueStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leagueEndDate">End Date</Label>
              <Input
                id="leagueEndDate"
                type="date"
                value={newLeagueEndDate}
                onChange={e => setNewLeagueEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'outline'} type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={addLeagueMutation.isPending}>
              {addLeagueMutation.isPending && <Loader2Icon className="animate-spin" />}
              Add League
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
