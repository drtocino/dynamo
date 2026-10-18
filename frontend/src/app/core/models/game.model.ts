export type MultiplayerMode = 'RoomBased' | 'SharedScreen' | 'BiblicalRoulette';

export interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  supportedModes: MultiplayerMode[];
  settingsSchemaJson?: string;
  language?: string;
}
