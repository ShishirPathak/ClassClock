import ICAL from 'ical.js';
import { TimetableEvent } from '../types';

export const parseICSFile = (fileContent: string): TimetableEvent[] => {
  const jcalData = ICAL.parse(fileContent);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  return vevents.map((vevent) => {
    const event = new ICAL.Event(vevent);
    return {
      summary: event.summary,
      location: event.location || 'No location specified',
      startDate: event.startDate.toJSDate(),
      endDate: event.endDate.toJSDate(),
    };
  });
};