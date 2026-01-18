
export interface Task {
  id: string;
  label: string;
  description?: string;
}

export interface DailyPlan {
  date: string;
  dayNumber: number; // D1, D2, etc.
  tasks: Task[];
  outputRequired: string;
}

export interface WeekPlan {
  week: number;
  startDate: string;
  endDate: string;
  focus: string;
  dailyPlans: DailyPlan[];
}

export interface Phase {
  id: number;
  name: string;
  weeks: number[];
  goal: string;
  color: string;
}

export interface ProgressState {
  completedTasks: Record<string, boolean>; // taskId: boolean
  userOutputs: Record<string, string>; // date: content
  aiFeedback: Record<string, string>; // date: feedback
}
