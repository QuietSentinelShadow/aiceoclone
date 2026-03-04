// TTS voice configuration for edge-tts
export const TTS_VOICES = {
  friendly: "en-US-JennyNeural",
  professional: "en-US-GuyNeural",
  energetic: "en-US-AriaNeural",
  narrator: "en-US-ChristopherNeural",
  tutorial: "en-US-BrianNeural",
} as const;

export type VoiceKey = keyof typeof TTS_VOICES;

export interface AudioSegment {
  id: string;
  text: string;
  voice: string;
  rate?: string;
  pitch?: string;
}
