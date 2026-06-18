import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the URL contains a recovery token (type=recovery)
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      setIsRecovery(true);
    } else {
      setIsRecovery(false);
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been reset successfully. Please sign in.",
      });

      // Redirect to home after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <h1 className="sr-only">Reset your Hypersonic password</h1>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {isRecovery ? 'Reset Your Password' : 'Invalid or Expired Link'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRecovery ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
