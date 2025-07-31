import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Scale, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  unit: 'kg' | 'lbs';
  created_at?: string;
}

const WeightTracker = () => {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load weight entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!weight.trim() || isNaN(Number(weight))) return;
    
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .insert([{
          weight: Number(weight),
          date: new Date().toLocaleDateString(),
          unit: unit,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setEntries([data, ...entries]);
      setWeight('');
      toast({
        title: "Success",
        description: "Weight entry added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add weight entry",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const removeEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEntries(entries.filter(entry => entry.id !== id));
      toast({
        title: "Success",
        description: "Weight entry removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove weight entry",
        variant: "destructive",
      });
    }
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
    const diff = latest - previous;
    
    if (Math.abs(diff) < 0.1) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const trend = getWeightTrend();
  const currentWeight = entries.length > 0 ? entries[0] : null;

  return (
    <div className="space-y-6">
      {/* Weight Summary */}
      <Card className="bg-gradient-stellar border-stellar-purple/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-4">
            <Scale className="h-8 w-8 text-stellar-purple" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {currentWeight ? `${currentWeight.weight} ${currentWeight.unit}` : '--'}
              </p>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <p className="text-sm text-muted-foreground">Current Weight</p>
                {trend && (
                  <Badge variant={trend === 'up' ? 'destructive' : trend === 'down' ? 'default' : 'secondary'} className="text-xs">
                    {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                    {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                    {trend === 'stable' && <Minus className="h-3 w-3 mr-1" />}
                    {trend === 'stable' ? 'Stable' : trend === 'up' ? 'Increase' : 'Decrease'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Weight */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Log Weight</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="number"
              placeholder="Enter weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyPress={handleKeyPress}
              className="md:col-span-2"
            />
            <Select value={unit} onValueChange={(value: 'kg' | 'lbs') => setUnit(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={addEntry}
            className="w-full bg-gradient-nebula hover:opacity-90 transition-opacity"
            disabled={!weight.trim() || submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {submitting ? 'Logging...' : 'Log Weight'}
          </Button>
        </CardContent>
      </Card>

      {/* Weight History */}
      <Card>
        <CardHeader>
          <CardTitle>Weight History ({entries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No weight entries yet. Log your first weight above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border/50"
                >
                  <div className="flex items-center space-x-3">
                    <Scale className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        {entry.weight} {entry.unit}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {entry.date}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>
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