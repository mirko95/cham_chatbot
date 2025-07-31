/**
 * PDF_CONTENT
 * --------------------------
 * - Static FAQ content used as the "knowledge base" for the chatbot.
 * - This acts as the CONTEXT section for Gemini (RAG simulation).
 * - Each Q&A entry is simple text to make parsing predictable.
 * - The chatbot will answer user questions by referencing ONLY this content.
 *
 * ⚠️ NOTE:
 * - For large or dynamic sites, this static content could be replaced by 
 *   a real RAG pipeline (embedding + vector search).
 * - For multilingual support, consider storing a version of this per language.
 */

export const PDF_CONTENT = `
1. What is Chameleon AI and who is it for?  
Chameleon AI is a flexible, website-aware AI assistant designed for small and medium-sized businesses. It automates customer interactions, answers questions, collects leads, integrates with existing systems, and adapts to your brand’s tone and language. It’s especially powerful for hospitality, retail, finance, and service-based industries.

2. How does Chameleon AI integrate with my business tools?  
Integration is fast and code-free. Chameleon connects directly to your website, CRM, booking engines, Property Management Systems (PMS), POS, and email platforms. Custom API integrations are also available for unique workflows.

3. Can I customize my AI assistant?  
Absolutely. You can adjust tone, style, and personality; create industry-specific FAQs and workflows; configure multilingual responses; and match visuals (logo, colors, fonts) to your brand. This ensures the assistant feels like part of your team.

4. How much does Chameleon AI cost?  
Chameleon offers three plans:  
- Starter – Free: Basic assistant and website embed  
- Pro – $129/month: Advanced features, integrations, and automation  
- Enterprise – Custom pricing for multi-property businesses or complex workflows  
Pricing scales with your needs — no hidden fees.

5. How quickly can I get started?  
A standard setup can be live in under 30 minutes. Enterprise and complex integrations may take a few days to configure.

6. How secure is Chameleon AI?  
Security is a top priority. We use end-to-end encryption, GDPR-compliant processes, access controls, and anonymization to keep your data safe.

7. What support do you provide?  
Support depends on your plan:  
- Starter – Community forums and documentation  
- Pro – Priority email support  
- Enterprise – Dedicated Success Manager and 24/7 premium support

8. What kind of ROI can I expect?  
Our clients have reported:  
- +28% guest satisfaction from AI reception & instant responses  
- Reduced reporting time by 60% with automated reporting  
- +15% direct bookings from personalized guest engagement  
- +12% ancillary revenue from targeted upselling

9. Which industries benefit most from Chameleon AI?  
Chameleon works across industries but excels in:  
- Hospitality – Hotels, resorts, B&Bs  
- Retail & E-commerce – Customer service & recommendations  
- Finance – Client onboarding & support  
- Healthcare – Appointment scheduling & FAQ automation

10. How do I get started?  
Click “Get in Touch” or choose a plan in our Pricing section. We’ll help set up, customize your AI assistant, and integrate it into your workflow.
`;
