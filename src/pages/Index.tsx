import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calculator, ShoppingCart, Zap, Dumbbell, Scale, ChevronLeft, ChevronRight } from 'lucide-react';
import CalorieCalculator from '@/components/CalorieCalculator';
import FoodListBuilder from '@/components/FoodListBuilder';
import ExerciseTracker from '@/components/ExerciseTracker';
import WeightTracker from '@/components/WeightTracker';
import hypersonicLogo from '@/assets/hypersonic-logo.png';

const Index = () => {
  const [activeTab, setActiveTab] = useState("calories");
  
  const tabs = [
    { value: "calories", label: "Calorie Calculator", icon: Calculator },
    { value: "shopping", label: "Shopping List", icon: ShoppingCart },
    { value: "exercise", label: "Exercise Tracker", icon: Dumbbell },
    { value: "weight", label: "Weight Tracker", icon: Scale }
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.value === activeTab);

  const navigateTab = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newIndex = currentTabIndex > 0 ? currentTabIndex - 1 : tabs.length - 1;
      setActiveTab(tabs[newIndex].value);
    } else {
      const newIndex = currentTabIndex < tabs.length - 1 ? currentTabIndex + 1 : 0;
      setActiveTab(tabs[newIndex].value);
    }
  };

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop tabs - hidden on mobile */}
          <TabsList className="hidden md:grid w-full grid-cols-4 bg-cosmic-white/10 backdrop-blur-md border border-moon-grey/30">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="data-[state=active]:bg-gradient-stellar data-[state=active]:text-white"
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Mobile navigation - visible only on mobile */}
          <div className="md:hidden flex items-center justify-between bg-cosmic-white/10 backdrop-blur-md border border-moon-grey/30 rounded-lg p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTab('prev')}
              className="text-foreground hover:bg-cosmic-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-stellar rounded-md text-white">
              {(() => {
                const currentTab = tabs[currentTabIndex];
                const IconComponent = currentTab.icon;
                return (
                  <>
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{currentTab.label}</span>
                  </>
                );
              })()}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTab('next')}
              className="text-foreground hover:bg-cosmic-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <TabsContent value="calories" className="space-y-6">
            <CalorieCalculator />
          </TabsContent>

          <TabsContent value="shopping" className="space-y-6">
            <FoodListBuilder />
          </TabsContent>

          <TabsContent value="exercise" className="space-y-6">
            <ExerciseTracker />
          </TabsContent>

          <TabsContent value="weight" className="space-y-6">
            <WeightTracker />
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
