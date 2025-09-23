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
import { League } from '@prisma/client';

interface AddLeagueDialogProps {
  league?: League;
  children: React.ReactNode;
}

export function AddLeagueDialog({ league, children }: AddLeagueDialogProps) {
  const [open, setOpen] = useState(false);
  const addLeagueMutation = useAddLeague();
  const updateLeagueMutation = useUpdateLeague();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isEditMode = !!league;

  useEffect(() => {
    if (isEditMode) {
      setName(league.name);
      setStartDate(new Date(league.startDate).toISOString().split('T')[0]);
      setEndDate(new Date(league.endDate).toISOString().split('T')[0]);
    } else {
      setName('');
      setStartDate('');
      setEndDate('');
    }
  }, [league, isEditMode, open]);

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
        { onSuccess: () => setOpen(false) }
      );
    } else {
      addLeagueMutation.mutate(
        { name, startDate: new Date(startDate), endDate: new Date(endDate) },
        {
          onSuccess: () => {
            setName('');
            setStartDate('');
            setEndDate('');
            setOpen(false);
          }
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
                ? 'Update the name, start date, and end date for the league.'
                : 'Enter the name, start date, and end date for the new league.'}
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
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'outline'} type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={addLeagueMutation.isPending || updateLeagueMutation.isPending}>
              {(addLeagueMutation.isPending || updateLeagueMutation.isPending) && (
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
