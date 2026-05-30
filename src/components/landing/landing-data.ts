export const HERO_STATS = [
  { value: '500+', label: 'Aktive Nutzer' },
  { value: '99,9 %', label: 'Verfügbarkeit' },
  { value: '4,9 ★', label: 'Bewertung' },
] as const;

export const PILLARS = [
  {
    icon: 'dashboard',
    title: 'Operative Übersicht',
    desc: 'Warteschlangen, Zeitpläne, Kanalstatus und Veröffentlichungsperformance – alles in einem Live-Dashboard.',
  },
  {
    icon: 'auto_awesome',
    title: 'KI-Produktionsschicht',
    desc: 'Erstelle Entwürfe, Captions, Post-Varianten und Medien – ohne den Workflow zu verlassen.',
  },
  {
    icon: 'groups',
    title: 'Team-fähige Steuerung',
    desc: 'Freigaben, Medien, Workspaces und Rollen – koordiniert in einem gemeinsamen System.',
  },
] as const;

export const OPERATIONS = [
  {
    tag: 'Content-System',
    title: 'Erstellen, verfeinern und vorbereiten – schneller.',
    desc: 'Verwandle Ideen in veröffentlichungsreife Inhalte mit KI, wiederverwendbaren Medien und einem klaren Entwurfs-Flow.',
    bullets: [
      'KI-Captions und Umformulierungen',
      'Post-Entwürfe und Review-Flow',
      'Medien suchen und anhängen',
      'Bulk-Vorbereitung für die Queue',
    ],
    icon: 'edit_note',
    accent: 'text-secondary',
  },
  {
    tag: 'Immer aktiv',
    title: 'Planung & Automatisierung',
    desc: 'Schiebe freigegebene Inhalte in Warteschlangen, Kalender und RSS-Automationen – sauber über alle Kanäle.',
    bullets: [
      'Kalender & Queue-Steuerung',
      'RSS-Automation & Evergreen-Loops',
      'Kanalbasierte Veröffentlichungsregeln',
      '24/7 Queue aktiv',
    ],
    icon: 'schedule',
    accent: 'text-primary',
  },
  {
    tag: 'Workspace',
    title: 'Assets & Team-Kontrolle',
    desc: 'Medien, Konten, Gruppen, Berechtigungen und Client-Workspaces – organisiert an einem Ort.',
    bullets: [
      'Gemeinsame Medienbibliothek',
      'Workspaces, Gruppen & Rechte',
      'Verbundene Konten zentral',
    ],
    icon: 'folder_shared',
    accent: 'text-tertiary',
  },
  {
    tag: 'Reporting',
    title: 'Einblicke nach der Veröffentlichung',
    desc: 'Sieh, was live geht, welche Queues aktiv bleiben und wie dein Team die Auslieferung verbessert.',
    bullets: [
      'Live-Übersicht der Aktivität',
      'Queue- & Workflow-Sichtbarkeit',
      'Performance-Signale pro Konto',
    ],
    icon: 'monitoring',
    accent: 'text-primary',
  },
] as const;

export const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Inputs sammeln',
    desc: 'Entwürfe, RSS-Feeds, Kanäle, Prompts und Medien an einem Ort bündeln.',
  },
  {
    step: '02',
    title: 'Generieren & verfeinern',
    desc: 'KI erzeugt Varianten und Captions – dein Team prüft und passt an.',
  },
  {
    step: '03',
    title: 'Planen & veröffentlichen',
    desc: 'Inhalte in Queues, Kalender und Automatisierungen über alle Kanäle schieben.',
  },
  {
    step: '04',
    title: 'Messen & optimieren',
    desc: 'Output beobachten, Abläufe stabilisieren und ohne Tool-Wechsel verbessern.',
  },
] as const;

export const INTEGRATIONS = [
  { name: 'Facebook', emoji: '📘' },
  { name: 'Instagram', emoji: '📸' },
  { name: 'LinkedIn', emoji: '💼' },
  { name: 'X', emoji: '𝕏' },
  { name: 'TikTok', emoji: '🎵' },
  { name: 'RSS Feeds', emoji: '📡' },
] as const;

export const SOCIAL_PROOF = [
  { value: '12 h', label: 'Wöchentlich gesparte Stunden' },
  { value: '3,4×', label: 'Schnelleres Kampagnen-Setup' },
  { value: '91 %', label: 'Teams mit klareren Abläufen' },
] as const;

export const FAQ_ITEMS = [
  {
    q: 'Wie funktioniert die tägliche Planung?',
    a: 'Du erstellst Posts im Dashboard, legst einen Veröffentlichungszeitpunkt fest und Klicklocal veröffentlicht automatisch über die Queue – inklusive Status (Entwurf, geplant, veröffentlicht, fehlgeschlagen).',
  },
  {
    q: 'Kann ich echte Kanäle später verbinden?',
    a: 'Ja. Verbinde Instagram, TikTok, Facebook und weitere Kanäle pro Workspace. Die Demo-Oberfläche zeigt den Flow; echte Konten richtest du nach der Anmeldung ein.',
  },
  {
    q: 'Was ist KI-Veröffentlichung?',
    a: 'Die KI erstellt Entwürfe, Captions und Hashtags aus deinen Prompts. Du behältst die Kontrolle: prüfen, anpassen, planen – dann veröffentlicht das System zur gewählten Zeit.',
  },
  {
    q: 'Kann ich geplante und fehlgeschlagene Posts einsehen?',
    a: 'Ja. Im Posts-Bereich siehst du alle Status inklusive „processing“, „scheduled“, „published“ und „failed“ mit Fehlergrund bei fehlgeschlagenen Veröffentlichungen.',
  },
  {
    q: 'Funktioniert das für Teams und Agenturen?',
    a: 'Mit Workspaces trennst du Marken und Kunden. Der Agency Mode bietet unbegrenzten Content und erweiterte Analysen für höheres Volumen.',
  },
] as const;

export const EXTRA_FEATURES = [
  {
    icon: 'dynamic_feed',
    color: 'text-secondary',
    title: 'Bulk-Veröffentlichung',
    desc: 'High-Volume-Workflows, Content wiederverwenden und Kampagnen über mehrere Kanäle am Laufen halten.',
  },
  {
    icon: 'rss_feed',
    color: 'text-tertiary',
    title: 'RSS-Automation',
    desc: 'Feeds in geplanten Social Content verwandeln – Evergreen-Schleifen mit minimalem Aufwand.',
  },
] as const;
