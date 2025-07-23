import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  unit: 'kg' | 'lbs';
}

const WeightTracker = () => {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const { toast } = useToast();

  const addEntry = () => {
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: WeightEntry = {
      id: crypto.randomUUID(),
      weight: Number(weight),
      date: new Date().toLocaleDateString(),
      unit,
    };

    setEntries(prev => [newEntry, ...prev]);
    setWeight('');
    
    toast({
      title: "Weight logged",
      description: `${weight} ${unit} added to your weight tracker.`,
    });
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: "Entry removed",
      description: "Weight entry has been deleted.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addEntry();
    }
  };

  const getWeightTrend = () => {
    if (entries.length < 2) return null;
    
    const latest = entries[0].weight;
    const previous = entries[1].weight;
    const difference = latest - previous;
    
    return {
      direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'same',
      amount: Math.abs(difference),
      unit: entries[0].unit
    };
  };

  const currentWeight = entries.length > 0 ? entries[0] : null;
  const trend = getWeightTrend();

  return (
    <div className="space-y-6">
      {/* Current Weight Summary */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Scale className="h-5 w-5" />
            Weight Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg border border-border/30">
              <p className="text-2xl font-bold text-cosmic-blue">
                {currentWeight ? `${currentWeight.weight} ${currentWeight.unit}` : 'No entries yet'}
              </p>
              <p className="text-sm text-muted-foreground">Current Weight</p>
            </div>
            
            {trend && (
              <div className="text-center p-4 bg-muted/20 rounded-lg border border-border/30">
                <div className="flex items-center justify-center gap-2">
                  {trend.direction === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  ) : trend.direction === 'down' ? (
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  ) : null}
                  <p className="text-lg font-semibold">
                    {trend.direction === 'same' ? 'No change' : `${trend.amount.toFixed(1)} ${trend.unit}`}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">From last entry</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Weight Entry */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Log Weight</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-background border-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'kg' | 'lbs')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={addEntry} 
                className="w-full bg-gradient-stellar hover:opacity-90"
              >
                Log Weight
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight History */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No weight entries yet. Start tracking your weight!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border border-border/30"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-cosmic-blue/20 rounded-full">
                      <Scale className="h-4 w-4 text-cosmic-blue" />
                    </div>
                    <div>
                      <p className="font-medium">{entry.weight} {entry.unit}</p>
                      <p className="text-sm text-muted-foreground">{entry.date}</p>
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

export default WeightTracker;