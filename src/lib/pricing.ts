/**
 * Pricing Valuation Engine
 * Determines the fair market value of an Executive's time based on:
 * 1. Role Seniority (Base)
 * 2. Intent / Buying Stage (Multiplier)
 * 3. Company Tier (Multiplier - Simulated)
 */

export type BuyingStage = 'learning' | 'budgeting' | 'rfp';

const BASE_RATES: Record<string, number> = {
    'CXO': 500,
    'VP': 300,
    'DIRECTOR': 150,
    'MANAGER': 100
};

const STAGE_MULTIPLIERS: Record<BuyingStage, number> = {
    'learning': 1.0,   // Browsing
    'budgeting': 1.5,  // Defining specific needs
    'rfp': 2.5         // Active Selection (High Value)
};

export const calculateRecommendedPrice = (
    roleTitle: string,
    stage: BuyingStage,
    company: string
): { price: number; reason: string } => {

    // 1. Determine Base Rate from Job Title
    let base = BASE_RATES['MANAGER'];
    const title = roleTitle.toUpperCase();

    if (title.includes('CHIEF') || title.includes('CTO') || title.includes('CISO') || title.includes('FOUNDER')) {
        base = BASE_RATES['CXO'];
    } else if (title.includes('VP') || title.includes('HEAD') || title.includes('OBSERVER')) {
        base = BASE_RATES['VP'];
    } else if (title.includes('DIRECTOR')) {
        base = BASE_RATES['DIRECTOR'];
    }

    // 2. Apply Intent Multiplier
    const multiplier = STAGE_MULTIPLIERS[stage] || 1.0;

    // 3. Apply Company Tier (Simulated: Fortune 500 pays more)
    let tierMultiplier = 1.0;
    const highValueCorps = ['fortune', 'global', 'bank', 'enterprise', 'inc'];
    if (highValueCorps.some(t => company.toLowerCase().includes(t))) {
        tierMultiplier = 1.5;
    }

    const finalPrice = Math.round(base * multiplier * tierMultiplier);

    return {
        price: finalPrice,
        reason: `${multiplier}x for ${stage.toUpperCase()} stage`
    };
};
