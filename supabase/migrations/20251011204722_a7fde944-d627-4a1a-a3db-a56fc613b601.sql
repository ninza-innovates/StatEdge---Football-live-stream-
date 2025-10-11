-- Enable RLS on ai_summaries table  
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to AI summaries
CREATE POLICY "Allow public read access to AI summaries"
ON public.ai_summaries
FOR SELECT
TO public
USING (true);

-- Update function search paths for security
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$function$;