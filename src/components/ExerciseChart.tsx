import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Loader2 } from 'lucide-react';

interface DailyExerciseData {
  date: string;
  totalSets: number;
}

const ExerciseChart = () => {
  const [data, setData] = useState<DailyExerciseData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchExerciseHistory();
  }, []);

  const fetchExerciseHistory = async () => {
    try {
      // Get data for the last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);

      const { data: entries, error } = await supabase
        .from('exercise_entries')
        .select('sets, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date and sum sets
      const groupedData = new Map<string, number>();
      
      // Initialize all dates with 0 sets
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        groupedData.set(dateStr, 0);
      }

      // Sum sets for each date
      entries?.forEach(entry => {
        const date = new Date(entry.created_at).toISOString().split('T')[0];
        const currentSets = groupedData.get(date) || 0;
        groupedData.set(date, currentSets + entry.sets);
      });

      // Convert to chart format
      const chartData = Array.from(groupedData.entries()).map(([date, totalSets]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalSets
      }));

      setData(chartData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exercise history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    totalSets: {
      label: "Total Sets",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>Daily Exercise Sets (Last 7 Days)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[150px] md:h-[200px]">
            <LineChart data={data}>
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                className="text-xs"
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                className="text-xs"
              />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="totalSets"
                stroke="var(--color-totalSets)"
                strokeWidth={2}
                dot={{ fill: "var(--color-totalSets)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "var(--color-totalSets)" }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseChart;