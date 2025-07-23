import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, ShoppingCart, Zap, Dumbbell } from 'lucide-react';
import CalorieCalculator from '@/components/CalorieCalculator';
import FoodListBuilder from '@/components/FoodListBuilder';
import ExerciseTracker from '@/components/ExerciseTracker';
import hypersonicLogo from '@/assets/hypersonic-logo.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      {/* Header */}
      <header className="bg-cosmic-white/10 backdrop-blur-md border-b border-moon-grey/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <img 
              src={hypersonicLogo} 
              alt="Hypersonic Logo" 
              className="h-12 w-12 rounded-lg shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hypersonic</h1>
              <p className="text-sm text-muted-foreground">Lightning-fast health tracking</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="calories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-cosmic-white/10 backdrop-blur-md border border-moon-grey/30">
            <TabsTrigger 
              value="calories" 
              className="data-[state=active]:bg-gradient-stellar data-[state=active]:text-white"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calorie Calculator
            </TabsTrigger>
            <TabsTrigger 
              value="shopping" 
              className="data-[state=active]:bg-gradient-stellar data-[state=active]:text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Shopping List
            </TabsTrigger>
            <TabsTrigger 
              value="exercise" 
              className="data-[state=active]:bg-gradient-stellar data-[state=active]:text-white"
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              Exercise Tracker
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calories" className="space-y-6">
            <CalorieCalculator />
          </TabsContent>

          <TabsContent value="shopping" className="space-y-6">
            <FoodListBuilder />
          </TabsContent>

          <TabsContent value="exercise" className="space-y-6">
            <ExerciseTracker />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-space-grey/30 bg-cosmic-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by Hypersonic ⚡ Lightning-fast health tracking across the cosmos
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
