import {
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isSameMonth, addMonths, addWeeks,
} from 'date-fns';
import { ru } from 'date-fns/locale';

export const toApiDate = (date) => format(date, 'yyyy-MM-dd');
export const todayApi = () => toApiDate(new Date());

export const weekRange = (date = new Date()) => ({
  from: toApiDate(startOfWeek(date, { weekStartsOn: 1 })),
  to: toApiDate(endOfWeek(date, { weekStartsOn: 1 })),
});

export const weekRangeLabel = (date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });

  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${format(start, 'd', { locale: ru })}-${format(end, 'd MMM', { locale: ru})}`;
  }
  return `${format(start, 'd MMM', { locale: ru})} - ${format(end, 'd MMM', { locale: ru })}`;
};

export const monthGridRange = (date = new Date()) => ({
  from: toApiDate(startOfWeek(startOfMonth(date), { weekStartsOn: 1 })),
  to: toApiDate(endOfWeek(endOfMonth(date), { weekStartsOn: 1 })),
});

export const monthGridDays = (date = new Date()) =>
  eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });

export const weekDays = (date = new Date()) =>
  eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  });

export const monthTitle = (date) => format(date, 'LLLL yyyy', { locale: ru });
export const weekdayShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export { isSameDay, isSameMonth, addMonths, addWeeks, format };