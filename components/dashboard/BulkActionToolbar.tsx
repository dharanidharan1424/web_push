import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface BulkActionToolbarProps {
    selectedIds: string[];
    onSendCampaign: () => void;
    onExport: () => void;
}

export default function BulkActionToolbar({
    selectedIds,
    onSendCampaign,
    onExport,
}: BulkActionToolbarProps) {
    if (selectedIds.length === 0) return null;
    return (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-4 shadow-sm">
            <div className="text-sm text-gray-600">
                {selectedIds.length} website{selectedIds.length > 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={onSendCampaign}>
                    📤 Send Campaign
                </Button>
                <Button variant="secondary" size="sm" onClick={onExport}>
                    📥 Export CSV
                </Button>
            </div>
        </div>
    );
}
