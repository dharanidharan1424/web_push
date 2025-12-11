'use client';

import React from 'react';
import Button from '@/components/ui/Button';

export default function PrimaryCTA() {
    return (
        <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary" size="lg" onClick={() => window.location.href = '/dashboard/websites'}>
                ➕ Add Website
            </Button>
            <Button variant="secondary" size="lg" onClick={() => window.location.href = '/dashboard/campaigns'}>
                🔔 Send Campaign
            </Button>
            <Button variant="ghost" size="lg" onClick={() => window.location.href = '/dashboard/segments'}>
                🧩 Create Segment
            </Button>
        </div>
    );
}
