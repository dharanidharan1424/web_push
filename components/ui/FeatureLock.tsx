import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip'; // assume a tooltip component exists or use simple title
import { Plan, canAccessFeature } from '@/lib/planFeatures';

interface FeatureLockProps {
    plan: Plan;
    feature: keyof typeof planFeatures[Plan];
    children: React.ReactNode;
    lockMessage?: string;
}

export default function FeatureLock({ plan, feature, children, lockMessage }: FeatureLockProps) {
    const hasAccess = canAccessFeature(plan, feature);
    if (hasAccess) {
        return <>{children}</>;
    }
    const message = lockMessage || `Upgrade to unlock ${feature}`;
    return (
        <div className="relative inline-block" title={message}>
            <div className="pointer-events-none opacity-50 blur-sm" aria-disabled="true">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-gray-500 bg-white bg-opacity-75 px-1 rounded">🔒</span>
            </div>
        </div>
    );
}
