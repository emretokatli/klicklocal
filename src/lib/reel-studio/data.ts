import type { ReelBusinessNiche, ReelScriptData, ReelSoundStyle } from './types';

export const REEL_BUSINESS_NICHES: ReelBusinessNiche[] = [
  {
    id: 'cafe',
    name: 'Café & Bakery',
    nameDe: 'Café & Bäckerei',
    category: 'Gastronomy',
    image1:
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=640&q=80',
    image4:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'boutique',
    name: 'Fashion Boutique',
    nameDe: 'Mode-Boutique',
    category: 'Retail',
    image1:
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=640&q=80',
    image4:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'salon',
    name: 'Hair & Beauty Salon',
    nameDe: 'Friseur- & Kosmetiksalon',
    category: 'Services',
    image1:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=640&q=80',
    image4:
      'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'fitness',
    name: 'Fitness Coach & Gyms',
    nameDe: 'Personal Trainer & Fitness',
    category: 'Health & Sports',
    image1:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=640&q=80',
    image4:
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'craft',
    name: 'Craftsman & Workshop',
    nameDe: 'Handwerker & Werkstatt',
    category: 'Local Crafts',
    image1:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=640&q=80',
    image4:
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=640&q=80',
  },
];

export const REEL_SOUND_STYLES: ReelSoundStyle[] = [
  { id: 'energetic', name: 'Upbeat Electro Beat', tempo: 128 },
  { id: 'chill-tech', name: 'Chill Lo-Fi Tech', tempo: 90 },
  { id: 'punchy-pop', name: 'Punchy Funk Pop', tempo: 115 },
];

export const INITIAL_REEL_SCRIPTS: Record<'de' | 'en', ReelScriptData> = {
  de: {
    scene1Hook: 'Social Media klaut dir Zeit?',
    scene2Solution: 'Triff deinen KI-Copilot.',
    scene3Features: 'Erstellen. Planen. Antworten. — alles an einem Ort.',
    scene4Tagline: 'Dein KI-Copilot für Content, Planung und Antworten.',
    scene4Cta: 'Gratis testen — Link in Bio',
    socialCaption:
      'Hand aufs Herz: Verbringst du als lokales Unternehmen auch zu viel Zeit mit Social Media? ⏰🤯 Mit Klicklocal erstellst du Posts, planst deinen Feed und beantwortest DMs mit KI — alles in einem Cockpit.',
    hashtags: [
      '#klicklocal',
      '#kicopilot',
      '#socialmediatipps',
      '#lokalmarketing',
      '#kmu',
    ],
  },
  en: {
    scene1Hook: 'Social Media stealing your time?',
    scene2Solution: 'Meet your AI copilot.',
    scene3Features: 'Create. Plan. Reply. — all in one place.',
    scene4Tagline: 'Your AI copilot for content, planning and replies.',
    scene4Cta: 'Try it free — link in bio',
    socialCaption:
      'Are you spending too much time keeping your local business visible online? Klicklocal drafts content, schedules your feed, and replies with friendly AI.',
    hashtags: [
      '#klicklocal',
      '#aicopilot',
      '#smallbizowners',
      '#localmarketing',
    ],
  },
};
