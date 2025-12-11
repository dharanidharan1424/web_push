import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getDomainFromUrl } from '@/lib/utils'; // assume utility exists
import { Tooltip } from '@/components/ui/Tooltip'; // placeholder

interface WebsiteCardProps {
    id: string;
    name: string;
    url: string;
    verified: boolean;
    scriptInstalled: boolean;
    subscriberCount: number;
    lastCampaignAt?: Date | null;
    healthScore: 'Good' | 'Fair' | 'Poor';
}

export default function WebsiteCard({
    id,
    name,
    url,
    verified,
    scriptInstalled,
    subscriberCount,
    lastCampaignAt,
    healthScore,
}: WebsiteCardProps) {
    const statusBadge = verified
        ? '✅ Verified'
        : scriptInstalled
            ? '🟡 Script Installed'
            : '🔴 No Script';

    const lastSent = lastCampaignAt
        ? `${new Date(lastCampaignAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : 'Never';

    const domain = getDomainFromUrl(url);

    return (
        <Card variant="default" padding="md" className="hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center text-indigo-600 font-bold">
                    {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500 truncate">{domain}</p>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>{statusBadge}</div>
                <div>{subscriberCount} subs</div>
                <div>Last sent: {lastSent}</div>
                <div>Health: {healthScore}</div>
            </div>
            <div className="mt-4 flex space-x-2">
                <Link href={`/dashboard/websites/${id}`} className="text-indigo-600 hover:underline">
                    Manage
                </Link>
                <Link href={`/dashboard/websites/${id}/campaigns`} className="text-indigo-600 hover:underline">
                    Send Campaign
                </Link>
            </div>
        </Card>
    );
}
