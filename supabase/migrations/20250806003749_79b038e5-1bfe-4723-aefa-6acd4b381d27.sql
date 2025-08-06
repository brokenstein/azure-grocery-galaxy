-- Create food_entries table for calorie tracking
CREATE TABLE public.food_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise_entries table for workout tracking
CREATE TABLE public.exercise_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping_list_items table for shopping lists
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weight_entries table for weight tracking
CREATE TABLE public.weight_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  weight NUMERIC NOT NULL,
  date TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'lbs')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since no auth is implemented yet)
CREATE POLICY "Allow all operations on food_entries" ON public.food_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on exercise_entries" ON public.exercise_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on shopping_list_items" ON public.shopping_list_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on weight_entries" ON public.weight_entries FOR ALL USING (true) WITH CHECK (true);