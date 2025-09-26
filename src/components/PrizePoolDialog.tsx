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
import { useUpdatePrizePool } from '@/hooks/useUpdatePrizePool';
import { PrizePool } from '@prisma/client';

interface PrizePoolDialogProps {
  leagueId: string;
  currentPrizePool?: PrizePool;
  children: React.ReactNode;
}

export function PrizePoolDialog({ leagueId, currentPrizePool, children }: PrizePoolDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const updatePrizePoolMutation = useUpdatePrizePool();

  useEffect(() => {
    if (open) {
      setAmount(currentPrizePool?.amount?.toString() || '');
    }
  }, [open, currentPrizePool]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return;
    }

    updatePrizePoolMutation.mutate(
      { leagueId, amount: numericAmount },
      {
        onSuccess: () => {
          setOpen(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Update Prize Pool</DialogTitle>
            <DialogDescription>
              Set the prize pool amount for this league.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="prizePoolAmount">Prize Pool Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                R
              </span>
              <Input 
                id="prizePoolAmount" 
                type="number" 
                min="0" 
                step="0.01" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="Enter prize pool amount" 
                className="pl-8"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updatePrizePoolMutation.isPending}>
              {updatePrizePoolMutation.isPending && (
                <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
              )}
              Update Prize Pool
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}