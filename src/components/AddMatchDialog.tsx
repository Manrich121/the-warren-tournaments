'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Loader2Icon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAddMatch } from '@/hooks/useAddMatch';
import { useUpdateMatch } from '@/hooks/useUpdateMatch';
import { Player, Event, Match } from '@prisma/client';

export interface AddMatchDialogProps {
  match?: Match;
  players?: Player[];
  events?: Event[];
  children?: React.ReactNode;
}

export function AddMatchDialog({ match, players, events, children }: AddMatchDialogProps) {
  const [open, setOpen] = useState(false);
  const addMatchMutation = useAddMatch();
  const updateMatchMutation = useUpdateMatch();

  const [newMatchPlayer1, setNewMatchPlayer1] = useState('');
  const [newMatchPlayer2, setNewMatchPlayer2] = useState('');
  const [newMatchEvent, setNewMatchEvent] = useState('');
  const [newMatchP1Score, setNewMatchP1Score] = useState('');
  const [newMatchP2Score, setNewMatchP2Score] = useState('');
  const [newMatchDraw, setNewMatchDraw] = useState(false);
  const [round, setRound] = useState('');
  const [scoreSelection, setScoreSelection] = useState('');

  const isEditMode = !!match;

  const player1Options = useMemo(() => {
    if (!players) return [];
    if (!newMatchPlayer2) return players;
    return players.filter(player => player.id !== newMatchPlayer2);
  }, [players, newMatchPlayer2]);

  const player2Options = useMemo(() => {
    if (!players) return [];
    if (!newMatchPlayer1) return players;
    return players.filter(player => player.id !== newMatchPlayer1);
  }, [players, newMatchPlayer1]);

  useEffect(() => {
    let scoreToParse = scoreSelection;
    if (scoreToParse) {
      const [p1, p2] = scoreToParse.split('-').map(s => parseInt(s, 10));
      setNewMatchP1Score(String(p1));
      setNewMatchP2Score(String(p2));
      setNewMatchDraw(p1 === p2);
    } else {
      setNewMatchP1Score('');
      setNewMatchP2Score('');
      setNewMatchDraw(false);
    }
  }, [scoreSelection]);

  const resetForm = useCallback(() => {
    setNewMatchPlayer1('');
    setNewMatchPlayer2('');
    setNewMatchEvent('');
    setNewMatchP1Score('');
    setNewMatchP2Score('');
    setNewMatchDraw(false);
    setRound('');
    setScoreSelection('');
  }, []);

  useEffect(() => {
    if (open) {
      if (isEditMode && match) {
        setNewMatchPlayer1(match.player1Id);
        setNewMatchPlayer2(match.player2Id);
        setNewMatchEvent(match.eventId);
        setNewMatchP1Score(String(match.player1Score));
        setNewMatchP2Score(String(match.player2Score));
        setNewMatchDraw(match.draw);
        setRound(String(match.round));
        setScoreSelection(`${match.player1Score}-${match.player2Score}`);
      } else {
        resetForm();
        setNewMatchEvent(events?.[0]?.id || '');
      }
    }
  }, [open, isEditMode, match, events, resetForm]);

  const handleSave = () => {
    if (!newMatchPlayer1 || !newMatchPlayer2 || !newMatchEvent || !round) return;

    const mutationOptions = {
      onSuccess: () => {
        resetForm();
        setOpen(false);
      }
    };

    const matchData = {
      eventId: newMatchEvent,
      player1Id: newMatchPlayer1,
      player2Id: newMatchPlayer2,
      player1Score: parseInt(newMatchP1Score) || 0,
      player2Score: parseInt(newMatchP2Score) || 0,
      draw: newMatchDraw,
      round: parseInt(round)
    };

    if (isEditMode && match) {
      updateMatchMutation.mutate({ ...matchData, id: match.id }, mutationOptions);
    } else {
      addMatchMutation.mutate(matchData, mutationOptions);
    }
  };

  const isPending = addMatchMutation.isPending || updateMatchMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children ? children : <Button>Add New Match</Button>}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[625px]"
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Match' : 'Add New Match'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4 py-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event</Label>
              <Select value={newMatchEvent} onValueChange={setNewMatchEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>
                <SelectContent>
                  {events?.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Round</Label>
              <Input type="number" value={round} onChange={e => setRound(e.target.value)} placeholder="1" min="1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Player 1</Label>
              <Select value={newMatchPlayer1} onValueChange={setNewMatchPlayer1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Player 1" />
                </SelectTrigger>
                <SelectContent>
                  {player1Options.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Player 2</Label>
              <Select value={newMatchPlayer2} onValueChange={setNewMatchPlayer2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Player 2" />
                </SelectTrigger>
                <SelectContent>
                  {player2Options.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Label>Score</Label>
            <ToggleGroup
              type="single"
              value={scoreSelection}
              onValueChange={value => {
                if (value) {
                  setScoreSelection(value);
                } else {
                  setScoreSelection('');
                }
              }}
              className="flex-wrap"
            >
              <ToggleGroupItem value="2-0">2-0</ToggleGroupItem>
              <ToggleGroupItem value="2-1">2-1</ToggleGroupItem>
              <ToggleGroupItem value="1-0">1-0</ToggleGroupItem>
              <ToggleGroupItem variant={'outline'} value="1-1">
                1-1
              </ToggleGroupItem>
              <ToggleGroupItem variant={'outline'} value="0-0">
                0-0
              </ToggleGroupItem>
              <ToggleGroupItem value="0-1">0-1</ToggleGroupItem>
              <ToggleGroupItem value="1-2">1-2</ToggleGroupItem>
              <ToggleGroupItem value="0-2">0-2</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'outline'} type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon className="animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Add Match'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
