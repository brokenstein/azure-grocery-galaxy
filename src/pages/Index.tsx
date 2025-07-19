import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, ShoppingCart, Sparkles } from 'lucide-react';
import CalorieCalculator from '@/components/CalorieCalculator';
import FoodListBuilder from '@/components/FoodListBuilder';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-stellar rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cosmic Health Tracker</h1>
              <p className="text-sm text-muted-foreground">Track calories & build shopping lists</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="calories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-md border border-border/50">
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
          </TabsList>

          <TabsContent value="calories" className="space-y-6">
            <CalorieCalculator />
          </TabsContent>

          <TabsContent value="shopping" className="space-y-6">
            <FoodListBuilder />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built with cosmic energy ✨ Track your health journey among the stars
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
