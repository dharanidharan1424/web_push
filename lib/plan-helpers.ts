import { PLAN_LIMITS } from './plans'
import { Plan } from '@prisma/client'

export type ResourceType = 'websites' | 'subscribers' | 'segments' | 'campaigns'

/**
 * Check if a user can create a new resource based on their plan limits
 * @param userPlan - The user's current plan (FREE, PRO, AGENCY)
 * @param resourceType - Type of resource to check (websites, subscribers, etc.)
 * @param currentCount - Current count of the resource
 * @returns true if limit is reached, false if user can still create more
 */
export function isLimitReached(
    userPlan: Plan,
    resourceType: ResourceType,
    currentCount: number
): boolean {
    const limit = PLAN_LIMITS[userPlan][resourceType]

    // Infinity means unlimited
    if (limit === Infinity) {
        return false
    }

    return currentCount >= limit
}

/**
 * Get the limit for a specific resource type based on user plan
 * @param userPlan - The user's current plan
 * @param resourceType - Type of resource
 * @returns The limit number (or Infinity for unlimited)
 */
export function getPlanLimit(userPlan: Plan, resourceType: ResourceType): number {
    return PLAN_LIMITS[userPlan][resourceType]
}

/**
 * Check if user can perform an action and return an error message if not
 * @param userPlan - The user's current plan
 * @param resourceType - Type of resource to check
 * @param currentCount - Current count of the resource
 * @returns null if action is allowed, error message string if not
 */
export function checkPlanLimit(
    userPlan: Plan,
    resourceType: ResourceType,
    currentCount: number
): string | null {
    if (isLimitReached(userPlan, resourceType, currentCount)) {
        const limit = getPlanLimit(userPlan, resourceType)
        return `You've reached your ${userPlan} plan limit of ${limit} ${resourceType}. Please upgrade your plan to create more.`
    }
    return null
}
