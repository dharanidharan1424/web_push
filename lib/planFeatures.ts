export const planFeatures = {
    FREE: {
        canCreateSegments: false,
        canScheduleCampaigns: false,
        canViewDeviceBreakdown: false,
        canExportCSV: false,
        canAccessTeamTab: false,
        maxWebsites: 1,
        maxSubscribers: 2000,
    },
    PRO: {
        canCreateSegments: true,
        canScheduleCampaigns: true,
        canViewDeviceBreakdown: true,
        canExportCSV: true,
        canAccessTeamTab: false,
        maxWebsites: 5,
        maxSubscribers: 25000,
    },
    AGENCY: {
        canCreateSegments: true,
        canScheduleCampaigns: true,
        canViewDeviceBreakdown: true,
        canExportCSV: true,
        canAccessTeamTab: true,
        maxWebsites: Infinity,
        maxSubscribers: Infinity,
    },
} as const;

export type Plan = keyof typeof planFeatures;

export function canAccessFeature(plan: Plan, feature: keyof typeof planFeatures[Plan]) {
    return !!planFeatures[plan][feature];
}
