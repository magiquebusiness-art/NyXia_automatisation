interface Env { NYXIA_KV: KVNamespace; }

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { message?: string; history?: any[]; userName?: string; agent?: string };
    const { message, history = [], userName = '', agent = 'general' } = body;
    
    // Simulated responses for now - will connect OpenRouter later
    const responses: Record<string, string[]> = {
      general: [
        `Salut ${userName} ! 💜 Je suis NyXia, ton agente IA spécialisée en automatisation des réseaux sociaux.\n\nJe peux t'aider à :\n- **Créer du contenu** pour tes réseaux sociaux\n- **Planifier tes publications** sur Facebook, Instagram, TikTok et YouTube\n- **Optimiser ton engagement** avec des stratégies adaptées\n- **Automatiser** ta présence en ligne 24/7\n\nDis-moi, quel est ton projet du moment ?`,
        `Excellente question ${userName} ! 🚀\n\nPour maximiser ta présence sur les réseaux sociaux, voici ma recommandation :\n\n1. **Publie régulièrement** — au moins 2-3 fois par jour\n2. **Varie les formats** — images, vidéos, stories, carrousels\n3. **Engage avec ton audience** — réponds aux commentaires dans l'heure\n4. **Utilise les bons hashtags** — mélange populaire et niche\n\nVeux-tu que je t'aide à créer un calendrier de contenu ?`,
        `${userName}, laisse-moi te dire quelque chose d'important : **la constance bat le talent** sur les réseaux sociaux. 💪\n\nLes comptes qui réussissent sont ceux qui publient **tous les jours**, pas ceux qui postent un chef-d'œuvre une fois par mois.\n\nAvec NyXia, tu n'as plus à te soucier de la constance. Je m'en occupe pour toi. Tu veux voir comment ça marche ?`,
      ],
      copywriter: [
        `✍️ Mode Copywriter activé !\n\nJe vais t'aider à créer des textes qui **stoppent le scroll** et **convertisent**.\n\nDonne-moi ton sujet et ta plateforme cible, et je te rédige un post qui tue.`,
      ],
      strategiste: [
        `🎯 Mode Stratège Contenu activé !\n\nJe vais analyser ton audience et te proposer une **stratégie de contenu** sur mesure.\n\nDis-moi : quel est ton secteur d'activité et qui est ton client idéal ?`,
      ]
    };
    
    const agentResponses = responses[agent] || responses.general;
    const content = agentResponses[Math.floor(Math.random() * agentResponses.length)];
    
    return new Response(JSON.stringify({ content }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ content: 'Petite interruption... réessaie dans un instant 💜' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
