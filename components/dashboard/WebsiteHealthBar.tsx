import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip'; // placeholder tooltip component

interface WebsiteHealthBarProps {
    scriptInstalled: boolean;
    permissionEnabled: boolean;
    lastSubscriberAt?: Date | null;
    lastCampaignAt?: Date | null;
}

export default function WebsiteHealthBar({
    scriptInstalled,
    permissionEnabled,
    lastSubscriberAt,
    lastCampaignAt,
}: WebsiteHealthBarProps) {
    const statusItems = [
        {
            label: 'Script',
            status: scriptInstalled ? '✅ Installed' : '❌ Missing',
        },
        {
            label: 'Permission',
            status: permissionEnabled ? '✅ Enabled' : '❌ Disabled',
        },
        {
            label: 'Last Subscriber',
            status: lastSubscriberAt ? new Date(lastSubscriberAt).toLocaleDateString() : '—',
        },
        {
            label: 'Last Campaign',
            status: lastCampaignAt ? new Date(lastCampaignAt).toLocaleDateString() : '—',
        },
    ];

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
                {statusItems.map((item) => (
                    <div key={item.label} className="flex flex-col items-center">
                        <span className="font-medium mb-1">{item.label}</span>
                        <span>{item.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
