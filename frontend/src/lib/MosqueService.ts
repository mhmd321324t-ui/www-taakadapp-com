/**
 * MosqueService - Global mosque state management with instant propagation
 * When a mosque is selected, ALL consumers update instantly via custom events
 */

const SAVED_MOSQUE_KEY = 'selected_mosque';
const ATHAN_SOUND_KEY = 'selected_athan_sound';
const MADHAB_KEY = 'selected_madhab';

export interface MosqueData {
  osm_id: string;
  mawaqit_uuid?: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  hasMawaqit?: boolean;
  method?: number;
  school?: number;
}

export type AthanSound = 'makkah' | 'madinah' | 'alaqsa' | 'mishary' | 'default';

export interface MosqueChangeEvent {
  mosque: MosqueData | null;
  athanSound: AthanSound;
  madhab: number; // 0 = Shafi/Maliki/Hanbali, 1 = Hanafi
}

const MOSQUE_CHANGE_EVENT = 'mosque-state-change';

class MosqueServiceClass {
  private listeners: Set<(event: MosqueChangeEvent) => void> = new Set();

  /** Get currently saved mosque */
  getMosque(): MosqueData | null {
    try {
      const saved = localStorage.getItem(SAVED_MOSQUE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  /** Get selected athan sound */
  getAthanSound(): AthanSound {
    return (localStorage.getItem(ATHAN_SOUND_KEY) as AthanSound) || 'default';
  }

  /** Get selected madhab (juristic school) */
  getMadhab(): number {
    const saved = localStorage.getItem(MADHAB_KEY);
    return saved ? parseInt(saved, 10) : 0;
  }

  /** Select a mosque - instantly propagates to all consumers */
  selectMosque(mosque: MosqueData): void {
    localStorage.setItem(SAVED_MOSQUE_KEY, JSON.stringify(mosque));
    this.emit();
  }

  /** Unlink current mosque - instantly reverts to auto mode */
  unlinkMosque(): void {
    const mosque = this.getMosque();
    if (mosque?.osm_id) {
      // Clean up cached times
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('mosque_times_' + mosque.osm_id) ||
            key?.startsWith('mosque_live_' + mosque.osm_id) ||
            key?.startsWith('mosque_diffs_' + mosque.osm_id)) {
          localStorage.removeItem(key);
        }
      }
    }
    localStorage.removeItem(SAVED_MOSQUE_KEY);
    this.emit();
  }

  /** Set athan sound - instantly propagates */
  setAthanSound(sound: AthanSound): void {
    localStorage.setItem(ATHAN_SOUND_KEY, sound);
    this.emit();
  }

  /** Set madhab (juristic school) - instantly propagates */
  setMadhab(madhab: number): void {
    localStorage.setItem(MADHAB_KEY, String(madhab));
    this.emit();
  }

  /** Subscribe to mosque state changes */
  subscribe(listener: (event: MosqueChangeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Get current full state */
  getState(): MosqueChangeEvent {
    return {
      mosque: this.getMosque(),
      athanSound: this.getAthanSound(),
      madhab: this.getMadhab(),
    };
  }

  private emit(): void {
    const state = this.getState();
    // Notify in-memory listeners
    this.listeners.forEach(fn => fn(state));
    // Broadcast across tabs
    window.dispatchEvent(new CustomEvent(MOSQUE_CHANGE_EVENT, { detail: state }));
  }
}

export const MosqueService = new MosqueServiceClass();
export { MOSQUE_CHANGE_EVENT };
