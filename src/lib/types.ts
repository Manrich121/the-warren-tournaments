export interface Player {
  id: number;
  fullName: string;
  wizardsEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  leagueId: number;
  name: string;
  date: string;
  createdAt: string;
}

export interface League {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface PrizePool {
  id: number;
  leagueId: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: number;
  eventId: number;
  player1Id: number;
  player2Id: number;
  player1Score: number;
  player2Score: number;
  round: number;
  draw: boolean
  createdAt: string;
  player1?: Player;
  player2?: Player;
}
