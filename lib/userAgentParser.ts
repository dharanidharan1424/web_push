export interface ParsedUserAgent {
    deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown'
    os: string
    browser: string
    icon: string
    formatted: string
}

export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
    if (!ua) {
        return {
            deviceType: 'Unknown',
            os: 'Unknown',
            browser: 'Unknown',
            icon: '❓',
            formatted: 'Unknown Device'
        }
    }

    const userAgent = ua.toLowerCase()

    // Detect device type
    let deviceType: ParsedUserAgent['deviceType'] = 'Desktop'
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
        deviceType = 'Mobile'
    } else if (/tablet|ipad/i.test(userAgent)) {
        deviceType = 'Tablet'
    }

    // Detect OS
    let os = 'Unknown'
    let icon = '🖥'

    if (/windows/i.test(userAgent)) {
        os = 'Windows'
        icon = '🖥'
    } else if (/mac os x/i.test(userAgent)) {
        os = 'macOS'
        icon = '🍎'
    } else if (/linux/i.test(userAgent)) {
        os = 'Linux'
        icon = '🐧'
    } else if (/android/i.test(userAgent)) {
        os = 'Android'
        icon = '📱'
        // Try to get Android version
        const androidMatch = userAgent.match(/android\s([\d.]+)/)
        if (androidMatch) {
            os = `Android ${androidMatch[1]}`
        }
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        os = 'iOS'
        icon = '📱'
        // Try to get iOS version
        const iosMatch = userAgent.match(/os\s([\d_]+)/)
        if (iosMatch) {
            const version = iosMatch[1].replace(/_/g, '.')
            os = `iOS ${version}`
        }
    }

    // Detect browser
    let browser = 'Unknown'
    if (/edg/i.test(userAgent)) {
        browser = 'Edge'
    } else if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) {
        browser = 'Chrome'
    } else if (/firefox/i.test(userAgent)) {
        browser = 'Firefox'
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
        browser = 'Safari'
    } else if (/opera|opr/i.test(userAgent)) {
        browser = 'Opera'
    }

    // Format the output
    const formatted = `${os} • ${browser} • ${deviceType}`

    return {
        deviceType,
        os,
        browser,
        icon,
        formatted
    }
}

export function getDeviceIcon(deviceType: string): string {
    switch (deviceType.toLowerCase()) {
        case 'mobile':
            return '📱'
        case 'tablet':
            return '📱'
        case 'desktop':
            return '🖥'
        default:
            return '❓'
    }
}
