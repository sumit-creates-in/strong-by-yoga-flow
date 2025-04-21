-- Create admin function to update user password
create or replace function admin_update_user_password(user_id uuid, new_password text)
returns void
language plpgsql
security definer
as $$
begin
  -- Verify the user exists
  if not exists (select 1 from auth.users where id = user_id) then
    raise exception 'User not found';
  end if;

  -- Update the user's password
  update auth.users
  set encrypted_password = crypt(new_password, gen_salt('bf'))
  where id = user_id;
end;
$$; 