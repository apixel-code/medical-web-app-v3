import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Phone, Plus, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ email: '', password: '', full_name: '', phone: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const user = await login(loginForm.email, loginForm.password);
      toast.success(`Welcome back, ${user.full_name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/portal');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.email || !regForm.password || !regForm.full_name) { toast.error('Please fill in required fields'); return; }
    setLoading(true);
    try {
      await register(regForm.email, regForm.password, regForm.full_name, regForm.phone);
      toast.success('Account created successfully!');
      navigate('/portal');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-slate-50 flex items-center justify-center" data-testid="auth-page">
      <div className="w-full max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-medical-blue flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">Modina Clinic & D. Center</h1>
          <p className="text-sm text-slate-500 mt-1">Access your patient portal</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <Tabs defaultValue="login">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" className="flex-1" data-testid="register-tab">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div>
                  <Label htmlFor="l-email">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input id="l-email" type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} placeholder="you@example.com" className="pl-10" data-testid="login-email" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="l-pass">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input id="l-pass" type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="Enter password" className="pl-10" data-testid="login-password" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white" data-testid="login-submit">
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <div className="text-center pt-2">
                  <Badge variant="secondary" className="text-xs">Demo: admin@luminamedical.com / admin123</Badge>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                <div>
                  <Label htmlFor="r-name">Full Name *</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input id="r-name" value={regForm.full_name} onChange={e => setRegForm({...regForm, full_name: e.target.value})} placeholder="John Doe" className="pl-10" data-testid="register-name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="r-email">Email *</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input id="r-email" type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} placeholder="you@example.com" className="pl-10" data-testid="register-email" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="r-phone">Phone</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input id="r-phone" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} placeholder="+1 (555) 0000" className="pl-10" data-testid="register-phone" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="r-pass">Password *</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input id="r-pass" type="password" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} placeholder="Min 6 characters" className="pl-10" data-testid="register-password" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white" data-testid="register-submit">
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
