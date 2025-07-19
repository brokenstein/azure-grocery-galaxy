import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ShoppingCart, CheckCircle } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  completed: boolean;
}

const FoodListBuilder = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [newItem, setNewItem] = useState('');

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  const addItem = () => {
    if (newItem.trim()) {
      const item: FoodItem = {
        id: Date.now().toString(),
        name: newItem.trim(),
        completed: false,
      };
      setItems([...items, item]);
      setNewItem('');
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const clearCompleted = () => {
    setItems(items.filter(item => !item.completed));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  return (
    <div className="space-y-6">
      {/* Shopping Progress Card */}
      <Card className="bg-gradient-stellar border-stellar-purple/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-4">
            <ShoppingCart className="h-8 w-8 text-stellar-purple" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {completedCount}/{totalCount}
              </p>
              <p className="text-sm text-muted-foreground">Items Collected</p>
            </div>
          </div>
          {totalCount > 0 && (
            <div className="mt-4">
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-gradient-nebula h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Item */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add to Shopping List</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter food item (e.g., Bananas, Chicken breast)"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={addItem}
              className="bg-gradient-nebula hover:opacity-90 transition-opacity"
              disabled={!newItem.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shopping List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shopping List ({totalCount} items)</CardTitle>
          {completedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompleted}
              className="text-muted-foreground"
            >
              Clear Completed
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your shopping list is empty. Add some items above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                    item.completed
                      ? 'bg-primary/5 border-primary/20 opacity-60'
                      : 'bg-secondary/50 border-border/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div>
                      <p className={`font-medium ${
                        item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}>
                        {item.name}
                      </p>
                      {item.completed && (
                        <Badge variant="outline" className="text-xs mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Collected
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
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

export default FoodListBuilder;