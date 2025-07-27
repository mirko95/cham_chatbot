
import { KnowledgeBaseEntry } from '../types';

export const knowledgeBase: KnowledgeBaseEntry[] = [
  {
    path: '/pricing',
    keywords: ['price', 'pricing', 'cost', 'plan', 'plans', 'subscribe', 'subscription'],
    content: `We offer three pricing tiers:
    - Basic: $10/month. Includes 1 chatbot and up to 1,000 messages per month.
    - Pro: $50/month. Includes 5 chatbots, UI customization, and up to 10,000 messages.
    - Enterprise: Custom pricing. Includes unlimited chatbots, dedicated support, and advanced integrations. Contact sales for a quote.`
  },
  {
    path: '/about',
    keywords: ['company', 'about', 'mission', 'team', 'who'],
    content: `Chameleon AI was founded in 2023 with the mission to make AI accessible and useful for businesses of all sizes. Our team consists of experienced engineers and designers passionate about creating intelligent and intuitive user experiences.`
  },
  {
    path: '/services',
    keywords: ['services', 'features', 'what', 'how', 'RAG', 'customization', 'embed'],
    content: `Our main service is a website-aware Q&A chatbot. Key features include:
    - Retrieval-Augmented Generation (RAG) to provide accurate answers from your content.
    - A contact form fallback for complex queries.
    - Easy embedding via an iframe on any website.
    - UI customization to match your brand's color scheme and logo.`
  },
  {
    path: '/faq',
    keywords: ['faq', 'question', 'support', 'help', 'how', 'tech', 'stack'],
    content: `Frequently Asked Questions:
    - How do I install the chatbot? You just need to paste a simple iframe code snippet into your website's HTML.
    - What technology do you use? Our frontend is built with React and TypeScript, and our AI is powered by Google's Gemini models.
    - Can I change the chatbot's appearance? Yes, the Pro and Enterprise plans allow for full customization of colors and logos.`
  },
];
