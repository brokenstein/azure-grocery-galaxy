import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Dumbbell } from 'lucide-react';

interface ExerciseSet {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

const ExerciseTracker = () => {
  const [exercises, setExercises] = useState<ExerciseSet[]>([]);
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const addExercise = () => {
    if (exerciseName.trim() && sets && reps && weight) {
      const newExercise: ExerciseSet = {
        id: Date.now().toString(),
        exercise: exerciseName.trim(),
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight),
      };
      setExercises([...exercises, newExercise]);
      setExerciseName('');
      setSets('');
      setReps('');
      setWeight('');
    }
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addExercise();
    }
  };

  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const totalVolume = exercises.reduce((sum, exercise) => sum + (exercise.sets * exercise.reps * exercise.weight), 0);

  return (
    <div className="space-y-6">
      {/* Workout Summary */}
      <Card className="bg-card/50 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Dumbbell className="h-5 w-5" />
            <span>Today's Workout</span>
          </CardTitle>
          <CardDescription>Track your exercise sets and volume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalSets}</div>
              <div className="text-sm text-muted-foreground">Total Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalVolume.toFixed(1)} lbs</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Exercise */}
      <Card className="bg-card/50 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle>Log Exercise</CardTitle>
          <CardDescription>Add a new exercise to your workout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise Name</Label>
              <Input
                id="exercise"
                placeholder="e.g., Bench Press"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                placeholder="3"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                placeholder="10"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="135"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
          <Button 
            onClick={addExercise} 
            className="w-full bg-gradient-stellar hover:opacity-90"
            disabled={!exerciseName.trim() || !sets || !reps || !weight}
          >
            Add Exercise
          </Button>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <Card className="bg-card/50 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle>Exercise Log</CardTitle>
          <CardDescription>Your workout history</CardDescription>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No exercises logged yet. Start your workout!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="flex-1">
                    <div className="font-medium">{exercise.exercise}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">{exercise.sets} sets</Badge>
                      <Badge variant="secondary">{exercise.reps} reps</Badge>
                      <Badge variant="secondary">{exercise.weight} lbs</Badge>
                      <Badge variant="outline">
                        {(exercise.sets * exercise.reps * exercise.weight).toFixed(1)} lbs volume
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(exercise.id)}
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

export default ExerciseTracker;