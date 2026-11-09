export const clientReviewIds = [0, 1, 2, 3] as const;
export type ClientReviewId = (typeof clientReviewIds)[number];

/** Accent for avatar rings — stable per review */
export const clientReviewInitials: Record<ClientReviewId, string> = {
  0: 'OT',
  1: 'JM',
  2: 'AK',
  3: 'PN',
};
