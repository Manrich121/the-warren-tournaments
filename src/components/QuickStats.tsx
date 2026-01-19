'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LeagueStats } from '@/types/LeagueStats';

interface QuickStatsProps {
  stats: LeagueStats | null;
  isLoading?: boolean;
}

export function QuickStats({ stats, isLoading = false }: QuickStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Link href="/leagues">
        <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeagues}</div>
            <p className="text-xs text-muted-foreground">{stats.activeLeagues} active</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/events">
        <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eventsCount}</div>
            <p className="text-xs text-muted-foreground">In selected league</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/players">
        <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.playersCount}</div>
            <p className="text-xs text-muted-foreground">In selected league</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/matches">
        <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.matchesCount}</div>
            <p className="text-xs text-muted-foreground">In selected league</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
