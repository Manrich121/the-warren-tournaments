'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Loader2Icon } from 'lucide-react';
import { useAddEvent } from '@/hooks/useAddEvent';
import { useUpdateEvent } from '@/hooks/useUpdateEvent';
import { League, Event } from '@prisma/client';

export interface AddEventDialogProps {
  leagues?: League[] | undefined;
  selectedLeagueId?: string;
  event?: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEventDialog({ leagues, event, selectedLeagueId, open, onOpenChange }: AddEventDialogProps) {
  const addEventMutation = useAddEvent();
  const updateEventMutation = useUpdateEvent();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [leagueId, setLeagueId] = useState('');

  const isEditMode = !!event;

  useEffect(() => {
    if (isEditMode) {
      setName(event.name);
      setDate(new Date(event.date).toISOString().split('T')[0]);
      setLeagueId(event.leagueId);
    } else {
      setName('');
      setDate('');
      setLeagueId(selectedLeagueId || '');
    }
  }, [event, isEditMode, open, selectedLeagueId]);

  const handleSubmit = () => {
    if (!name || !date || !leagueId) return;

    if (isEditMode) {
      if (!event.id) return;
      updateEventMutation.mutate(
        {
          id: event.id,
          name,
          date: new Date(date),
          leagueId
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          }
        }
      );
    } else {
      addEventMutation.mutate(
        {
          name,
          date: new Date(date),
          leagueId
        },
        {
          onSuccess: () => {
            setName('');
            setDate('');
            setLeagueId('');
            onOpenChange(false);
          }
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the event details.'
                : 'Enter the name, date, and select the league for the new event.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="eventName">Name</Label>
            <Input id="eventName" value={name} onChange={e => setName(e.target.value)} placeholder="Event Name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Date</Label>
              <Input id="eventDate" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventLeague">League</Label>
              <Select value={leagueId} onValueChange={setLeagueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select League" />
                </SelectTrigger>
                <SelectContent>
                  {leagues?.map(league => (
                    <SelectItem key={league.id} value={league.id}>
                      {league.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'outline'} type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={addEventMutation.isPending || updateEventMutation.isPending}>
              {(addEventMutation.isPending || updateEventMutation.isPending) && (
                <Loader2Icon className="animate-spin" />
              )}
              {isEditMode ? 'Update Event' : 'Add Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
