-- Add UPDATE policies for tables that are missing them

CREATE POLICY "Users can update their own food entries" 
ON public.food_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise entries" 
ON public.exercise_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight entries" 
ON public.weight_entries 
FOR UPDATE 
USING (auth.uid() = user_id);