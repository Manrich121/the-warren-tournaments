'use client';

import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
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

interface Event {
  id: number;
  leagueId: number;
  name: string;
  date: string;
  createdAt: string;
}

interface League {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export default function AdminEventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const router = useRouter();

  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLeagueId, setNewEventLeagueId] = useState('');
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addEventLoading, setAddEventLoading] = useState(false);

  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [deleteEventOpen, setDeleteEventOpen] = useState(false);
  const [deleteEventLoading, setDeleteEventLoading] = useState(false);

  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [editEventName, setEditEventName] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventLeagueId, setEditEventLeagueId] = useState('');
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [editEventLoading, setEditEventLoading] = useState(false);

  const [eventSortField, setEventSortField] = useState<keyof Event>('id');
  const [eventSortDirection, setEventSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      await fetchData();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      const [eventsRes, leaguesRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/leagues')
      ]);
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (leaguesRes.ok) setLeagues(await leaguesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const addEvent = async () => {
    if (!newEventName || !newEventDate || !newEventLeagueId) return;

    setAddEventLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEventName,
          date: new Date(newEventDate).toISOString(),
          leagueId: parseInt(newEventLeagueId),
        }),
      });

      if (response.ok) {
        setNewEventName('');
        setNewEventDate('');
        setNewEventLeagueId('');
        setAddEventOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add event:', error);
    } finally {
      setAddEventLoading(false);
    }
  };

  const deleteEvent = async () => {
    if (!deleteEventId) return;

    setDeleteEventLoading(true);
    try {
      const response = await fetch(`/api/events/${deleteEventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteEventId(null);
        setDeleteEventOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setDeleteEventLoading(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditEventId(event.id);
    setEditEventName(event.name);
    setEditEventDate(new Date(event.date).toISOString().split('T')[0]);
    setEditEventLeagueId(event.leagueId.toString());
    setEditEventOpen(true);
  };

  const updateEvent = async () => {
    if (!editEventId) return;

    setEditEventLoading(true);
    try {
      const response = await fetch(`/api/events/${editEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editEventName,
          date: new Date(editEventDate).toISOString(),
          leagueId: parseInt(editEventLeagueId),
        }),
      });

      if (response.ok) {
        setEditEventOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setEditEventLoading(false);
    }
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

  const handleEventSort = (field: keyof Event) => {
    if (field === eventSortField) {
      setEventSortDirection(eventSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setEventSortField(field);
      setEventSortDirection('asc');
    }
  };

  const sortedEvents = genericSort(events, eventSortField, eventSortDirection);

  const SortableHeader = <T,>({ 
    field, 
    currentSortField, 
    currentSortDirection, 
    onSort, 
    children 
  }: { 
    field: keyof T;
    currentSortField: keyof T;
    currentSortDirection: 'asc' | 'desc';
    onSort: (field: keyof T) => void;
    children: React.ReactNode;
  }) => {
    const isActive = currentSortField === field;
    const isAsc = currentSortDirection === 'asc';
    
    return (
      <TableHead>
        <button
          onClick={() => onSort(field)}
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
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
                  addEvent();
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
                        {leagues.map(league => (
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
                  <Button type="submit" disabled={addEventLoading}>
                    {addEventLoading && <Loader2Icon className="animate-spin" />}
                    Add Event
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle>Events ({events.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader 
                      field="id" 
                      currentSortField={eventSortField} 
                      currentSortDirection={eventSortDirection} 
                      onSort={handleEventSort}
                    >
                      ID
                    </SortableHeader>
                    <SortableHeader 
                      field="name" 
                      currentSortField={eventSortField} 
                      currentSortDirection={eventSortDirection} 
                      onSort={handleEventSort}
                    >
                      Name
                    </SortableHeader>
                    <SortableHeader 
                      field="leagueId" 
                      currentSortField={eventSortField} 
                      currentSortDirection={eventSortDirection} 
                      onSort={handleEventSort}
                    >
                      League
                    </SortableHeader>
                    <SortableHeader 
                      field="date" 
                      currentSortField={eventSortField} 
                      currentSortDirection={eventSortDirection} 
                      onSort={handleEventSort}
                    >
                      Date
                    </SortableHeader>
                    <SortableHeader 
                      field="createdAt" 
                      currentSortField={eventSortField} 
                      currentSortDirection={eventSortDirection} 
                      onSort={handleEventSort}
                    >
                      Created
                    </SortableHeader>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEvents.map(event => {
                    const league = leagues.find(l => l.id === event.leagueId);
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
                  updateEvent();
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
                        {leagues.map(league => (
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
                  <Button type="submit" disabled={editEventLoading}>
                    {editEventLoading && <Loader2Icon className="animate-spin" />}
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
                <Button variant="destructive" onClick={deleteEvent} disabled={deleteEventLoading}>
                  {deleteEventLoading && <Loader2Icon className="animate-spin" />}
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
