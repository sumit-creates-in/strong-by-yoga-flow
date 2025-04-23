# Migration Instructions for Adding Role Columns

Follow these steps to add the required columns to your profiles table:

1. Log in to your Supabase dashboard (https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. Create a new query
5. Paste the following SQL:

```sql
-- Add missing columns to profiles table for role management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_teacher BOOLEAN DEFAULT false;

-- Update existing profiles based on auth data
UPDATE public.profiles p
SET is_admin = true
FROM auth.users u
WHERE p.id = u.id AND (
  u.email = 'admin@strongbyyoga.com' OR 
  u.email = 'sumit_204@yahoo.com' OR
  (u.raw_user_meta_data->>'role')::text = 'admin'
);

UPDATE public.profiles p
SET is_teacher = true
FROM auth.users u
WHERE p.id = u.id AND (u.raw_user_meta_data->>'role')::text = 'teacher';
```

6. Run the query by clicking the "Run" button
7. Verify in the "Table Editor" that the profiles table now has the `is_admin` and `is_teacher` columns

## Creating the Role Update Function

If you want to also create a function to update roles with elevated privileges, run this SQL:

```sql
-- Create or replace the admin_update_user_role function
CREATE OR REPLACE FUNCTION public.admin_update_user_role(user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Update the user's metadata with the new role
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('role', new_role)
      ELSE
        raw_user_meta_data || jsonb_build_object('role', new_role)
    END
  WHERE id = user_id;
  
  -- Update profiles table for consistency
  IF new_role = 'admin' THEN
    UPDATE public.profiles
    SET is_admin = true, is_teacher = false
    WHERE id = user_id;
  ELSIF new_role = 'teacher' THEN
    UPDATE public.profiles
    SET is_teacher = true, is_admin = false
    WHERE id = user_id;
  ELSE
    UPDATE public.profiles
    SET is_admin = false, is_teacher = false
    WHERE id = user_id;
  END IF;
END;
$$;
```

8. Run this query to create the function

Once these steps are completed, your application should be able to change user roles successfully. 