-- Knowledge Graph Seed Data
-- Run this in Supabase SQL Editor

-- First, update the constraint to allow new entity types
ALTER TABLE public.entities 
DROP CONSTRAINT IF EXISTS entities_type_check;

ALTER TABLE public.entities 
ADD CONSTRAINT entities_type_check 
CHECK (type IN ('CATEGORY', 'TECH_STACK', 'INTEREST', 'INDUSTRY'));

-- =============================================
-- TECH_STACK Entities (Technologies & Platforms)
-- =============================================
INSERT INTO public.entities (name, type, synonyms) VALUES
-- Cloud Providers
('AWS', 'TECH_STACK', ARRAY['Amazon Web Services', 'Amazon Cloud', 'EC2', 'S3']),
('Google Cloud', 'TECH_STACK', ARRAY['GCP', 'Google Cloud Platform']),
('Azure', 'TECH_STACK', ARRAY['Microsoft Azure', 'Azure Cloud']),

-- DevOps & Infrastructure
('Kubernetes', 'TECH_STACK', ARRAY['K8s', 'k8s', 'container orchestration']),
('Docker', 'TECH_STACK', ARRAY['containers', 'containerization']),
('Terraform', 'TECH_STACK', ARRAY['IaC', 'infrastructure as code']),

-- Data & Analytics
('Snowflake', 'TECH_STACK', ARRAY['data warehouse', 'Snowflake DB']),
('Databricks', 'TECH_STACK', ARRAY['data lakehouse', 'Spark']),
('BigQuery', 'TECH_STACK', ARRAY['Google BigQuery', 'BQ']),
('PostgreSQL', 'TECH_STACK', ARRAY['Postgres', 'PG']),
('MongoDB', 'TECH_STACK', ARRAY['Mongo', 'NoSQL']),

-- CRM & Sales
('Salesforce', 'TECH_STACK', ARRAY['SFDC', 'Sales Cloud', 'Service Cloud']),
('HubSpot', 'TECH_STACK', ARRAY['Hubspot CRM']),

-- Security
('Okta', 'TECH_STACK', ARRAY['SSO', 'identity management']),
('CrowdStrike', 'TECH_STACK', ARRAY['endpoint security', 'EDR']),
('Palo Alto', 'TECH_STACK', ARRAY['firewall', 'PANW']),

-- Observability
('Datadog', 'TECH_STACK', ARRAY['monitoring', 'APM', 'observability']),
('Splunk', 'TECH_STACK', ARRAY['SIEM', 'log management']),
('New Relic', 'TECH_STACK', ARRAY['APM', 'observability']),

-- Communication
('Slack', 'TECH_STACK', ARRAY['team chat', 'messaging']),
('Zoom', 'TECH_STACK', ARRAY['video conferencing']),
('Microsoft Teams', 'TECH_STACK', ARRAY['Teams', 'MS Teams'])

ON CONFLICT (name, type) DO NOTHING;

-- =============================================
-- INTEREST Entities (Strategic Focus Areas)
-- =============================================
INSERT INTO public.entities (name, type, synonyms) VALUES
-- AI & Machine Learning
('AI/ML', 'INTEREST', ARRAY['artificial intelligence', 'machine learning', 'AI', 'ML', 'deep learning']),
('Generative AI', 'INTEREST', ARRAY['GenAI', 'LLM', 'ChatGPT', 'large language models']),

-- Infrastructure & Operations
('Cloud Migration', 'INTEREST', ARRAY['cloud transformation', 'lift and shift', 'replatforming']),
('DevOps', 'INTEREST', ARRAY['CI/CD', 'continuous integration', 'continuous deployment']),
('Platform Engineering', 'INTEREST', ARRAY['internal developer platform', 'developer experience', 'DevEx']),
('Site Reliability', 'INTEREST', ARRAY['SRE', 'reliability engineering', 'uptime']),

-- Security
('Cybersecurity', 'INTEREST', ARRAY['security', 'infosec', 'information security']),
('Zero Trust', 'INTEREST', ARRAY['zero trust architecture', 'ZTNA']),
('Compliance', 'INTEREST', ARRAY['SOC2', 'GDPR', 'HIPAA', 'regulatory compliance']),

-- Data
('Data Analytics', 'INTEREST', ARRAY['business intelligence', 'BI', 'data analysis']),
('Data Governance', 'INTEREST', ARRAY['data quality', 'metadata management']),
('Real-time Analytics', 'INTEREST', ARRAY['streaming', 'event-driven']),

-- Business Optimization
('Cost Optimization', 'INTEREST', ARRAY['FinOps', 'cloud cost', 'cost reduction']),
('Digital Transformation', 'INTEREST', ARRAY['modernization', 'digital strategy']),
('Automation', 'INTEREST', ARRAY['RPA', 'process automation', 'workflow automation']),

-- Architecture
('API Strategy', 'INTEREST', ARRAY['API-first', 'API management', 'microservices']),
('Microservices', 'INTEREST', ARRAY['distributed systems', 'service mesh']),
('Event-Driven Architecture', 'INTEREST', ARRAY['event sourcing', 'message queues', 'Kafka'])

ON CONFLICT (name, type) DO NOTHING;

-- =============================================
-- INDUSTRY Entities (Target Markets)
-- =============================================
INSERT INTO public.entities (name, type, synonyms) VALUES
('FinTech', 'INDUSTRY', ARRAY['financial technology', 'financial services', 'banking tech']),
('Healthcare', 'INDUSTRY', ARRAY['health tech', 'healthtech', 'medical technology']),
('SaaS', 'INDUSTRY', ARRAY['software as a service', 'B2B SaaS', 'enterprise SaaS']),
('E-Commerce', 'INDUSTRY', ARRAY['ecommerce', 'online retail', 'digital commerce']),
('Cybersecurity', 'INDUSTRY', ARRAY['security vendors', 'infosec companies']),
('Enterprise Software', 'INDUSTRY', ARRAY['B2B software', 'enterprise tech']),
('EdTech', 'INDUSTRY', ARRAY['education technology', 'learning platforms']),
('Media & Entertainment', 'INDUSTRY', ARRAY['streaming', 'digital media']),
('Manufacturing', 'INDUSTRY', ARRAY['industrial', 'IoT', 'Industry 4.0']),
('Retail', 'INDUSTRY', ARRAY['consumer retail', 'brick and mortar']),
('Telecommunications', 'INDUSTRY', ARRAY['telecom', 'telco']),
('Government', 'INDUSTRY', ARRAY['public sector', 'GovTech', 'federal']),
('Energy', 'INDUSTRY', ARRAY['oil and gas', 'utilities', 'renewable energy']),
('Transportation', 'INDUSTRY', ARRAY['logistics', 'supply chain', 'shipping']),
('Insurance', 'INDUSTRY', ARRAY['insurtech', 'insurance technology'])

ON CONFLICT (name, type) DO NOTHING;

-- Verify the data
SELECT type, COUNT(*) as count FROM public.entities GROUP BY type ORDER BY type;
