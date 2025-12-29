import OpenAI from 'openai';
import { CANONICAL_INTERESTS, CANONICAL_TECH_STACKS, CANONICAL_INDUSTRIES } from './entities';

// Initialize OpenAI client
// Note: For production, this should be proxied through a backend
const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage
});

// Types
export interface ExtractedData {
    fullName?: string;
    company?: string;
    jobTitle?: string;
    email?: string;
    linkedIn?: string;
    website?: string;
    buyingStage?: 'learning' | 'budgeting' | 'rfp';
    initiatives?: string;
    techStack?: string[];
    interests?: string[];      // Strategic focus areas (AI/ML, Cloud Migration, etc.)
    industries?: string[];     // Target industries (FinTech, Healthcare, etc.)
    customTopics?: string[];   // Freeform topics that don't match canonical entities
    context?: string;          // Rich freeform context about their projects/initiatives
    password?: string;
    targetIndustry?: string;
    targetCompanySize?: string;
    budgetRange?: string;
    productOffering?: string;
    // Enriched data from LinkedIn/Website
    profileImageUrl?: string;
    summary?: string;
    yearsExperience?: string;
    previousCompanies?: string[];
    skills?: string[];
    companySize?: string;
    companyIndustry?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface LLMResponse {
    extracted: Partial<ExtractedData>;
    response: string;
    isComplete: boolean;
    suggestedPrice?: number;
    shouldEnrich?: boolean; // Flag to trigger enrichment
    enrichmentType?: 'linkedin' | 'website';
}

// Required fields by role
const REQUIRED_FIELDS = {
    SIGNAL: ['fullName', 'company', 'jobTitle', 'email', 'linkedIn'],
    HUNTER: ['fullName', 'company', 'jobTitle', 'email']
};

// System prompts with canonical entity lists for structured extraction
const EXECUTIVE_SYSTEM_PROMPT = `You are Signal's friendly onboarding assistant. Your job is to help executives create their profile through natural conversation.

CONVERSATION STYLE:
- Be warm, conversational, and genuinely curious
- Start BROAD, then narrow down based on their responses
- Don't jump straight to tech - understand their world first
- If they volunteer information, acknowledge it and probe deeper
- Be interested in their business challenges, not just tech stack

FUNNEL APPROACH (broad → narrow):
1. FIRST: Understand their role and responsibilities
   - "What's keeping you busy?" / "What does your day-to-day look like?"
   - Extract: jobTitle, company, industries
   
2. THEN: Understand their priorities and challenges
   - "What are the big initiatives for your team this year?"
   - "What problems are you trying to solve?"
   - Extract: context, interests (broad categories)
   
3. FINALLY: Get specific on tech/tools (only if relevant)
   - "You mentioned modernizing your data stack - what are you using today?"
   - "Are you evaluating any new vendors or tools?"
   - Extract: techStack, customTopics, buyingStage

DATA TO COLLECT (in natural flow, NOT as a checklist):
1. fullName - Their full name
2. company - Company they work at  
3. jobTitle - Their job title/role
4. linkedIn - LinkedIn profile URL (only if offered)
5. email - Their work email
6. website - Company website
7. buyingStage - "learning" | "budgeting" | "rfp" (infer from context)
8. interests - Strategic focus areas (map to canonical list)
9. techStack - Technologies they use (map to canonical list)
10. industries - Their industry (map to canonical list)

CANONICAL INTERESTS (only use these exact names):
${CANONICAL_INTERESTS.join(', ')}

CANONICAL TECH STACKS (only use these exact names):
${CANONICAL_TECH_STACKS.join(', ')}

CANONICAL INDUSTRIES (only use these exact names):
${CANONICAL_INDUSTRIES.join(', ')}

DATA EXTRACTION STRATEGY (tiered approach):
1. CANONICAL MAPPING: First, map to canonical entities when possible
   - "we're working on AI" → interests: ["AI/ML"]
   - "migrating to the cloud" → interests: ["Cloud Migration"]  
   - "we use k8s" → techStack: ["Kubernetes"]

2. FREEFORM CAPTURE: Then, capture specific details that don't fit canonical:
   - customTopics: Specific technologies, tools, or concepts not in canonical lists
     Example: "building RAG pipeline" → customTopics: ["RAG pipeline"]
     Example: "migrating from Oracle" → customTopics: ["Oracle migration"]
   
   - context: Rich description of their projects and situation
     Example: "We're rebuilding our data platform to support real-time ML inference for fraud detection"
     This becomes the context field - capture the full narrative

3. ALWAYS extract both layers:
   - User says: "We're building an internal ChatGPT for legal document review"
   - interests: ["Generative AI", "Automation"]
   - customTopics: ["legal document review", "internal ChatGPT"]
   - context: "Building an internal ChatGPT for legal document review"

GOOD FOLLOW-UP QUESTIONS:
- "That's interesting - tell me more about that"
- "What's driving that initiative?"
- "How's that going? Any challenges?"
- "Are you looking at vendors for that, or building in-house?"

BAD APPROACHES (avoid):
- Don't ask "What's your tech stack?" as an opener
- Don't list multiple questions at once
- Don't sound like a form

LINKEDIN DETECTION:
- If message contains linkedin.com/in/, extract the URL and set shouldEnrich: true, enrichmentType: "linkedin"

PRICING GUIDE (suggest based on seniority):
- C-Level (CEO, CTO, CIO, etc.): $800-1,500
- VP/SVP: $500-1,000
- Director: $300-600
- Manager: $150-300

OUTPUT JSON FORMAT (always respond with valid JSON):
{
  "extracted": { 
    "fullName": "if detected",
    "company": "if detected",
    "jobTitle": "if detected",
    "linkedIn": "if URL detected",
    "website": "if URL detected",
    "email": "if detected",
    "buyingStage": "learning|budgeting|rfp if mentioned",
    "interests": ["array of CANONICAL interest names only"],
    "techStack": ["array of CANONICAL tech names only"],
    "industries": ["array of CANONICAL industry names only"],
    "customTopics": ["specific terms/tools not in canonical lists"],
    "context": "rich freeform description of their initiatives"
  },
  "response": "Your conversational reply",
  "isComplete": false,
  "suggestedPrice": null,
  "shouldEnrich": true/false,
  "enrichmentType": "linkedin" or "website" or null
}

Set isComplete to true only when you have: fullName, company, jobTitle, email, and linkedIn.`;

const SALES_LEADER_SYSTEM_PROMPT = `You are Signal's friendly onboarding assistant helping sales leaders set up their profile.

CONVERSATION STYLE:
- Be warm, conversational, and adaptive
- Understand their sales motion and target market
- Don't follow a rigid script - respond naturally

DATA TO COLLECT (flexibly):
1. fullName - Their full name
2. company - Company they work at
3. jobTitle - Their job title/role
4. email - Their work email
5. linkedIn - LinkedIn profile (optional but helpful)
6. productOffering - What product/service they sell
7. targetIndustry - Industries they target
8. targetCompanySize - Target company size (enterprise, mid-market, startup)
9. budgetRange - Typical deal size

FLEXIBLE APPROACH:
- If they share LinkedIn, acknowledge and note you'll use it to understand their background
- Ask about their ideal customer naturally
- Group questions to make it feel conversational

OUTPUT JSON FORMAT:
{
  "extracted": { ... fields extracted ... },
  "response": "Your conversational reply",
  "isComplete": false,
  "shouldEnrich": true/false,
  "enrichmentType": "linkedin" or "website" or null
}

Set isComplete to true when you have: fullName, company, jobTitle, and email.`;

// Detect LinkedIn URL in text
export function detectLinkedInUrl(text: string): string | null {
    const linkedInRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/gi;
    const match = text.match(linkedInRegex);
    return match ? match[0] : null;
}

// Detect website URL in text
export function detectWebsiteUrl(text: string): string | null {
    // Match URLs but exclude LinkedIn
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?(?!linkedin\.com)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/gi;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
}

// Simulate LinkedIn profile enrichment
// In production, this would call a real API like RapidAPI's LinkedIn scraper
export async function enrichFromLinkedIn(linkedInUrl: string): Promise<Partial<ExtractedData>> {
    console.log('Enriching from LinkedIn:', linkedInUrl);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Extract username from URL for simulation
    const username = linkedInUrl.split('/in/')[1]?.replace(/\/$/, '') || '';

    // Simulated enrichment based on common patterns
    // In production, this would return real data from LinkedIn
    const enrichedData: Partial<ExtractedData> = {};

    // Simulate finding profile data
    if (username.toLowerCase().includes('sarah') || username.toLowerCase().includes('chen')) {
        enrichedData.fullName = 'Sarah Chen';
        enrichedData.jobTitle = 'VP of Engineering';
        enrichedData.company = 'Stripe';
        enrichedData.skills = ['Engineering Leadership', 'Distributed Systems', 'Cloud Architecture'];
        enrichedData.yearsExperience = '15+ years';
    } else if (username.toLowerCase().includes('michael') || username.toLowerCase().includes('torres')) {
        enrichedData.fullName = 'Michael Torres';
        enrichedData.jobTitle = 'CTO';
        enrichedData.company = 'Coinbase';
        enrichedData.skills = ['Blockchain', 'Security', 'Cloud Infrastructure'];
        enrichedData.yearsExperience = '18+ years';
    } else {
        // Generic enrichment for demo
        enrichedData.skills = ['Leadership', 'Strategy', 'Technology'];
        enrichedData.yearsExperience = '10+ years';
    }

    return enrichedData;
}

// Simulate company website enrichment
export async function enrichFromWebsite(websiteUrl: string): Promise<Partial<ExtractedData>> {
    console.log('Enriching from website:', websiteUrl);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract domain for simulation
    const domain = websiteUrl.replace(/https?:\/\//, '').replace(/www\./, '').split('/')[0];

    const enrichedData: Partial<ExtractedData> = {};

    // Simulate finding company data
    if (domain.includes('stripe')) {
        enrichedData.company = 'Stripe';
        enrichedData.companySize = '5,000+ employees';
        enrichedData.companyIndustry = 'Fintech / Payments';
        enrichedData.techStack = ['AWS', 'Ruby', 'Go', 'PostgreSQL'];
    } else if (domain.includes('coinbase')) {
        enrichedData.company = 'Coinbase';
        enrichedData.companySize = '3,500+ employees';
        enrichedData.companyIndustry = 'Cryptocurrency / Web3';
        enrichedData.techStack = ['AWS', 'Go', 'MongoDB', 'Kubernetes'];
    } else if (domain.includes('acme')) {
        enrichedData.company = 'Acme Corp';
        enrichedData.companySize = '500-1000 employees';
        enrichedData.companyIndustry = 'Enterprise Software';
    } else {
        // Generic enrichment
        enrichedData.companySize = 'Unknown';
        enrichedData.companyIndustry = 'Technology';
    }

    return enrichedData;
}

// Get missing required fields
export function getMissingFields(role: 'SIGNAL' | 'HUNTER', data: ExtractedData): string[] {
    const required = REQUIRED_FIELDS[role];
    return required.filter(field => !data[field as keyof ExtractedData]);
}

// Check if profile is complete
export function isProfileComplete(role: 'SIGNAL' | 'HUNTER', data: ExtractedData): boolean {
    return getMissingFields(role, data).length === 0;
}

// Main chat function
export async function chatWithLLM(
    role: 'SIGNAL' | 'HUNTER',
    messages: ChatMessage[],
    currentData: ExtractedData
): Promise<LLMResponse> {
    const systemPrompt = role === 'SIGNAL' ? EXECUTIVE_SYSTEM_PROMPT : SALES_LEADER_SYSTEM_PROMPT;

    // Build context about what's already collected
    const collectedInfo = Object.entries(currentData)
        .filter(([_, v]) => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true))
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('\n');

    const missingFields = getMissingFields(role, currentData);

    const contextMessage = `
CURRENT PROFILE STATE:
${collectedInfo || 'Nothing collected yet'}

FIELDS STILL NEEDED:
${missingFields.join(', ') || 'All required fields collected!'}

IMPORTANT: 
- Be flexible and natural, not robotic
- If they share a LinkedIn or website URL, acknowledge it and note you'll use it
- Don't ask for fields you already have
- Respond with valid JSON only.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'system', content: contextMessage },
                ...messages.map(m => ({
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.content
                }))
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8, // Slightly higher for more natural responses
            max_tokens: 600
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from LLM');
        }

        const parsed = JSON.parse(content) as LLMResponse;

        // Also check for URLs in the latest user message for enrichment triggers
        const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
        const detectedLinkedIn = detectLinkedInUrl(lastUserMessage);
        const detectedWebsite = detectWebsiteUrl(lastUserMessage);

        if (detectedLinkedIn && !currentData.linkedIn) {
            parsed.extracted = { ...parsed.extracted, linkedIn: detectedLinkedIn };
            parsed.shouldEnrich = true;
            parsed.enrichmentType = 'linkedin';
        }

        if (detectedWebsite && !currentData.website) {
            parsed.extracted = { ...parsed.extracted, website: detectedWebsite };
            if (!parsed.shouldEnrich) {
                parsed.shouldEnrich = true;
                parsed.enrichmentType = 'website';
            }
        }

        // Merge extracted data
        const newData = { ...currentData, ...parsed.extracted };

        // Check completion
        parsed.isComplete = isProfileComplete(role, newData);

        return parsed;
    } catch (error) {
        console.error('LLM Error:', error);
        throw error;
    }
}

// Initial greeting based on role - More casual and flexible
export function getInitialGreeting(role: 'SIGNAL' | 'HUNTER'): string {
    if (role === 'SIGNAL') {
        return "Hey! 👋 Welcome to Signal. I'm here to get you set up so you can start earning from your expertise.\n\nThe fastest way to get started is to drop your LinkedIn profile - I'll pull your details automatically. Or just tell me a bit about yourself!";
    } else {
        return "Hey! 👋 Welcome to Signal. I'm here to help you start booking meetings with verified executives.\n\nTo get started, tell me a bit about yourself - or share your LinkedIn and I'll grab your info from there.";
    }
}

// Validate email domain
export function isValidCorporateEmail(email: string): boolean {
    const blockedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? !blockedDomains.includes(domain) : false;
}

// Calculate suggested price based on title
export function calculateSuggestedPrice(jobTitle: string, buyingStage?: string): number {
    const title = jobTitle.toLowerCase();

    let basePrice = 200;

    // Seniority multiplier
    if (title.includes('ceo') || title.includes('chief') || title.includes('founder')) {
        basePrice = 1200;
    } else if (title.includes('cto') || title.includes('cio') || title.includes('cfo') || title.includes('coo')) {
        basePrice = 1000;
    } else if (title.includes('svp') || title.includes('senior vice president')) {
        basePrice = 800;
    } else if (title.includes('vp') || title.includes('vice president')) {
        basePrice = 600;
    } else if (title.includes('director')) {
        basePrice = 400;
    } else if (title.includes('head of') || title.includes('lead')) {
        basePrice = 350;
    } else if (title.includes('manager')) {
        basePrice = 250;
    }

    // Buying stage multiplier
    if (buyingStage === 'rfp') {
        basePrice *= 1.5;
    } else if (buyingStage === 'budgeting') {
        basePrice *= 1.2;
    }

    return Math.round(basePrice);
}
