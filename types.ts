
export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type Status = 'Pending' | 'InProgress' | 'Paused' | 'AwaitingPost' | 'Completed';
export type Platform = 'Instagram' | 'YouTube' | 'TikTok';
export type RecurringInterval = 'Daily' | 'Weekly' | 'Monthly' | 'None';
export type GoalType = 'Monthly' | 'Yearly' | 'Custom';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: string;
  responsible: string;
  startDate: string;
  endDate: string;
  pausedReason?: string;
  subTasks: SubTask[];
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  progress: number;
  linkedContentId?: string;
}

export interface Idea {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  executed?: boolean;
  priority?: Priority;
}

export interface GoalHistory {
  date: string;
  value: number;
  change: number;
}

export interface Goal {
  id: string;
  title: string;
  startDate: string;
  targetDate: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  category: string;
  type: GoalType;
  monthReference: string; 
  isArchived: boolean;
  history?: GoalHistory[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'Meeting' | 'Personal' | 'Work' | 'Task';
  link?: string;
  description?: string;
  isCompleted?: boolean;
}

export interface ContentScript {
  id: string;
  title: string;
  platform: Platform;
  format: string; 
  hook: string;
  sceneDirection: string;
  body: string;
  cta: string;
  references: string[];
  status: 'Draft' | 'Recording' | 'Editing' | 'AwaitingPost' | 'Published';
  date: string;
  startDate?: string;
  endDate?: string;
  recordingDate?: string; 
}

export type BreakType = 'Coffee' | 'Lunch' | 'Generic';

export interface WorkBreak {
  start: string;
  end?: string;
  type: BreakType;
}

export interface WorkLog {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  breaks: WorkBreak[];
  isActive: boolean;
  isOnBreak: boolean;
  earlyEndReason?: string;
}

export interface UserConfig {
  workStart: string;
  workEnd: string;
  dailyTargetHours: number;
  workingDays: number[]; 
  lunchDuration: number; 
  coffeeDuration: number; 
  name?: string;
  email?: string;
  avatar?: string;
}

export type UserStatus = 'Pending' | 'Active' | 'Blocked';
export type UserRole = 'Admin' | 'User';

export interface UserAccount {
  id: string;
  email: string;
  password?: string; // Em uma VPS real, seria um hash
  name: string;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
}

export type View = 'Dashboard' | 'Tasks' | 'Ideas' | 'Goals' | 'Calendar' | 'Content' | 'TimeTracker' | 'Settings' | 'AdminUsers';
