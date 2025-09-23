'use client';

import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Player {
  id: number;
  fullName: string;
  wizardsEmail: string;
  createdAt: string;
  updatedAt: string;
}

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

interface PrizePool {
  id: number;
  leagueId: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [prizePool, setPrizePool] = useState<PrizePool | null>(null);
  const router = useRouter();

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
      const [playersRes, eventsRes, leaguesRes, prizePoolRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/events'),
        fetch('/api/leagues'),
        fetch('/api/prize-pool'),
      ]);

      if (playersRes.ok) setPlayers(await playersRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (leaguesRes.ok) setLeagues(await leaguesRes.json());
      if (prizePoolRes.ok) {
        const prizePoolData = await prizePoolRes.json();
        setPrizePool(prizePoolData.length > 0 ? prizePoolData[0] : null);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const activeLeague = leagues.find(league => {
    const now = new Date();
    return new Date(league.startDate) <= now && new Date(league.endDate) >= now;
  });

  const activeEvent = activeLeague ? events.find(event => event.leagueId === activeLeague.id) : null;

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active League</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLeague?.name || 'None'}</div>
              <Button className="mt-4" onClick={() => router.push('/admin/leagues')}>
                Manage Leagues
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEvent?.name || 'None'}</div>
              <Button className="mt-4" onClick={() => router.push('/admin/events')}>
                Manage Events
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prize Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{prizePool?.amount || 0}</div>
              <p className="text-xs text-muted-foreground">The current prize pool</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{players.length}</div>
              <Button className="mt-4" onClick={() => router.push('/admin/players')}>
                Manage Players
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}