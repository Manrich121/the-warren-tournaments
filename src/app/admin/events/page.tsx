'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2Icon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
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
import { useEvents } from '@/hooks/useEvents';
import { useLeagues } from '@/hooks/useLeagues';
import { useAddEvent } from '@/hooks/useAddEvent';
import { useDeleteEvent } from '@/hooks/useDeleteEvent';
import { useUpdateEvent } from '@/hooks/useUpdateEvent';
import { Event, League } from '@/lib/types';

export default function AdminEventsPage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/admin/login');
    }
  });

  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: leagues, isLoading: leaguesLoading, error: leaguesError } = useLeagues();
  const addEventMutation = useAddEvent();
  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();

  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLeagueId, setNewEventLeagueId] = useState('');
  const [addEventOpen, setAddEventOpen] = useState(false);

  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [deleteEventOpen, setDeleteEventOpen] = useState(false);

  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [editEventName, setEditEventName] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventLeagueId, setEditEventLeagueId] = useState('');
  const [editEventOpen, setEditEventOpen] = useState(false);

  const [sortField, setSortField] = useState<keyof Event>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isLoading = eventsLoading || leaguesLoading || status === 'loading';
  const error = eventsError || leaguesError;

  const handleAddEvent = () => {
    if (!newEventName || !newEventDate || !newEventLeagueId) return;
    addEventMutation.mutate(
      {
        name: newEventName,
        date: new Date(newEventDate).toISOString(),
        leagueId: parseInt(newEventLeagueId),
      },
      {
        onSuccess: () => {
          setNewEventName('');
          setNewEventDate('');
          setNewEventLeagueId('');
          setAddEventOpen(false);
        }
      }
    );
  };

  const handleDeleteEvent = () => {
    if (!deleteEventId) return;
    deleteEventMutation.mutate(deleteEventId, {
      onSuccess: () => {
        setDeleteEventId(null);
        setDeleteEventOpen(false);
      }
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditEventId(event.id);
    setEditEventName(event.name);
    setEditEventDate(new Date(event.date).toISOString().split('T')[0]);
    setEditEventLeagueId(event.leagueId.toString());
    setEditEventOpen(true);
  };

  const handleUpdateEvent = () => {
    if (!editEventId) return;
    updateEventMutation.mutate(
      {
        id: editEventId,
        name: editEventName,
        date: new Date(editEventDate).toISOString(),
        leagueId: parseInt(editEventLeagueId),
      },
      {
        onSuccess: () => {
          setEditEventOpen(false);
        }
      }
    );
  };

  const genericSort = <T,>(array: T[], field: keyof T, direction: 'asc' | 'desc') => {
    return [...array].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      let comparison = 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        const dateA = new Date(aValue as string);
        const dateB = new Date(bValue as string);
        comparison = dateA.getTime() - dateB.getTime();
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  const handleSort = (field: keyof Event) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEvents = events ? genericSort(events, sortField, sortDirection) : [];

  const SortableHeader = ({ 
    field, 
    children 
  }: { 
    field: keyof Event;
    children: React.ReactNode;
  }) => {
    const isActive = sortField === field;
    const isAsc = sortDirection === 'asc';
    
    return (
      <TableHead>
        <button
          onClick={() => handleSort(field)}
          className="flex items-center space-x-1 hover:text-foreground font-medium"
        >
          <span>{children}</span>
          {isActive ? (
            isAsc ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </button>
      </TableHead>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 space-y-6">
        <div className="space-y-6">
          <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
            <DialogTrigger asChild>
              <Button>Add New Event</Button>
            </DialogTrigger>
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
                <DialogDescription>
                  Enter the name, date, and select the league for the new event.
                </DialogDescription>
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
                      onChange={e => setNewEventDate(e.target.value)}
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
                          <SelectItem key={league.id} value={league.id.toString()}>
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

          <Card>
            <CardHeader>
              <CardTitle>Events ({events?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="id">ID</SortableHeader>
                    <SortableHeader field="name">Name</SortableHeader>
                    <SortableHeader field="leagueId">League</SortableHeader>
                    <SortableHeader field="date">Date</SortableHeader>
                    <SortableHeader field="createdAt">Created</SortableHeader>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEvents.map(event => {
                    const league = leagues?.find(l => l.id === event.leagueId);
                    return (
                      <TableRow key={event.id}>
                        <TableCell>{event.id}</TableCell>
                        <TableCell>{event.name}</TableCell>
                        <TableCell>{league?.name || `League #${event.leagueId}`}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(event.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditEvent(event)}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteEventId(event.id);
                              setDeleteEventOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={editEventOpen} onOpenChange={setEditEventOpen}>
            <DialogContent>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleUpdateEvent();
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>Edit Event</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Update the name, date, and league for the event.
                </DialogDescription>
                <div className="space-y-2">
                  <Label htmlFor="editEventName">Name</Label>
                  <Input
                    id="editEventName"
                    value={editEventName}
                    onChange={e => setEditEventName(e.target.value)}
                    placeholder="Event Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editEventDate">Date</Label>
                    <Input
                      id="editEventDate"
                      type="date"
                      value={editEventDate}
                      onChange={e => setEditEventDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editEventLeague">League</Label>
                    <Select value={editEventLeagueId} onValueChange={setEditEventLeagueId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select League" />
                      </SelectTrigger>
                      <SelectContent>
                        {leagues?.map(league => (
                          <SelectItem key={league.id} value={league.id.toString()}>
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
                  <Button type="submit" disabled={updateEventMutation.isPending}>
                    {updateEventMutation.isPending && <Loader2Icon className="animate-spin" />}
                    Update Event
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteEventOpen} onOpenChange={setDeleteEventOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this event?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the event and all associated matches.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteEventOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteEvent} disabled={deleteEventMutation.isPending}>
                  {deleteEventMutation.isPending && <Loader2Icon className="animate-spin" />}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}