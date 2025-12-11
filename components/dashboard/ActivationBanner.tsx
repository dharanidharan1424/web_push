'use client';

import React from 'react';

interface ActivationBannerProps {
    websiteCount: number;
    scriptInstalled: boolean;
    subscriberCount: number;
    recentCampaign?: Date | null;
}

export default function ActivationBanner({
    websiteCount,
    scriptInstalled,
    subscriberCount,
    recentCampaign,
}: ActivationBannerProps) {
    const noRecentCampaign = !recentCampaign || (new Date().getTime() - new Date(recentCampaign).getTime()) > 24 * 60 * 60 * 1000;

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-xl mb-6 shadow-lg animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                    <p className="text-sm font-medium">{websiteCount} website{websiteCount !== 1 ? 's' : ''} active</p>
                    <p className="text-sm font-medium">{scriptInstalled ? 'Script installed' : 'Script missing'}</p>
                    <p className="text-sm font-medium">{subscriberCount} subscriber{subscriberCount !== 1 ? 's' : ''} collected</p>
                </div>
                {noRecentCampaign && (
                    <button
                        onClick={() => {
                            // Placeholder – could navigate to campaign creation
                            window.location.href = '/dashboard/campaigns';
                        }}
                        className="mt-2 md:mt-0 bg-white text-indigo-600 font-semibold px-4 py-2 rounded-md hover:bg-gray-100 transition"
                    >
                        Send Campaign Now
                    </button>
                )}
            </div>
        </div>
    );
}
