import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, DollarSign, CreditCard, Building2, Eye, EyeOff, Pencil } from 'lucide-react';
import EditEntryDialog from './EditEntryDialog';

interface BankAccount {
  id: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency: string;
  bank_name: string;
  account_number_last_four?: string;
  is_active: boolean;
  created_at: string;
}

const BankAccountTracker = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    account_name: '',
    account_type: '',
    balance: '',
    currency: 'USD',
    bank_name: '',
    account_number_last_four: ''
  });

  const accountTypes = [
    'Checking', 'Savings', 'Credit Card', 'Investment', 'Money Market', 
    'Certificate of Deposit', 'IRA', '401k', 'Other'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch bank accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.account_name || !formData.account_type || !formData.bank_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('bank_accounts')
        .insert([
          {
            ...formData,
            balance: parseFloat(formData.balance || '0'),
            user_id: user.id,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bank account added successfully!",
      });

      setFormData({
        account_name: '',
        account_type: '',
        balance: '',
        currency: 'USD',
        bank_name: '',
        account_number_last_four: ''
      });
      setIsAdding(false);
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateBalance = async (id: string, newBalance: number) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ balance: newBalance })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Balance updated successfully!",
      });
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleAccountStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Account status updated successfully!",
      });
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Bank account deleted successfully!",
      });
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking': return 'bg-gradient-stellar';
      case 'savings': return 'bg-gradient-nebula';
      case 'credit card': return 'bg-destructive';
      case 'investment': return 'bg-cosmic-blue';
      default: return 'bg-secondary';
    }
  };

  const updateAccount = async (values: Record<string, string | number>) => {
    if (!editingAccount) return;

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({
          account_name: String(values.account_name),
          bank_name: String(values.bank_name),
          account_type: String(values.account_type),
          balance: Number(values.balance),
          currency: String(values.currency),
        })
        .eq('id', editingAccount.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account updated successfully!",
      });
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const totalBalance = accounts
    .filter(account => account.is_active && !account.account_type.toLowerCase().includes('credit'))
    .reduce((sum, account) => sum + account.balance, 0);

  const creditBalance = accounts
    .filter(account => account.is_active && account.account_type.toLowerCase().includes('credit'))
    .reduce((sum, account) => sum + Math.abs(account.balance), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {showBalances ? `$${totalBalance.toFixed(2)}` : '****'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Debt</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {showBalances ? `$${creditBalance.toFixed(2)}` : '****'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stellar-purple">
              {accounts.filter(account => account.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cosmic-blue">
              {showBalances ? `$${(totalBalance - creditBalance).toFixed(2)}` : '****'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Account Form */}
      {isAdding && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Add New Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_name">Account Name *</Label>
                  <Input
                    id="account_name"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    placeholder="My Checking Account"
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="bank_name">Bank Name *</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder="Chase, Wells Fargo, etc."
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="account_type">Account Type *</Label>
                  <Select value={formData.account_type} onValueChange={(value) => setFormData({ ...formData, account_type: value })}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="balance">Current Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    placeholder="1000.00"
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="account_number_last_four">Last 4 Digits (Optional)</Label>
                  <Input
                    id="account_number_last_four"
                    value={formData.account_number_last_four}
                    onChange={(e) => setFormData({ ...formData, account_number_last_four: e.target.value })}
                    placeholder="1234"
                    maxLength={4}
                    className="bg-input border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-stellar">
                  Add Account
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Accounts List */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bank Accounts & Credit Cards</CardTitle>
            <CardDescription>Manage your financial accounts</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowBalances(!showBalances)}
              size="sm"
            >
              {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button onClick={() => setIsAdding(true)} className="bg-gradient-stellar">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No accounts yet. Add your first account!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.account_name}
                      {account.account_number_last_four && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ****{account.account_number_last_four}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{account.bank_name}</TableCell>
                    <TableCell>
                      <Badge className={getAccountTypeColor(account.account_type)}>
                        {account.account_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {showBalances ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={account.balance}
                          onChange={(e) => updateBalance(account.id, parseFloat(e.target.value) || 0)}
                          className="w-24 h-8"
                        />
                      ) : (
                        '****'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.is_active ? 'default' : 'secondary'}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAccountStatus(account.id, account.is_active)}
                        >
                          {account.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAccount(account)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAccount(account.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingAccount && (
        <EditEntryDialog
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
          title="Bank Account"
          fields={[
            { name: 'account_name', label: 'Account Name', type: 'text' },
            { name: 'bank_name', label: 'Bank Name', type: 'text' },
            { name: 'account_type', label: 'Account Type', type: 'select', options: accountTypes.map(t => ({ value: t, label: t })) },
            { name: 'balance', label: 'Balance', type: 'number' },
            { name: 'currency', label: 'Currency', type: 'select', options: currencies.map(c => ({ value: c, label: c })) },
          ]}
          initialValues={{
            account_name: editingAccount.account_name,
            bank_name: editingAccount.bank_name,
            account_type: editingAccount.account_type,
            balance: editingAccount.balance,
            currency: editingAccount.currency,
          }}
          onSave={updateAccount}
        />
      )}
    </div>
  );
};

export default BankAccountTracker;