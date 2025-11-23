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
import { useAddLeague } from '@/hooks/useAddLeague';
import { useUpdateLeague } from '@/hooks/useUpdateLeague';
import { usePrizePools } from '@/hooks/usePrizePools';
import { useUpdatePrizePool } from '@/hooks/useUpdatePrizePool';
import { League } from '@prisma/client';

interface AddLeagueDialogProps {
  league?: League;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeagueDialog({ league, open, onOpenChange }: AddLeagueDialogProps) {
  const addLeagueMutation = useAddLeague();
  const updateLeagueMutation = useUpdateLeague();
  const updatePrizePoolMutation = useUpdatePrizePool();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prizePoolAmount, setPrizePoolAmount] = useState<string>('');

  // Fetch existing prize pool when editing a league
  const { data: prizePools } = usePrizePools({ leagueId: league?.id });
  const existingPrizePool = prizePools?.[0];

  const isEditMode = !!league;

  useEffect(() => {
    if (isEditMode) {
      setName(league.name);
      setStartDate(new Date(league.startDate).toISOString().split('T')[0]);
      setEndDate(new Date(league.endDate).toISOString().split('T')[0]);
      setPrizePoolAmount(existingPrizePool?.amount?.toString() || '');
    } else {
      setName('');
      setStartDate('');
      setEndDate('');
      setPrizePoolAmount('');
    }
  }, [league, isEditMode, open, existingPrizePool]);

  const handlePrizePoolUpdate = async (leagueId: string) => {
    if (prizePoolAmount.trim()) {
      const amount = parseFloat(prizePoolAmount);
      if (!isNaN(amount) && amount >= 0) {
        try {
          await updatePrizePoolMutation.mutateAsync({ leagueId, amount });
        } catch (error) {
          console.error('Failed to update prize pool:', error);
          // You might want to show an error toast here
        }
      }
    }
  };

  const handleSubmit = () => {
    if (isEditMode) {
      if (!league.id) return;
      updateLeagueMutation.mutate(
        {
          id: league.id,
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        },
        {
          onSuccess: async () => {
            await handlePrizePoolUpdate(league.id);
            onOpenChange(false);
          }
        }
      );
    } else {
      addLeagueMutation.mutate(
        { name, startDate: new Date(startDate), endDate: new Date(endDate) },
        {
          onSuccess: async newLeague => {
            await handlePrizePoolUpdate(newLeague.id);
            setName('');
            setStartDate('');
            setEndDate('');
            setPrizePoolAmount('');
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
            <DialogTitle>{isEditMode ? 'Edit League' : 'Add New League'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the league details including the prize pool.'
                : 'Enter the league details including the prize pool.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="leagueName">Name</Label>
            <Input id="leagueName" value={name} onChange={e => setName(e.target.value)} placeholder="League Name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leagueStartDate">Start Date</Label>
              <Input id="leagueStartDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leagueEndDate">End Date</Label>
              <Input id="leagueEndDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prizePoolAmount">Prize Pool Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">R</span>
              <Input
                id="prizePoolAmount"
                type="number"
                min="0"
                step="0.01"
                value={prizePoolAmount}
                onChange={e => setPrizePoolAmount(e.target.value)}
                placeholder="Enter prize pool amount (optional)"
                className="pl-8"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'outline'} type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                addLeagueMutation.isPending || updateLeagueMutation.isPending || updatePrizePoolMutation.isPending
              }
            >
              {(addLeagueMutation.isPending || updateLeagueMutation.isPending || updatePrizePoolMutation.isPending) && (
                <Loader2Icon className="animate-spin" />
              )}
              {isEditMode ? 'Update League' : 'Add League'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
