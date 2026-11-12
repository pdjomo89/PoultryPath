import { query } from './_generated/server';

export interface PublicJob {
  id: string;
  title: string;
  farm: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  experience: 'No experience' | 'Entry level' | 'Experienced';
  trainingProvided: boolean;
  animals: ('Poultry' | 'Pigs' | 'Goats' | 'Rabbits' | 'Sheep' | 'Cattle' | 'Fish' | 'Bees')[];
  description: string;
  requirements: string[];
  postedAt: string;
}

/** Approved employer job posts for the public jobs board. Employer contact details are withheld. */
export const listApproved = query({
  args: {},
  handler: async (ctx): Promise<PublicJob[]> => {
    const rows = await ctx.db
      .query('submissions')
      .withIndex('by_type_status', (q) => q.eq('type', 'job').eq('status', 'approved'))
      .order('desc')
      .take(200);
    return rows.map(({ _id, data, submittedAt }) => ({
      id: `job-${_id}`,
      title: data.title,
      farm: data.farm,
      location: data.location,
      type: data.type,
      experience: data.experience,
      trainingProvided: !!data.trainingProvided,
      animals: data.animals ?? [],
      description: data.description,
      requirements: data.requirements ?? [],
      postedAt: new Date(submittedAt).toISOString().slice(0, 10),
    }));
  },
});
