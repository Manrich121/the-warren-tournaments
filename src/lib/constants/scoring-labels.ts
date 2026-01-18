// src/lib/constants/scoring-labels.ts

import { PointMetricType, TieBreakerType } from "@prisma/client";

export const POINT_METRIC_LABELS: Record<PointMetricType, string> = {
  EVENT_ATTENDANCE: "Event Attendance",
  MATCH_WINS: "Match Wins",
  GAME_WINS: "Game Wins",
  FIRST_PLACE: "1st in Event",
  SECOND_PLACE: "2nd in Event",
  THIRD_PLACE: "3rd in Event",
};

export const TIE_BREAKER_LABELS: Record<TieBreakerType, string> = {
  LEAGUE_POINTS: "League Points",
  MATCH_POINTS: "Match Points",
  OPP_MATCH_WIN_PCT: "Opp Match Win %",
  GAME_WIN_PCT: "Game Win %",
  OPP_GAME_WIN_PCT: "Opp Game Win %",
  EVENT_ATTENDANCE_TIE: "Event Attendance",
  MATCH_WINS_TIE: "Match Wins",
};

export const POINT_METRIC_OPTIONS = Object.entries(POINT_METRIC_LABELS).map(
  ([value, label]) => ({ value: value as PointMetricType, label })
);

export const TIE_BREAKER_OPTIONS = Object.entries(TIE_BREAKER_LABELS).map(
  ([value, label]) => ({ value: value as TieBreakerType, label })
);
