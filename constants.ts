import { Language } from "./types";

/**
 * Gemini Model Configuration
 * --------------------------
 * - Defines the Gemini model variant used for chat responses.
 * - `gemini-2.5-flash` is chosen for speed and cost-efficiency over heavy reasoning.
 */
export const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Default Theme Configuration
 * ---------------------------
 * - Primary and hover colors
 * - Default logo (Base64 embedded)
 * - Default UI settings for border radius and font
 */
export const DEFAULT_PRIMARY_COLOR = '#1F2937';       // Sleek dark gray for primary elements
export const DEFAULT_PRIMARY_FOCUS_COLOR = '#111827'; // Darker gray for hover/focus states

// Base64 encoded fallback logo (prevents missing assets if remote logo fails)
export const DEFAULT_LOGO = `data:image/png;base64,iVBORw0K...`;

// Default bot greeting (English fallback)
export const DEFAULT_GREETING = "Hello! I'm an AI assistant. I can answer questions about our AI services, benefits, and implementation process. How can I help you today?";

export const DEFAULT_BORDER_RADIUS = '0.5rem'; // Matches Tailwind's `rounded-lg`
export const DEFAULT_FONT_FAMILY = `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;

/**
 * Supported Languages
 * --------------------------
 * - Used for dynamic translations and language detection.
 */
export const supportedLanguages: Language[] = ['it', 'el', 'de', 'en'];

/**
 * TranslationKeys type
 * --------------------------
 * Defines all translatable UI strings required for the chatbot.
 */
type TranslationKeys = {
    headerTitle: string;
    inputPlaceholder: string;
    greeting: string;
    contactOfferTrigger: string;
    contactInitiate: string;
    contactNamePrompt: string;
    contactCompanyPrompt: string;
    contactEmailInvalid: string;
    contactEmailPrompt: string;
    contactSuccess: string;
    genericError: string;
    contactFlowError: string;
    affirmativeResponses: string;
    contactTriggers: string;
    skip: string;
};

/**
 * translations
 * --------------------------
 * - Holds translations for all supported languages.
 * - Used dynamically in UI (header, input, prompts, error messages, etc.)
 * - `{name}` placeholder in strings is replaced at runtime with user input.
 */
export const translations: Record<Language, TranslationKeys> = {
  en: {
    headerTitle: "Chameleon Assistant",
    inputPlaceholder: "Type your message...",
    greeting: "Hello! I'm an AI assistant. I can answer questions about our AI services, benefits, and implementation process. How can I help you today?",
    contactOfferTrigger: "contact our support team",
    contactInitiate: "I can connect you with the team. What's your full name?",
    contactNamePrompt: "Thanks, {name}. What's your company name? (You can say 'skip')",
    contactCompanyPrompt: "Got it. What is your email address?",
    contactEmailInvalid: "That doesn't look right. Please enter a valid email address.",
    contactEmailPrompt: "Perfect. And your phone number? (You can say 'skip')",
    contactSuccess: "Thank you, {name}! Your message has been sent. A team member will reach out to you shortly.",
    genericError: "I'm having trouble connecting right now. Please try again later.",
    contactFlowError: "I'm having a bit of trouble right now. Please try again in a moment.",
    affirmativeResponses: "yes, yep, sure, ok, yeah, please do",
    contactTriggers: "contact, help, support, talk to a human, email",
    skip: "skip"
  },
  it: {
    headerTitle: "Assistente Camaleonte",
    inputPlaceholder: "Scrivi il tuo messaggio...",
    greeting: "Ciao! Sono un assistente AI. Posso rispondere a domande sui nostri servizi di IA, i vantaggi e il processo di implementazione. Come posso aiutarti oggi?",
    contactOfferTrigger: "contattare il nostro team di supporto",
    contactInitiate: "Posso metterti in contatto con il team. Qual è il tuo nome completo?",
    contactNamePrompt: "Grazie, {name}. Qual è il nome della tua azienda? (Puoi dire 'salta')",
    contactCompanyPrompt: "Capito. Qual è il tuo indirizzo email?",
    contactEmailInvalid: "Non sembra corretto. Per favore, inserisci un indirizzo email valido.",
    contactEmailPrompt: "Perfetto. E il tuo numero di telefono? (Puoi dire 'salta')",
    contactSuccess: "Grazie, {name}! Il tuo messaggio è stato inviato. Un membro del team ti contatterà a breve.",
    genericError: "Sto riscontrando problemi di connessione al momento. Riprova più tardi.",
    contactFlowError: "Sto avendo qualche problema al momento. Per favore, riprova tra un attimo.",
    affirmativeResponses: "sì, si, certo, ok, va bene",
    contactTriggers: "contatto, aiuto, supporto, parlare con un umano, email",
    skip: "salta"
  },
  de: {
    headerTitle: "Chamäleon Assistent",
    inputPlaceholder: "Geben Sie Ihre Nachricht ein...",
    greeting: "Hallo! Ich bin ein KI-Assistent. Ich kann Fragen zu unseren KI-Diensten, deren Vorteilen und dem Implementierungsprozess beantworten. Wie kann ich Ihnen heute helfen?",
    contactOfferTrigger: "unser Support-Team kontaktieren",
    contactInitiate: "Ich kann Sie mit dem Team verbinden. Wie lautet Ihr vollständiger Name?",
    contactNamePrompt: "Danke, {name}. Wie lautet der Name Ihres Unternehmens? (Sie können 'überspringen' sagen)",
    contactCompanyPrompt: "Verstanden. Wie lautet Ihre E-Mail-Adresse?",
    contactEmailInvalid: "Das scheint nicht korrekt zu sein. Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    contactEmailPrompt: "Perfekt. Und Ihre Telefonnummer? (Sie können 'überspringen' sagen)",
    contactSuccess: "Vielen Dank, {name}! Ihre Nachricht wurde gesendet. Ein Teammitglied wird sich in Kürze bei Ihnen melden.",
    genericError: "Ich habe im Moment Verbindungsprobleme. Bitte versuchen Sie es später erneut.",
    contactFlowError: "Ich habe gerade ein kleines Problem. Bitte versuchen Sie es in einem Moment erneut.",
    affirmativeResponses: "ja, klar, sicher, ok, in ordnung",
    contactTriggers: "kontakt, hilfe, support, mit einem menschen sprechen, e-mail",
    skip: "überspringen"
  },
  el: {
    headerTitle: "Βοηθός Χαμαιλέων",
    inputPlaceholder: "Πληκτρολογήστε το μήνυμά σας...",
    greeting: "Γεια σας! Είμαι ένας βοηθός τεχνητής νοημοσύνης. Μπορώ να απαντήσω σε ερωτήσεις σχετικά με τις υπηρεσίες μας AI, τα οφέλη και τη διαδικασία υλοποίησης. Πώς μπορώ να σας βοηθήσω σήμερα;",
    contactOfferTrigger: "επικοινωνήστε με την ομάδα υποστήριξής μας",
    contactInitiate: "Μπορώ να σας συνδέσω με την ομάδα. Ποιο είναι το ονοματεπώνυμό σας;",
    contactNamePrompt: "Ευχαριστώ, {name}. Ποιο είναι το όνομα της εταιρείας σας; (Μπορείτε να πείτε 'παράλειψη')",
    contactCompanyPrompt: "Κατανοητό. Ποια είναι η διεύθυνση email σας;",
    contactEmailInvalid: "Αυτό δεν φαίνεται σωστό. Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email.",
    contactEmailPrompt: "Τέλεια. Και ο αριθμός τηλεφώνου σας; (Μπορείτε να πείτε 'παράλειψη')",
    contactSuccess: "Ευχαριστώ, {name}! Το μήνυμά σας έχει σταλεί. Ένα μέλος της ομάδας θα επικοινωνήσει μαζί σας σύντομα.",
    genericError: "Αντιμετωπίζω προβλήματα σύνδεσης αυτήν τη στιγμή. Παρακαλώ δοκιμάστε ξανά αργότερα.",
    contactFlowError: "Αντιμετωπίζω ένα μικρό πρόβλημα αυτή τη στιγμή. Παρακαλώ δοκιμάστε ξανά σε λίγο.",
    affirmativeResponses: "ναι, σίγουρα, εντάξει, οκ",
    contactTriggers: "επαφή, βοήθεια, υποστήριξη, μιλήστε με έναν άνθρωπο, email",
    skip: "παράλειψη"
  }
};
