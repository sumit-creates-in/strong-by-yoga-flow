import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

export interface SupabaseFunctions {
  admin_update_user_password: {
    Args: {
      user_id: string;
      new_password: string;
    };
    Returns: void;
  };
  admin_update_user_role: {
    Args: {
      user_id: string;
      new_role: string;
    };
    Returns: void;
  };
} 