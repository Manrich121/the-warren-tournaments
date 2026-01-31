'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2Icon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TypeaheadDropdown, TypeaheadOption } from '@/components/TypeaheadDropdown';
import { useAddMatch } from '@/hooks/useAddMatch';
import { useUpdateMatch } from '@/hooks/useUpdateMatch';
import { useMatches } from '@/hooks/useMatches';
import { Player, Event, Match } from '@prisma/client';

// Constants
const FIRST_ROUND = 1;
const DECIMAL_RADIX = 10;

export interface AddMatchDialogProps {
  match?: Match;
  players?: Player[];
  events?: Event[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMatchDialog({ match, players, events, open, onOpenChange }: AddMatchDialogProps) {
  const addMatchMutation = useAddMatch();
  const updateMatchMutation = useUpdateMatch();

  const [newMatchPlayer1, setNewMatchPlayer1] = useState<string | null>(null);
  const [newMatchPlayer2, setNewMatchPlayer2] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [newMatchP1Score, setNewMatchP1Score] = useState('');
  const [newMatchP2Score, setNewMatchP2Score] = useState('');
  const [newMatchDraw, setNewMatchDraw] = useState(false);
  const [round, setRound] = useState<number>(FIRST_ROUND);
  const [scoreSelection, setScoreSelection] = useState('');

  const isEditMode = !!match;

  // Fetch matches for the selected event to filter players by round 1 participation
  const { data: eventMatches, isLoading: isLoadingMatches } = useMatches(
    selectedEventId ? { eventId: selectedEventId } : {}
  );

  const eventOptions = useMemo<TypeaheadOption[]>(() => {
    if (!events) return [];
    return events
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(event => ({
        label: event.name,
        value: event.id,
        data: event
      }));
  }, [events]);

  // Get unique player IDs that participated in round 1 of the selected event
  const round1PlayerIds = useMemo(() => {
    if (!eventMatches || !selectedEventId) return new Set<string>();

    const round1Matches = eventMatches.filter(m => m.round === FIRST_ROUND);
    const playerIds = new Set<string>();

    round1Matches.forEach(match => {
      playerIds.add(match.player1Id);
      playerIds.add(match.player2Id);
    });

    return playerIds;
  }, [eventMatches, selectedEventId]);

  /**
   * Helper function to filter and format player options
   * Excludes the specified player and filters by round 1 participation for rounds > 1
   */
  const getFilteredPlayerOptions = useCallback(
    (excludePlayerId: string | null): TypeaheadOption[] => {
      if (!players) return [];

      let filteredPlayers = players;

      // Filter out the other player if selected
      if (excludePlayerId) {
        filteredPlayers = filteredPlayers.filter(player => player.id !== excludePlayerId);
      }

      // For rounds > 1, only show players who participated in round 1
      if (round > FIRST_ROUND && round1PlayerIds.size > 0) {
        filteredPlayers = filteredPlayers.filter(player => round1PlayerIds.has(player.id));
      }

      return filteredPlayers.map(player => ({
        label: player.name,
        value: player.id,
        data: player
      }));
    },
    [players, round, round1PlayerIds]
  );

  const player1Options = useMemo<TypeaheadOption[]>(
    () => getFilteredPlayerOptions(newMatchPlayer2),
    [getFilteredPlayerOptions, newMatchPlayer2]
  );

  const player2Options = useMemo<TypeaheadOption[]>(
    () => getFilteredPlayerOptions(newMatchPlayer1),
    [getFilteredPlayerOptions, newMatchPlayer1]
  );

  useEffect(() => {
    const scoreToParse = scoreSelection;
    if (scoreToParse) {
      const [p1, p2] = scoreToParse.split('-').map(s => parseInt(s, DECIMAL_RADIX));
      setNewMatchP1Score(String(p1));
      setNewMatchP2Score(String(p2));
      setNewMatchDraw(p1 === p2);
    } else {
      setNewMatchP1Score('');
      setNewMatchP2Score('');
      setNewMatchDraw(false);
    }
  }, [scoreSelection]);

  // Clear player selections if they're no longer valid for the current round
  useEffect(() => {
    if (round > FIRST_ROUND && round1PlayerIds.size > 0) {
      if (newMatchPlayer1 && !round1PlayerIds.has(newMatchPlayer1)) {
        setNewMatchPlayer1(null);
      }
      if (newMatchPlayer2 && !round1PlayerIds.has(newMatchPlayer2)) {
        setNewMatchPlayer2(null);
      }
    }
  }, [round, round1PlayerIds, newMatchPlayer1, newMatchPlayer2]);

  const resetForm = useCallback(() => {
    setNewMatchPlayer1(null);
    setNewMatchPlayer2(null);
    setSelectedEventId('');
    setNewMatchP1Score('');
    setNewMatchP2Score('');
    setNewMatchDraw(false);
    setRound(FIRST_ROUND);
    setScoreSelection('');
  }, []);

  useEffect(() => {
    if (open) {
      if (isEditMode && match) {
        setNewMatchPlayer1(match.player1Id);
        setNewMatchPlayer2(match.player2Id);
        setSelectedEventId(match.eventId);
        setNewMatchP1Score(String(match.player1Score));
        setNewMatchP2Score(String(match.player2Score));
        setNewMatchDraw(match.draw);
        setRound(match.round);
        setScoreSelection(`${match.player1Score}-${match.player2Score}`);
      } else {
        resetForm();
        setSelectedEventId(events?.[0]?.id || '');
      }
    }
  }, [open, isEditMode, match, events, resetForm]);

  const handleSave = () => {
    if (!newMatchPlayer1 || !newMatchPlayer2 || !selectedEventId || !round) return;

    const mutationOptions = {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      }
    };

    const matchData = {
      eventId: selectedEventId,
      player1Id: newMatchPlayer1,
      player2Id: newMatchPlayer2,
      player1Score: parseInt(newMatchP1Score, DECIMAL_RADIX) || 0,
      player2Score: parseInt(newMatchP2Score, DECIMAL_RADIX) || 0,
      draw: newMatchDraw,
      round
    };

    if (isEditMode && match) {
      updateMatchMutation.mutate({ ...matchData, id: match.id }, mutationOptions);
    } else {
      addMatchMutation.mutate(matchData, mutationOptions);
    }
  };

  const isPending = addMatchMutation.isPending || updateMatchMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div className="space-y-2">
              <TypeaheadDropdown
                options={eventOptions}
                value={selectedEventId}
                onSelect={value => setSelectedEventId(value as string)}
                label="Event"
                placeholder="Select Event"
                searchPlaceholder="Search events..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Round</Label>
              <Input
                type="number"
                value={round}
                onChange={e => setRound(parseInt(e.target.value, DECIMAL_RADIX) || FIRST_ROUND)}
                placeholder="1"
                min="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <TypeaheadDropdown
                options={player1Options}
                value={newMatchPlayer1}
                onSelect={value => setNewMatchPlayer1(value as string)}
                label="Player 1"
                placeholder={isLoadingMatches ? "Loading players..." : "Select Player 1"}
                searchPlaceholder="Search players..."
                disabled={isLoadingMatches}
                required
              />
            </div>
            <div className="space-y-2">
              <TypeaheadDropdown
                options={player2Options}
                value={newMatchPlayer2}
                onSelect={value => setNewMatchPlayer2(value as string)}
                label="Player 2"
                placeholder={isLoadingMatches ? "Loading players..." : "Select Player 2"}
                searchPlaceholder="Search players..."
                disabled={isLoadingMatches}
                required
              />
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
