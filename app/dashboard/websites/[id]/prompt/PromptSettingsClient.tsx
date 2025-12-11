'use client'

import { useState } from 'react'

interface PromptSettingsClientProps {
    websiteId: string
    initialSettings: {
        promptEnabled: boolean
        promptTitle: string
        promptMessage: string
        promptAllowText: string
        promptDenyText: string
        promptPosition: string
    }
}

export default function PromptSettingsClient({ websiteId, initialSettings }: PromptSettingsClientProps) {
    const [promptSettings, setPromptSettings] = useState(initialSettings)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const handleSavePromptSettings = async () => {
        setSaving(true)
        setSaveSuccess(false)
        try {
            const response = await fetch(`/api/websites/${websiteId}/update-prompt`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promptSettings),
            })
            if (response.ok) {
                setSaveSuccess(true)
                setTimeout(() => setSaveSuccess(false), 3000)
            }
        } catch (error) {
            console.error('Error saving prompt settings:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Custom Permission Prompt</h2>
                <p className="text-gray-600 mb-6">
                    Configure a custom popup that appears before the browser's native permission request. This significantly improves opt-in rates.
                </p>

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="promptEnabled"
                            checked={promptSettings.promptEnabled}
                            onChange={(e) => setPromptSettings({ ...promptSettings, promptEnabled: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="promptEnabled" className="text-sm font-medium text-gray-700">
                            Enable custom permission prompt
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Title</label>
                        <input
                            type="text"
                            value={promptSettings.promptTitle}
                            onChange={(e) => setPromptSettings({ ...promptSettings, promptTitle: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Stay Updated!"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Message</label>
                        <textarea
                            value={promptSettings.promptMessage}
                            onChange={(e) => setPromptSettings({ ...promptSettings, promptMessage: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Get notifications about our latest updates and offers"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Allow Button Text</label>
                            <input
                                type="text"
                                value={promptSettings.promptAllowText}
                                onChange={(e) => setPromptSettings({ ...promptSettings, promptAllowText: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Allow"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deny Button Text</label>
                            <input
                                type="text"
                                value={promptSettings.promptDenyText}
                                onChange={(e) => setPromptSettings({ ...promptSettings, promptDenyText: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Maybe Later"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Position</label>
                        <select
                            value={promptSettings.promptPosition}
                            onChange={(e) => setPromptSettings({ ...promptSettings, promptPosition: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="center">Center</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <button
                            onClick={handleSavePromptSettings}
                            disabled={saving}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                        {saveSuccess && (
                            <span className="text-green-600 text-sm font-medium">✓ Saved successfully!</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
                <p className="text-blue-700 text-sm">
                    Custom permission prompts can increase opt-in rates by up to 300%! Make sure your message clearly explains the value users will get from subscribing.
                </p>
            </div>
        </div>
    )
}
