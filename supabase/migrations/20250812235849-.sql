-- Add user_id columns to all tables to associate data with users
ALTER TABLE public.exercise_entries 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.food_entries 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.shopping_list_items 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.weight_entries 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on exercise_entries" ON public.exercise_entries;
DROP POLICY IF EXISTS "Allow all operations on food_entries" ON public.food_entries;
DROP POLICY IF EXISTS "Allow all operations on shopping_list_items" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Allow all operations on weight_entries" ON public.weight_entries;

-- Create secure RLS policies for exercise_entries
CREATE POLICY "Users can view their own exercise entries" 
ON public.exercise_entries 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise entries" 
ON public.exercise_entries 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise entries" 
ON public.exercise_entries 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise entries" 
ON public.exercise_entries 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create secure RLS policies for food_entries
CREATE POLICY "Users can view their own food entries" 
ON public.food_entries 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food entries" 
ON public.food_entries 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food entries" 
ON public.food_entries 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food entries" 
ON public.food_entries 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create secure RLS policies for shopping_list_items
CREATE POLICY "Users can view their own shopping list items" 
ON public.shopping_list_items 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping list items" 
ON public.shopping_list_items 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping list items" 
ON public.shopping_list_items 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping list items" 
ON public.shopping_list_items 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create secure RLS policies for weight_entries
CREATE POLICY "Users can view their own weight entries" 
ON public.weight_entries 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight entries" 
ON public.weight_entries 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight entries" 
ON public.weight_entries 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight entries" 
ON public.weight_entries 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);