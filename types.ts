
export interface RadioState {
  isPlaying: boolean;
  volume: number;
  currentTrack: string;
  isMuted: boolean;
}

export enum Page {
  HOME = 'home',
  ABOUT = 'about',
  CONTACT = 'contact'
}
