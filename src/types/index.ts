import type { Session, Subject, User, SessionStatusLog, SessionPauseLog } from "@prisma/client";

export type SessionWithRelations = Session & {
  subject: Subject;
  user: Pick<User, "id" | "name" | "avatarUrl">;
  statusLogs: SessionStatusLog[];
  pauseLogs: SessionPauseLog[];
};

export type SubjectWithStats = Subject & {
  _count: { sessions: number };
  totalDuration?: number;
};

export type LeaderboardEntry = {
  id: string;
  userName: string;
  userAvatar: string | null;
  subjectName: string;
  subjectColor: string;
  duration: number;
  date: Date;
};

export type DailyStats = {
  date: string;
  totalDuration: number;
  sessionsCount: number;
};

export type SubjectStats = {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  totalDuration: number;
  sessionsCount: number;
};

export type OverallStats = {
  totalDuration: number;
  totalSessions: number;
  longestSession: number;
  averageDuration: number;
  currentStreak: number;
  subjectStats: SubjectStats[];
  dailyStats: DailyStats[];
};

export type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never };