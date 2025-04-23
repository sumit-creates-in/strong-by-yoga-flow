-- Create admin function to update user role
create or replace function admin_update_user_role(user_id uuid, new_role text)
returns void
language plpgsql
security definer
as $$
begin
  -- Verify the user exists
  if not exists (select 1 from auth.users where id = user_id) then
    raise exception 'User not found';
  end if;

  -- Update the user's metadata with the new role
  update auth.users
  set raw_user_meta_data = 
    case 
      when raw_user_meta_data is null then 
        jsonb_build_object('role', new_role)
      else
        raw_user_meta_data || jsonb_build_object('role', new_role)
    end
  where id = user_id;
  
  -- Update profiles table for consistency
  if new_role = 'admin' then
    update public.profiles
    set is_admin = true, is_teacher = false
    where id = user_id;
  elsif new_role = 'teacher' then
    update public.profiles
    set is_teacher = true, is_admin = false
    where id = user_id;
  else
    update public.profiles
    set is_admin = false, is_teacher = false
    where id = user_id;
  end if;
end;
$$; 