export enum Plan {
    FREE = 'FREE',
    PRO = 'PRO',
    AGENCY = 'AGENCY',
}

export const PLAN_LIMITS = {
    [Plan.FREE]: {
        websites: 1,
        subscribers: 100,
        segments: 0,
        campaigns: 2,
    },
    [Plan.PRO]: {
        websites: 1,
        subscribers: 1000,
        segments: 10,
        campaigns: 10,
    },
    [Plan.AGENCY]: {
        websites: Infinity,
        subscribers: Infinity,
        segments: Infinity,
        campaigns: Infinity,
    },
}

export const PLAN_PRICING = {
    [Plan.FREE]: 0,
    [Plan.PRO]: 900, // in cents (or paise for INR)
    [Plan.AGENCY]: 9900,
}
