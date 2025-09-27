'use client';

import { useState } from 'react';
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
  DialogTrigger,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Loader2Icon } from 'lucide-react';
import { useAddEvent } from '@/hooks/useAddEvent';
import { League, Event } from '@prisma/client';

export interface AddEventDialogProps {
  leagues?: League[] | undefined;
  selectedLeagueId?: string;
  event?: Event;
  children?: React.ReactNode;
}

export function AddEventDialog({ leagues, event, selectedLeagueId, children }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const addEventMutation = useAddEvent();

  const [newEventName, setNewEventName] = useState(event?.name || '');
  // Set initial value to event?.date YYYY-MM-DD format if event?.date exists
  const [newEventDate, setNewEventDate] = useState(event?.date ? new Date(event.date).toISOString().split('T')[0] : '');
  const [newEventLeagueId, setNewEventLeagueId] = useState(selectedLeagueId || event?.leagueId || '');

  const handleAddEvent = () => {
    if (!newEventName || !newEventDate || !newEventLeagueId) return;
    addEventMutation.mutate(
      {
        name: newEventName,
        date: new Date(newEventDate),
        leagueId: newEventLeagueId
      },
      {
        onSuccess: () => {
          setNewEventName('');
          setNewEventDate('');
          setNewEventLeagueId('');
          setOpen(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className={'cursor-pointer'}>Add New Event</Button>
        </DialogTrigger>
      )}
      <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAddEvent();
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <DialogDescription>Enter the name, date, and select the league for the new event.</DialogDescription>
          <div className="space-y-2">
            <Label htmlFor="eventName">Name</Label>
            <Input
              id="eventName"
              value={newEventName}
              onChange={e => setNewEventName(e.target.value)}
              placeholder="Event Name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={newEventDate}
                onChange={e => {
                  setNewEventDate(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventLeague">League</Label>
              <Select value={newEventLeagueId} onValueChange={setNewEventLeagueId}>
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
            <Button type="submit" disabled={addEventMutation.isPending}>
              {addEventMutation.isPending && <Loader2Icon className="animate-spin" />}
              Add Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
