export type ReelScriptData = {
  scene1Hook: string;
  scene2Solution: string;
  scene3Features: string;
  scene4Tagline: string;
  scene4Cta: string;
  socialCaption: string;
  hashtags: string[];
};

export type PlatformOverlay = 'none' | 'instagram' | 'tiktok';

export type ReelBusinessNiche = {
  id: string;
  name: string;
  nameDe: string;
  category: string;
  image1: string;
  image4: string;
};

export type ReelSoundStyle = {
  id: string;
  name: string;
  tempo: number;
};

export type ReelTone = 'energetic' | 'humorous' | 'pain-point' | 'professional';

export type ReelLanguage = 'de' | 'en';
