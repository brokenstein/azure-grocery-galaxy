import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Loader2 } from 'lucide-react';

interface DailyCalorieData {
  date: string;
  calories: number;
}

const CalorieChart = () => {
  const [data, setData] = useState<DailyCalorieData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCalorieHistory();
  }, []);

  const fetchCalorieHistory = async () => {
    try {
      // Get data for the last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);

      const { data: entries, error } = await supabase
        .from('food_entries')
        .select('calories, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date and sum calories
      const groupedData = new Map<string, number>();
      
      // Initialize all dates with 0 calories
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        groupedData.set(dateStr, 0);
      }

      // Sum calories for each date
      entries?.forEach(entry => {
        const date = new Date(entry.created_at).toISOString().split('T')[0];
        const currentCalories = groupedData.get(date) || 0;
        groupedData.set(date, currentCalories + entry.calories);
      });

      // Convert to chart format
      const chartData = Array.from(groupedData.entries()).map(([date, calories]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories
      }));

      setData(chartData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load calorie history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    calories: {
      label: "Calories",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>Daily Calories (Last 7 Days)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px]">
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
                dataKey="calories"
                stroke="var(--color-calories)"
                strokeWidth={2}
                dot={{ fill: "var(--color-calories)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "var(--color-calories)" }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CalorieChart;