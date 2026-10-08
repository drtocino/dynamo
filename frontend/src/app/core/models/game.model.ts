export type MultiplayerMode = 'RoomBased' | 'SharedScreen';

export interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  supportedModes: MultiplayerMode[];
  settingsSchemaJson?: string;
}
