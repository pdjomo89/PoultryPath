import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.daily('clean up expired admin sessions', { hourUTC: 3, minuteUTC: 0 }, internal.admin.cleanup, {});

export default crons;
