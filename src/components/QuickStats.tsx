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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
              <Skeleton className="h-3 sm:h-4 w-3 sm:w-4 rounded-full" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mb-2" />
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <Link href="/leagues">
        <Card className="hover:shadow-md transition-shadow hover:bg-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Leagues</CardTitle>
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalLeagues}</div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/events">
        <Card className="hover:shadow-md transition-shadow hover:bg-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Events</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.eventsCount}</div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/players">
        <Card className="hover:shadow-md transition-shadow hover:bg-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Players</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.playersCount}</div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/matches">
        <Card className="hover:shadow-md transition-shadow hover:bg-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Matches</CardTitle>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.matchesCount}</div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
