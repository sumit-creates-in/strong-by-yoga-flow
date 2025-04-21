export interface SupabaseFunctions {
  admin_update_user_password: (args: { user_id: string; new_password: string }) => void;
}

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
    Enums: {
      [key: string]: any;
    };
    Functions: SupabaseFunctions;
  };
} 