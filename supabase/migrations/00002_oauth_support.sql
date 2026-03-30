-- Allow x_handle to be empty for Google OAuth signups
ALTER TABLE public.profiles ALTER COLUMN x_handle DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN x_handle SET DEFAULT '';

-- Update trigger to handle OAuth provider metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _full_name TEXT;
  _x_handle TEXT;
  _avatar_url TEXT;
BEGIN
  -- full_name: try user_metadata first, then provider-specific fields
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );

  -- x_handle: try user_metadata, then Twitter/X provider username
  _x_handle := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'x_handle', ''),
    NULLIF(NEW.raw_user_meta_data->>'user_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'preferred_username', ''),
    ''
  );

  -- avatar_url from provider
  _avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  INSERT INTO public.profiles (id, email, full_name, x_handle, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    _full_name,
    _x_handle,
    _avatar_url
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
