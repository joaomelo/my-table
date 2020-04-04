import { calcJobError } from '@/airtable/error';
import {
  jobRecurrences,
  createChildrenUniqueDistinctTitles,
  hasRecurringAscendency
} from './utils';

export { createJobRecurrenceCommand, calcJobRecurrence };

function createJobRecurrenceCommand (job, snapshot) {
  let command;

  if (!calcJobError(job, snapshot)) {
    const recurrence = calcJobRecurrence(job, snapshot);
    if (recurrence !== job.recurrence) {
      command = {
        type: 'update',
        table: 'jobs',
        tag: job.title,
        id: job.id,
        entries: {
          recurrence: recurrence
        }
      };
    }
  }

  return command;
}

function calcJobRecurrence (job, snapshot) {
  const { ephemeral, process, flat, copy, task } = jobRecurrences;
  let recurrence;

  if (job.frequency) {
    const titles = createChildrenUniqueDistinctTitles(job, snapshot);
    recurrence = titles.length <= 1 ? flat : process;
  } else if (hasRecurringAscendency(job, snapshot)) {
    const parent = snapshot.getParent(job);
    recurrence = calcJobRecurrence(parent, snapshot) === flat ? copy : task;
  } else {
    recurrence = ephemeral;
  }
  return recurrence;
}