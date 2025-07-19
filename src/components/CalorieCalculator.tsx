import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Target } from 'lucide-react';

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
}

const CalorieCalculator = () => {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);

  const addEntry = () => {
    if (foodName.trim() && calories.trim() && !isNaN(Number(calories))) {
      const newEntry: FoodEntry = {
        id: Date.now().toString(),
        name: foodName.trim(),
        calories: Number(calories),
      };
      setEntries([...entries, newEntry]);
      setFoodName('');
      setCalories('');
    }
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addEntry();
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Summary Card */}
      <Card className="bg-gradient-stellar border-stellar-purple/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-4">
            <Target className="h-8 w-8 text-stellar-purple" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalCalories}</p>
              <p className="text-sm text-muted-foreground">Total Calories Today</p>
            </div>
          </div>
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
            disabled={!foodName.trim() || !calories.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </CardContent>
      </Card>

      {/* Food Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Entries ({entries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEntry(entry.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalorieCalculator;