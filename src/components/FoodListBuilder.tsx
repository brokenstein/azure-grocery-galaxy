import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ShoppingCart, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FoodItem {
  id: string;
  name: string;
  completed: boolean;
  created_at?: string;
}

const FoodListBuilder = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load shopping list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert([{
          name: newItem.trim(),
          completed: false,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setItems([data, ...items]);
      setNewItem('');
      toast({
        title: "Success",
        description: "Item added to shopping list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setItems(items.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Item removed from list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const toggleItem = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ completed: !item.completed })
        .eq('id', id);

      if (error) throw error;
      
      setItems(items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const clearCompleted = async () => {
    const completedItems = items.filter(item => item.completed);
    if (completedItems.length === 0) return;

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .in('id', completedItems.map(item => item.id));

      if (error) throw error;
      
      setItems(items.filter(item => !item.completed));
      toast({
        title: "Success",
        description: `Removed ${completedItems.length} completed items`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear completed items",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Summary Card */}
      <Card className="bg-gradient-stellar border-stellar-purple/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Item Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add Item</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter item name (e.g., Apples)"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
          </div>
          <Button 
            onClick={addItem}
            className="bg-gradient-nebula hover:opacity-90 transition-opacity"
            disabled={!newItem.trim() || submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {submitting ? 'Adding...' : 'Add Item'}
          </Button>
        </CardContent>
      </Card>

      {/* Shopping List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shopping List ({items.length})</CardTitle>
          {completedCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCompleted}
              className="text-destructive hover:text-destructive"
            >
              Clear Completed ({completedCount})
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your shopping list is empty. Add some items above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg border border-border/50 ${
                    item.completed ? 'opacity-60' : ''
                  }`}
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={item.completed ? "default" : "outline"} className="text-xs">
                        {item.completed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </>
                        ) : (
                          'Pending'
                        )}
                      </Badge>
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