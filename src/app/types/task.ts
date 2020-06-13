export type Task = {
  name: string;
  startTime: Date;
  endTime: Date;
  progressRate: number;
  details?: string;
}
