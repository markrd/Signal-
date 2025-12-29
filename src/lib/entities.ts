import { supabase } from './supabase';

// Types
export type EntityType = 'CATEGORY' | 'TECH_STACK' | 'INTEREST' | 'INDUSTRY';

export interface Entity {
    id: string;
    name: string;
    type: EntityType;
    synonyms: string[];
    related_ids: string[];
}

// Cache for entities (refreshed on demand)
let entitiesCache: Entity[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all entities from the database
 */
export async function fetchEntities(): Promise<Entity[]> {
    // Return cached if fresh
    if (entitiesCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return entitiesCache;
    }

    const { data, error } = await supabase
        .from('entities')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching entities:', error);
        return entitiesCache || [];
    }

    entitiesCache = data || [];
    cacheTimestamp = Date.now();
    return entitiesCache;
}

/**
 * Get entities by type
 */
export async function getEntitiesByType(type: EntityType): Promise<Entity[]> {
    const all = await fetchEntities();
    return all.filter(e => e.type === type);
}

/**
 * Match user input to canonical entity names
 * Uses exact match and synonym matching
 */
export function matchToEntity(input: string, entities: Entity[]): Entity | null {
    const normalizedInput = input.toLowerCase().trim();

    for (const entity of entities) {
        // Exact name match
        if (entity.name.toLowerCase() === normalizedInput) {
            return entity;
        }

        // Synonym match
        for (const synonym of entity.synonyms || []) {
            if (synonym.toLowerCase() === normalizedInput) {
                return entity;
            }
        }
    }

    return null;
}

/**
 * Match multiple inputs to canonical entities
 * Returns array of matched canonical names
 */
export function matchMultipleToEntities(inputs: string[], entities: Entity[]): string[] {
    const matched: string[] = [];

    for (const input of inputs) {
        const entity = matchToEntity(input, entities);
        if (entity && !matched.includes(entity.name)) {
            matched.push(entity.name);
        }
    }

    return matched;
}

/**
 * Fuzzy match - finds entities that contain the input or vice versa
 */
export function fuzzyMatchEntities(input: string, entities: Entity[]): Entity[] {
    const normalizedInput = input.toLowerCase().trim();

    return entities.filter(entity => {
        // Check name
        if (entity.name.toLowerCase().includes(normalizedInput) ||
            normalizedInput.includes(entity.name.toLowerCase())) {
            return true;
        }

        // Check synonyms
        return (entity.synonyms || []).some(syn =>
            syn.toLowerCase().includes(normalizedInput) ||
            normalizedInput.includes(syn.toLowerCase())
        );
    });
}

/**
 * Get a simple list of canonical names by type
 * Used for LLM prompts
 */
export async function getCanonicalNames(type: EntityType): Promise<string[]> {
    const entities = await getEntitiesByType(type);
    return entities.map(e => e.name);
}

/**
 * Pre-built lists for LLM prompts (avoid async in prompts)
 * These are populated from the database but have fallbacks
 */
export const CANONICAL_INTERESTS = [
    'AI/ML', 'Generative AI', 'Cloud Migration', 'DevOps', 'Platform Engineering',
    'Site Reliability', 'Cybersecurity', 'Zero Trust', 'Compliance', 'Data Analytics',
    'Data Governance', 'Real-time Analytics', 'Cost Optimization', 'Digital Transformation',
    'Automation', 'API Strategy', 'Microservices', 'Event-Driven Architecture'
];

export const CANONICAL_TECH_STACKS = [
    'AWS', 'Google Cloud', 'Azure', 'Kubernetes', 'Docker', 'Terraform',
    'Snowflake', 'Databricks', 'BigQuery', 'PostgreSQL', 'MongoDB',
    'Salesforce', 'HubSpot', 'Okta', 'CrowdStrike', 'Datadog', 'Splunk',
    'Slack', 'Zoom', 'Microsoft Teams'
];

export const CANONICAL_INDUSTRIES = [
    'FinTech', 'Healthcare', 'SaaS', 'E-Commerce', 'Cybersecurity',
    'Enterprise Software', 'EdTech', 'Media & Entertainment', 'Manufacturing',
    'Retail', 'Telecommunications', 'Government', 'Energy', 'Transportation', 'Insurance'
];
