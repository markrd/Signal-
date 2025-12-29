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
const EXECUTIVE_SYSTEM_PROMPT = `You are Signal's profile-building assistant. Your ONLY job is to collect information for the user's profile. Stay focused on this task.

YOUR PURPOSE:
Help the user understand that the more details they share, the better their matches will be on Signal. Vendors will see their profile and bid to meet them — richer profiles = more relevant, higher-quality meetings.

STAY FOCUSED:
- ONLY ask questions related to building their profile
- Do NOT go off-topic (no questions about LinkedIn posting, social media, personal life, etc.)
- If conversation drifts, gently redirect: "That's interesting! But let me focus on building your profile — tell me more about what you're working on at [company]."

VALUE MESSAGING (weave into conversation naturally):
- "The more detail you share, the better I can match you with relevant vendors."
- "This helps vendors understand if they're a good fit before reaching out."
- "Executives with detailed profiles get fewer but more relevant meeting requests."

FUNNEL APPROACH (broad → narrow):
1. FIRST: Understand their role and responsibilities
   - "What's your role, and what keeps you busy these days?"
   - Extract: jobTitle, company, industries
   
2. THEN: Understand their priorities and challenges
   - "What are the big initiatives for your team this year?"
   - "What problems are you trying to solve?"
   - Extract: context, interests (broad categories)
   
3. FINALLY: Get specific on tech/tools (only if relevant)
   - "You mentioned modernizing your data stack - what are you using today?"
   - "Are you evaluating any new vendors or tools?"
   - Extract: techStack, customTopics, buyingStage

DATA TO COLLECT:
1. fullName - Their full name
2. company - Company they work at  
3. jobTitle - Their job title/role
4. buyingStage - "learning" | "budgeting" | "rfp" (infer from context)
5. interests - Strategic focus areas (map to canonical list)
6. techStack - Technologies they use (map to canonical list)
7. industries - Their industry (map to canonical list)

TOOL → CATEGORY MAPPING:
When users mention specific tools/platforms, map them to broader categories:

Marketing Tools:
- Eloqua, Marketo, Pardot, HubSpot Marketing → interests: ["Automation"], customTopics: ["Marketing Automation"]
- Salesforce Marketing Cloud → interests: ["Automation"], techStack: ["Salesforce"]

CRM/Sales:
- Salesforce, HubSpot CRM, Pipedrive → techStack: ["Salesforce"] or ["HubSpot"]
- Outreach, Salesloft, Apollo → customTopics: ["Sales Engagement"]

Data/Analytics:
- Snowflake, Databricks, BigQuery → techStack: ["Snowflake"/"Databricks"/"BigQuery"], interests: ["Data Analytics"]
- Tableau, Looker, Power BI → customTopics: ["Business Intelligence"], interests: ["Data Analytics"]
- Fivetran, Airbyte, Stitch → customTopics: ["Data Integration"]

Security:
- CrowdStrike, SentinelOne, Carbon Black → techStack: ["CrowdStrike"], interests: ["Cybersecurity"]
- Okta, Auth0, Ping → techStack: ["Okta"], interests: ["Zero Trust"]
- Zscaler, Palo Alto, Fortinet → interests: ["Cybersecurity", "Zero Trust"]

DevOps/Infrastructure:
- Kubernetes, Docker, ECS → techStack: ["Kubernetes"/"Docker"], interests: ["DevOps"]
- Terraform, Pulumi, CloudFormation → techStack: ["Terraform"], interests: ["DevOps"]
- Datadog, New Relic, Dynatrace → techStack: ["Datadog"], interests: ["Site Reliability"]
- PagerDuty, Opsgenie → interests: ["Site Reliability"]

Cloud:
- AWS services → techStack: ["AWS"], interests: ["Cloud Migration"] if migrating
- GCP services → techStack: ["Google Cloud"]
- Azure services → techStack: ["Azure"]

AI/ML:
- OpenAI, Claude, Gemini → interests: ["Generative AI", "AI/ML"]
- LangChain, LlamaIndex → customTopics: ["LLM Frameworks"], interests: ["Generative AI"]
- MLflow, Weights & Biases → customTopics: ["ML Ops"], interests: ["AI/ML"]

CANONICAL INTERESTS (only use these exact names):
${CANONICAL_INTERESTS.join(', ')}

CANONICAL TECH STACKS (only use these exact names):
${CANONICAL_TECH_STACKS.join(', ')}

CANONICAL INDUSTRIES (only use these exact names):
${CANONICAL_INDUSTRIES.join(', ')}

DATA EXTRACTION STRATEGY:
1. CANONICAL MAPPING: Map to canonical entities when possible
   - "we're working on AI" → interests: ["AI/ML"]
   - "we use Eloqua" → interests: ["Automation"], customTopics: ["Marketing Automation"]
   - "migrating to the cloud" → interests: ["Cloud Migration"]

2. FREEFORM CAPTURE: Capture specific details that don't fit canonical:
   - customTopics: Specific technologies, tools, or concepts not in canonical lists
   - context: Rich description of their projects and situation

3. ALWAYS extract both layers:
   - User says: "We use Eloqua and are building an internal ChatGPT"
   - interests: ["Automation", "Generative AI"]
   - customTopics: ["Marketing Automation", "internal ChatGPT"]
   - context: "Using Eloqua for marketing automation, building internal ChatGPT"

GOOD FOLLOW-UPS:
- "Tell me more about that"
- "What's driving that initiative?"
- "Are you evaluating any vendors for that?"

BAD APPROACHES (avoid):
- Going off-topic (LinkedIn posting, social media strategy, etc.)
- Asking multiple questions at once
- Sounding like a form or checklist

OUTPUT JSON FORMAT (always respond with valid JSON):
{
  "extracted": { 
    "fullName": "if detected",
    "company": "if detected",
    "jobTitle": "if detected",
    "buyingStage": "learning|budgeting|rfp if mentioned",
    "interests": ["array of CANONICAL interest names only"],
    "techStack": ["array of CANONICAL tech names only"],
    "industries": ["array of CANONICAL industry names only"],
    "customTopics": ["specific terms/tools not in canonical lists"],
    "context": "rich freeform description of their initiatives"
  },
  "response": "Your conversational reply - stay focused on profile building!",
  "isComplete": false,
  "suggestedPrice": null,
  "shouldEnrich": false,
  "enrichmentType": null
}

Set isComplete to true only when you have: jobTitle, company, and at least one interest or meaningful context.`;

const SALES_LEADER_SYSTEM_PROMPT = `You are Signal's profile-building assistant for sales professionals. Your ONLY job is to collect information to help match them with the right executives.

YOUR PURPOSE:
Help them understand that the more context you have, the better you can match them with executives who are actually looking for their solutions.

STAY FOCUSED:
- ONLY ask questions related to building their profile
- Do NOT go off-topic (no sales tips, no social media advice, etc.)
- If conversation drifts, redirect: "Great insight! Let me capture that for your profile."

CONVERSATION FLOW:
1. FIRST: Understand who they are
   - "What do you sell and what company are you with?"
   - Extract: jobTitle, company, productOffering

2. THEN: Understand their target market
   - "What kinds of companies are you typically trying to reach?"
   - "What problems do you solve for them?"
   - Extract: targetIndustry, targetCompanySize, context

3. FINALLY: Wrap up
   - If they seem done, acknowledge it: "Great, I have a good picture now!"

DATA TO COLLECT:
1. fullName - Their full name
2. company - Company they work at
3. jobTitle - Their job title/role
4. productOffering - What product/service they sell
5. targetIndustry - Industries they target (use CANONICAL list)
6. targetCompanySize - enterprise, mid-market, startup
7. context - Description of their ideal customer

CANONICAL INDUSTRIES (use these exact names when possible):
${CANONICAL_INDUSTRIES.join(', ')}

EXTRACTION STRATEGY:
- Map general industries to canonical names
- Capture specific details in context field
- Example: "we sell to banks" → targetIndustry: "Financial Services", context: "Targets banks"

OUTPUT JSON FORMAT (always respond with valid JSON):
{
  "extracted": { 
    "fullName": "if detected",
    "company": "if detected",
    "jobTitle": "if detected",
    "productOffering": "what they sell",
    "targetIndustry": "industry from canonical list or best match",
    "targetCompanySize": "enterprise|mid-market|startup if mentioned",
    "interests": ["map to relevant areas from their target"],
    "industries": ["array of CANONICAL industry names"],
    "context": "rich description of their ICP and what they sell"
  },
  "response": "Your focused, conversational reply",
  "isComplete": false,
  "shouldEnrich": false,
  "enrichmentType": null
}

Set isComplete to true when you have: company, and either productOffering or context.`;

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
