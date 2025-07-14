
import { format, differenceInDays, differenceInHours, parseISO } from 'date-fns';

export const formatDateShort = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

export const formatDateTimeFull = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid date';
  }
};

export const calculateDaysInStage = (stageEnteredDate: string): number => {
  try {
    const enteredDate = parseISO(stageEnteredDate);
    const now = new Date();
    return Math.max(0, differenceInDays(now, enteredDate));
  } catch (error) {
    console.error('Error calculating days in stage:', error);
    return 0;
  }
};

export const calculateDaysAndHours = (stageEnteredDate: string): { days: number; hours: number } => {
  try {
    const enteredDate = parseISO(stageEnteredDate);
    const now = new Date();
    const totalHours = Math.max(0, differenceInHours(now, enteredDate));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return { days, hours };
  } catch (error) {
    console.error('Error calculating days and hours:', error);
    return { days: 0, hours: 0 };
  }
};

export const calculateTotalTimeLimitHours = (days: number, hours: number): number => {
  return days * 24 + hours;
};

export const isOverTimeLimit = (stageEnteredDate: string, timeLimitDays: number, timeLimitHours: number): boolean => {
  try {
    const enteredDate = parseISO(stageEnteredDate);
    const now = new Date();
    const hoursInStage = differenceInHours(now, enteredDate);
    const timeLimitTotalHours = calculateTotalTimeLimitHours(timeLimitDays, timeLimitHours);
    return hoursInStage > timeLimitTotalHours;
  } catch (error) {
    console.error('Error checking time limit:', error);
    return false;
  }
};

export const getTimeExceededHours = (stageEnteredDate: string, timeLimitDays: number, timeLimitHours: number): number => {
  try {
    const enteredDate = parseISO(stageEnteredDate);
    const now = new Date();
    const hoursInStage = differenceInHours(now, enteredDate);
    const timeLimitTotalHours = calculateTotalTimeLimitHours(timeLimitDays, timeLimitHours);
    return Math.max(0, hoursInStage - timeLimitTotalHours);
  } catch (error) {
    console.error('Error calculating time exceeded:', error);
    return 0;
  }
};
