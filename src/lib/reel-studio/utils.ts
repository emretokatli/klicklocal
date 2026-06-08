import type { AiGeneration, BusinessProfile } from '@/types/api';
import { de } from '@/lib/i18n/de';

import { INITIAL_REEL_SCRIPTS, REEL_BUSINESS_NICHES } from './data';
import type {
  ReelBusinessNiche,
  ReelLanguage,
  ReelScriptData,
  ReelTone,
} from './types';

const BUSINESS_TYPE_NICHE: Record<string, ReelBusinessNiche['id']> = {
  restaurant: 'cafe',
  cafe: 'cafe',
  bar: 'cafe',
  bakery: 'cafe',
  barber: 'salon',
  beauty: 'salon',
  nails: 'salon',
  fitness: 'fitness',
  retail: 'boutique',
  handcraft: 'craft',
  hotel: 'craft',
  other: 'cafe',
};

export function resolveNicheFromBusinessType(
  businessType: string | null | undefined,
): ReelBusinessNiche {
  if (!businessType?.trim()) {
    return REEL_BUSINESS_NICHES[0];
  }

  const normalized = businessType.trim().toLowerCase();

  for (const [key, label] of Object.entries(de.business.types)) {
    if (key === normalized || label.toLowerCase() === normalized) {
      const nicheId = BUSINESS_TYPE_NICHE[key] ?? 'cafe';
      return (
        REEL_BUSINESS_NICHES.find((niche) => niche.id === nicheId) ??
        REEL_BUSINESS_NICHES[0]
      );
    }
  }

  return REEL_BUSINESS_NICHES[0];
}

function firstSentence(text: string, max = 50): string {
  const sentence = text.split(/[.!?\n]/).find((part) => part.trim())?.trim();
  return (sentence ?? text).slice(0, max);
}

export function mapGenerationToReelScript(
  generation: AiGeneration,
  language: ReelLanguage,
): ReelScriptData {
  const base = INITIAL_REEL_SCRIPTS[language];
  const caption = generation.caption.trim();
  const story = generation.story_text?.trim() ?? '';
  const cta = generation.call_to_action?.trim() ?? base.scene4Cta;

  return {
    scene1Hook: firstSentence(story || caption, 50) || base.scene1Hook,
    scene2Solution: firstSentence(caption, 60) || base.scene2Solution,
    scene3Features: cta.slice(0, 65) || base.scene3Features,
    scene4Tagline: firstSentence(caption, 80) || base.scene4Tagline,
    scene4Cta: cta.slice(0, 40) || base.scene4Cta,
    socialCaption: caption || base.socialCaption,
    hashtags:
      generation.hashtags && generation.hashtags.length > 0
        ? generation.hashtags
        : base.hashtags,
  };
}

export function buildReelPrompt(options: {
  language: ReelLanguage;
  tone: ReelTone;
  profile: BusinessProfile;
}): string {
  const business = options.profile.business_name;

  const toneMap: Record<ReelTone, string> = {
    energetic: options.language === 'de' ? 'hochenergetisch & viral' : 'high-energy & viral',
    humorous: options.language === 'de' ? 'humorvoll & locker' : 'humorous & casual',
    'pain-point': options.language === 'de' ? 'problemfokussiert' : 'problem-focused',
    professional: options.language === 'de' ? 'professionell & vertrauensvoll' : 'professional & trustworthy',
  };

  const profileBits = [
    options.profile.business_type &&
      `${options.language === 'de' ? 'Branche' : 'Industry'}: ${options.profile.business_type}`,
    options.profile.city &&
      `${options.language === 'de' ? 'Stadt' : 'City'}: ${options.profile.city}`,
    options.profile.description &&
      `${options.language === 'de' ? 'Beschreibung' : 'Description'}: ${options.profile.description}`,
    options.profile.tone_of_voice &&
      `${options.language === 'de' ? 'Markenstimme' : 'Brand voice'}: ${options.profile.tone_of_voice}`,
    options.profile.products_services &&
      `${options.language === 'de' ? 'Angebot' : 'Offer'}: ${options.profile.products_services}`,
  ]
    .filter(Boolean)
    .join('. ');

  if (options.language === 'de') {
    return [
      `Erstelle Content für ein 15-Sekunden Instagram/TikTok Reel für "${business}".`,
      `Ton: ${toneMap[options.tone]}.`,
      profileBits,
      'Fokus: lokales Unternehmen, Klicklocal als KI-Copilot für Content, Planung und Antworten.',
    ]
      .filter(Boolean)
      .join(' ');
  }

  return [
    `Create content for a 15-second Instagram/TikTok reel for "${business}".`,
    `Tone: ${toneMap[options.tone]}.`,
    profileBits,
    'Focus: local business, Klicklocal as AI copilot for content, scheduling, and replies.',
  ]
    .filter(Boolean)
    .join(' ');
}

export function getFullReelScriptExport(options: {
  language: ReelLanguage;
  nicheLabel: string;
  script: ReelScriptData;
}): string {
  const { script, nicheLabel, language } = options;

  return `[Klicklocal — 15-Second Reel Script]
Niche: ${nicheLabel} (${language.toUpperCase()})

Scene 1 (0-3s) — Hook:
"${script.scene1Hook}"

Scene 2 (3-7s) — Solution:
"${script.scene2Solution}"

Scene 3 (7-11s) — Feature Highlight:
"${script.scene3Features}"

Scene 4 (11-15s) — Brand & CTA:
"${script.scene4Tagline}"
CTA Sticker: "${script.scene4Cta}"

--- Social Caption ---
${script.socialCaption}

--- Hashtags ---
${script.hashtags.join(' ')}`;
}

export function getSceneIndex(playTime: number): 1 | 2 | 3 | 4 {
  if (playTime < 3) return 1;
  if (playTime < 7) return 2;
  if (playTime < 11) return 3;
  return 4;
}
