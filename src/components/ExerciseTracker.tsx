import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Dumbbell, Target, Loader2, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ExerciseChart from './ExerciseChart';
import EditEntryDialog from './EditEntryDialog';

interface ExerciseSet {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  created_at?: string;
}

const ExerciseTracker = () => {
  const [exercises, setExercises] = useState<ExerciseSet[]>([]);
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseSet | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('exercise_entries')
        .select('*')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exercises",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addExercise = async () => {
    if (!exerciseName.trim() || !sets.trim() || !reps.trim() || !weight.trim() ||
        isNaN(Number(sets)) || isNaN(Number(reps)) || isNaN(Number(weight))) return;
    
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('exercise_entries')
        .insert([{
          exercise: exerciseName.trim(),
          sets: Number(sets),
          reps: Number(reps),
          weight: Number(weight),
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setExercises([data, ...exercises]);
      setExerciseName('');
      setSets('');
      setReps('');
      setWeight('');
      toast({
        title: "Success",
        description: "Exercise added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add exercise",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const removeExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exercise_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setExercises(exercises.filter(exercise => exercise.id !== id));
      toast({
        title: "Success",
        description: "Exercise removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove exercise",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addExercise();
    }
  };

  const updateExercise = async (values: Record<string, string | number>) => {
    if (!editingExercise) return;

    try {
      const { error } = await supabase
        .from('exercise_entries')
        .update({
          exercise: String(values.exercise),
          sets: Number(values.sets),
          reps: Number(values.reps),
          weight: Number(values.weight),
        })
        .eq('id', editingExercise.id);

      if (error) throw error;

      setExercises(exercises.map(ex =>
        ex.id === editingExercise.id
          ? { ...ex, exercise: String(values.exercise), sets: Number(values.sets), reps: Number(values.reps), weight: Number(values.weight) }
          : ex
      ));
      toast({
        title: "Success",
        description: "Exercise updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exercise",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Calculate workout summary
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const totalVolume = exercises.reduce((sum, exercise) => sum + (exercise.sets * exercise.reps * exercise.weight), 0);

  return (
    <div className="space-y-6">
      {/* Workout Summary with Chart */}
      <Card className="bg-gradient-stellar border-stellar-purple/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-6 mb-6">
            <Target className="h-8 w-8 text-stellar-purple" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalSets}</p>
              <p className="text-sm text-muted-foreground">Total Sets</p>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalVolume.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Total Volume (lbs)</p>
            </div>
          </div>
          <ExerciseChart />
        </CardContent>
      </Card>

      {/* Add Exercise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add Exercise</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Exercise name"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Input
              type="number"
              placeholder="Sets"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Input
              type="number"
              placeholder="Reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Input
              type="number"
              placeholder="Weight (lbs)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button 
            onClick={addExercise}
            className="w-full md:col-span-4 bg-gradient-nebula hover:opacity-90 transition-opacity"
            disabled={!exerciseName.trim() || !sets.trim() || !reps.trim() || !weight.trim() || submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {submitting ? 'Adding...' : 'Add Exercise'}
          </Button>
        </CardContent>
      </Card>

      {/* Exercise Log */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Log ({exercises.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No exercises logged yet. Add your first exercise above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border/50"
                >
                  <div className="flex items-center space-x-3">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{exercise.exercise}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {exercise.sets} sets
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {exercise.reps} reps
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {exercise.weight} lbs
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingExercise(exercise)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExercise(exercise.id)}
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

      {editingExercise && (
        <EditEntryDialog
          open={!!editingExercise}
          onOpenChange={(open) => !open && setEditingExercise(null)}
          title="Exercise"
          fields={[
            { name: 'exercise', label: 'Exercise', type: 'text' },
            { name: 'sets', label: 'Sets', type: 'number' },
            { name: 'reps', label: 'Reps', type: 'number' },
            { name: 'weight', label: 'Weight (lbs)', type: 'number' },
          ]}
          initialValues={{
            exercise: editingExercise.exercise,
            sets: editingExercise.sets,
            reps: editingExercise.reps,
            weight: editingExercise.weight,
          }}
          onSave={updateExercise}
        />
      )}
    </div>
  );
};

export default ExerciseTracker;