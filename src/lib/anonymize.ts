// Utility functions for anonymizing executive data in the marketplace

/**
 * Anonymize company name to a generic category
 */
export function anonymizeCompany(company: string): string {
    const lowerCompany = company.toLowerCase();

    if (lowerCompany.includes('bank') || lowerCompany.includes('capital') || lowerCompany.includes('finance')) {
        return 'Global Fintech Bank';
    }
    if (lowerCompany.includes('tech') || lowerCompany.includes('software')) {
        return 'Enterprise Tech Company';
    }
    if (lowerCompany.includes('health') || lowerCompany.includes('pharma') || lowerCompany.includes('medical')) {
        return 'Healthcare Leader';
    }
    if (lowerCompany.includes('retail') || lowerCompany.includes('commerce')) {
        return 'Major Retailer';
    }
    if (lowerCompany.includes('media') || lowerCompany.includes('entertainment')) {
        return 'Media & Entertainment Corp';
    }
    if (lowerCompany.includes('labs') || lowerCompany.includes('startup')) {
        return 'Innovative Tech Startup';
    }

    // Default categorization based on first letter for variety
    const categories = [
        'Enterprise SaaS Company',
        'Global Technology Firm',
        'Fortune 500 Corporation',
        'Leading Industry Player',
        'Market Innovator'
    ];
    return categories[company.charCodeAt(0) % categories.length];
}

/**
 * Get title prefix from job title (e.g., "CTO" from "Chief Technology Officer")
 */
export function getTitlePrefix(title: string): string {
    const lower = title.toLowerCase();
    if (/\b(ceo|chief executive)/.test(lower)) return 'CEO';
    if (/\b(cto|chief technology)/.test(lower)) return 'CTO';
    if (/\b(cio|chief information)/.test(lower)) return 'CIO';
    if (/\b(cfo|chief financial)/.test(lower)) return 'CFO';
    if (/\b(coo|chief operating)/.test(lower)) return 'COO';
    if (/\b(svp|senior vice president)/.test(lower)) return 'SVP';
    if (/\bvp|vice president/.test(lower)) return 'VP';
    if (/\bdirector/.test(lower)) return 'Director';
    if (/\bhead of/.test(lower)) return 'Head';
    return 'Executive';
}

/**
 * Generate an anonymous identifier for an executive
 * Uses first 4 chars of ID to create consistent pseudonym
 */
export function getAnonymousId(userId: string): string {
    const hash = userId.slice(0, 4).toUpperCase();
    return `EXC-${hash}`;
}
