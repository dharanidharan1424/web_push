import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { Plan, canAccessFeature, planFeatures } from '@/lib/planFeatures';

interface FeatureLockProps {
    plan: Plan;
    feature: keyof typeof planFeatures['FREE'];
    children: React.ReactNode;
    lockMessage?: string;
}

export default function FeatureLock({ plan, feature, children, lockMessage }: FeatureLockProps) {
    const hasAccess = canAccessFeature(plan, feature);

    if (hasAccess) {
        return <>{children}</>;
    }

    const featureName = String(feature).replace(/can|View|Access/g, ' ').trim();
    const message = lockMessage || `Upgrade to use ${featureName}`;

    return (
        <Tooltip content={message} position="top">
            <div className="relative inline-block cursor-not-allowed">
                <div className="pointer-events-none opacity-50 blur-sm grayscale" aria-disabled="true">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                </div>
            </div>
        </Tooltip>
    );
}
