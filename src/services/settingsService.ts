import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Service for managing application settings stored in the database
export const settingsService = {
  /**
   * Get a setting by key
   * @param key The setting key
   * @returns The setting value as JSON or null if not found
   */
  async getSetting(key: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .single();
      
      if (error) {
        console.error('Error getting setting:', error);
        return null;
      }
      
      return data?.value || null;
    } catch (error) {
      console.error('Exception in getSetting:', error);
      return null;
    }
  },
  
  /**
   * Save or update a setting
   * @param key The setting key
   * @param value The value to save (will be stored as JSON)
   * @returns True if successful, false otherwise
   */
  async saveSetting(key: string, value: any): Promise<boolean> {
    try {
      // First, check if the setting exists
      const { data: existingData, error: getError } = await supabase
        .from('app_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();
      
      if (getError) {
        console.error('Error checking for existing setting:', getError);
        return false;
      }
      
      if (existingData) {
        // Update the existing setting
        const { error: updateError } = await supabase
          .from('app_settings')
          .update({ 
            value, 
            updated_at: new Date().toISOString() 
          })
          .eq('key', key);
        
        if (updateError) {
          console.error('Error updating setting:', updateError);
          return false;
        }
      } else {
        // Insert a new setting
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({ 
            key, 
            value, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          });
        
        if (insertError) {
          console.error('Error inserting setting:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Exception in saveSetting:', error);
      return false;
    }
  },
  
  /**
   * Delete a setting
   * @param key The setting key to delete
   * @returns True if successful, false otherwise
   */
  async deleteSetting(key: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_settings')
        .delete()
        .eq('key', key);
      
      if (error) {
        console.error('Error deleting setting:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception in deleteSetting:', error);
      return false;
    }
  }
}; 