import { NextRequest, NextResponse } from 'next/server';

/* ------------------------------------------------------------------ */
/*  POST /api/chat                                                     */
/*  Receives a user message and returns an AI response using           */
/*  z-ai-web-dev-sdk LLM skill.                                       */
/* ------------------------------------------------------------------ */

interface ChatRequestBody {
  message: string;
  history: { role: string; content: string }[];
  userName: string;
  agent: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  nyxia: `Tu es NyXia, une agente IA spécialisée en marketing digital et conversion. Tu es chaleureuse, professionnelle et toujours encourageante. Tu parles en français. Tu aides les entrepreneurs à développer leur business en ligne avec des stratégies marketing efficaces. Tu utilises occasionnellement ✦ pour décorer tes réponses. Tes réponses sont concises mais complètes. Tu t'adresses toujours au tutoiement.`,
  copywriter: `Tu es un expert en copywriting et rédaction persuasive. Tu es spécialisé dans la création de textes de vente, pages de capture, séquences d'emails et tout contenu visant à convertir. Tu parles en français. Tu es direct, percutant et tu connais les techniques de persuasion les plus efficaces. Tu utilises le tutoiement.`,
  formation: `Tu es un expert en création de formations en ligne. Tu aides à structurer des programmes éducatifs, créer des parcours d'apprentissage engageants et optimiser la transmission de connaissances. Tu parles en français. Tu es pédagogue et méthodique. Tu utilises le tutoiement.`,
  seo: `Tu es un expert en SEO et optimisation de contenu pour les moteurs de recherche. Tu aides à améliorer le référencement naturel, trouver des mots-clés pertinents et optimiser le contenu web. Tu parles en français. Tu es analytique et data-driven. Tu utilises le tutoiement.`,
};

const FALLBACK_RESPONSES = [
  "C'est une excellente question ! ✦ Laisse-moi te guider étape par étape pour t'aider à avancer sur ce sujet. N'hésite pas à me donner plus de détails pour que je puisse affiner ma réponse.",
  "Je comprends ton besoin ! ✦ Voici ce que je te recommande : commence par définir clairement ton objectif, puis identifie les actions prioritaires. Veux-tu qu'on approfondisse ensemble ?",
  "Super projet ! ✦ Je vois plusieurs opportunités pour toi. Pour te donner les meilleurs conseils, pourrais-tu m'en dire plus sur ton marché cible et tes objectifs principaux ?",
  "Intéressant ! ✦ D'après mon analyse, voici les points clés à considérer. Si tu veux qu'on détaille un aspect en particulier, dis-le moi !",
  "Très bonne démarche ! ✦ Je vais t'aider à structurer ça proprement. On va prendre ça étape par étape pour que tout soit clair et actionnable.",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequestBody;
    const { message, history, userName, agent } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 },
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[agent] || SYSTEM_PROMPTS.nyxia;
    const personalizedPrompt = userName
      ? systemPrompt + `\n\nLe nom de l'utilisateur est ${userName}. Adapte tes réponses en l'appelant par son prénom quand c'est pertinent.`
      : systemPrompt;

    // Build messages array for LLM
    const messages = [
      { role: 'assistant' as const, content: personalizedPrompt },
      ...history.slice(-10).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Try using the z-ai-web-dev-sdk LLM
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      });

      const reply = completion.choices[0]?.message?.content;

      if (reply && reply.trim().length > 0) {
        return NextResponse.json({ content: reply });
      }
    } catch (sdkError) {
      console.error('LLM SDK error, using fallback:', sdkError);
    }

    // Fallback to simulated response
    const simulatedReply = generateSimulatedReply(message, userName, agent);
    return NextResponse.json({ content: simulatedReply });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}

function generateSimulatedReply(message: string, userName: string, agent: string): string {
  const name = userName || 'cher entrepreneur';
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('site') || lowerMsg.includes('web') || lowerMsg.includes('créer')) {
    return `Super initiative ${name} ! ✦ Pour créer un site efficace, je te recommande de :\n\n1. **Définir ton objectif principal** — Vente, prise de rendez-vous, vitrine ?\n2. **Identifier ton audience cible** — Qui sont tes clients idéaux ?\n3. **Choisir une structure claire** — Page d'accueil, offres, témoignages, contact\n4. **Rédiger un copy persuasif** — Chaque mot doit servir la conversion\n\nVeux-tu qu'on travaille ensemble sur la structure de ton site ? 🚀`;
  }

  if (lowerMsg.includes('client') || lowerMsg.includes('prospects') || lowerMsg.includes('vente')) {
    return `Excellente question ${name} ! ✦ Pour attirer plus de clients, voici ma stratégie :\n\n1. **Optimise ton offre** — Rends-la irrésistible avec une proposition de valeur claire\n2. **Crée du contenu à valeur ajoutée** — Éduque ton audience pour établir ton autorité\n3. **Utilise les réseaux sociaux stratégiquement** — Pas besoin d'être partout, choisis ceux de ton audience\n4. **Mets en place un système de suivi** — Ne laisse jamais un prospect sans réponse\n\nQuel aspect veux-tu approfondir en premier ? 💎`;
  }

  if (lowerMsg.includes('publication') || lowerMsg.includes('réseaux') || lowerMsg.includes('social')) {
    return `Les réseaux sociaux, c'est un art ${name} ! ✦ Voici ma méthode :\n\n1. **Crée un calendrier éditorial** — La régularité est la clé\n2. **Alterne les formats** — Carrousels, vidéos, stories, lives\n3. **Raconte des histoires** — Le storytelling convertit mieux que la vente directe\n4. **Engage ta communauté** — Réponds à chaque commentaire, crée du dialogue\n\nJe peux t'aider à créer ta stratégie de contenu ! 📱`;
  }

  if (lowerMsg.includes('offre') || lowerMsg.includes('structur') || lowerMsg.includes('prix')) {
    return `Structurer son offre, c'est crucial ${name} ! ✦ Voici comment faire :\n\n1. **Définis ta transformation** — Qu'est-ce que ton client obtient concrètement ?\n2. **Crée des niveaux** — Offre de base, premium, VIP\n3. **Ajoute des bonus** — Augmente la valeur perçue sans surcoût\n4. **Rends-la visuelle** — Une page d'offre claire convertit 3x plus\n\nOn peut structurer ton offre ensemble si tu veux ! 💎`;
  }

  if (agent === 'copywriter') {
    return `En tant que copywriter, voici mon analyse ✦\n\nPour un texte qui convertit, applique la méthode AIDA :\n\n- **Attention** — Accroche immédiatement avec une promesse forte\n- **Intérêt** — Développe en montrant que tu comprends le problème\n- **Désir** — Peins le résultat que ton client veut atteindre\n- **Action** — Un call-to-action clair et sans ambiguïté\n\nTu veux que je t'écrive un exemple de copy pour ton activité ? ✍️`;
  }

  if (agent === 'formation') {
    return `Pour créer une formation efficace ✦\n\nVoici la structure que je recommande :\n\n1. **Module d'introduction** — Résultat attendu et plan de route\n2. **Modules de fond** — Un concept = un module, progressif\n3. **Exercices pratiques** — L'apprentissage passe par l'action\n4. **Module de conclusion** — Récapitulatif et prochaines étapes\n\nChaque module devrait être consommable en 15-20 min. Veux-tu qu'on structure ta formation ? 🎓`;
  }

  if (agent === 'seo') {
    return `Pour le SEO ✦\n\nMon approche en 4 étapes :\n\n1. **Recherche de mots-clés** — Identifie les requêtes de ton audience\n2. **Optimisation on-page** — Titres, méta-descriptions, structure H1-H6\n3. **Contenu de qualité** — Google récompense le contenu qui apporte de la valeur\n4. **Backlinks** — Construis ton autorité avec des liens entrants qualitatifs\n\nTu veux qu'on analyse ta stratégie SEO actuelle ? 🔍`;
  }

  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}
