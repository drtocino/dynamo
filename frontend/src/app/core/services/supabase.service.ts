import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private readonly supabaseUrl = 'https://placeholder-project.supabase.co';
  private readonly supabaseAnonKey = 'placeholder-anon-key';

  constructor() {
    try {
      this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);
    } catch (e) {
      console.warn('Supabase client initialized with fallback credentials', e);
    }
  }

  getClient(): SupabaseClient | null {
    return this.supabase;
  }

  getChannel(channelName: string): RealtimeChannel | null {
    if (!this.supabase) return null;
    return this.supabase.channel(channelName);
  }
}
