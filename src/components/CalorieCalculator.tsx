import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Target, Loader2, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CalorieChart from './CalorieChart';
import EditEntryDialog from './EditEntryDialog';

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  created_at?: string;
}

const CalorieCalculator = () => {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const { toast } = useToast();

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load food entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!foodName.trim() || !calories.trim() || isNaN(Number(calories))) return;
    
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('food_entries')
        .insert([{
          name: foodName.trim(),
          calories: Number(calories),
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setEntries([data, ...entries]);
      setFoodName('');
      setCalories('');
      toast({
        title: "Success",
        description: "Food entry added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add food entry",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const removeEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEntries(entries.filter(entry => entry.id !== id));
      toast({
        title: "Success",
        description: "Food entry removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove food entry",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addEntry();
    }
  };

  const updateEntry = async (values: Record<string, string | number>) => {
    if (!editingEntry) return;

    try {
      const { error } = await supabase
        .from('food_entries')
        .update({
          name: String(values.name),
          calories: Number(values.calories),
        })
        .eq('id', editingEntry.id);

      if (error) throw error;

      setEntries(entries.map(entry =>
        entry.id === editingEntry.id
          ? { ...entry, name: String(values.name), calories: Number(values.calories) }
          : entry
      ));
      toast({
        title: "Success",
        description: "Food entry updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update food entry",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Summary with Chart */}
      <Card className="bg-gradient-stellar border-stellar-purple/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Target className="h-8 w-8 text-stellar-purple" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalCalories}</p>
              <p className="text-sm text-muted-foreground">Total Calories Today</p>
            </div>
          </div>
          <CalorieChart />
        </CardContent>
      </Card>

      {/* Add Food Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add Food Entry</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Food name (e.g., Apple)"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="md:col-span-2"
            />
            <Input
              type="number"
              placeholder="Calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button 
            onClick={addEntry}
            className="w-full bg-gradient-nebula hover:opacity-90 transition-opacity"
            disabled={!foodName.trim() || !calories.trim() || submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {submitting ? 'Adding...' : 'Add Entry'}
          </Button>
        </CardContent>
      </Card>

      {/* Food Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Entries ({entries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No entries yet. Add your first food item above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border/50"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-foreground">{entry.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {entry.calories} cal
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingEntry(entry)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(entry.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingEntry && (
        <EditEntryDialog
          open={!!editingEntry}
          onOpenChange={(open) => !open && setEditingEntry(null)}
          title="Food Entry"
          fields={[
            { name: 'name', label: 'Food Name', type: 'text' },
            { name: 'calories', label: 'Calories', type: 'number' },
          ]}
          initialValues={{
            name: editingEntry.name,
            calories: editingEntry.calories,
          }}
          onSave={updateEntry}
        />
      )}
    </div>
  );
};

export default CalorieCalculator;