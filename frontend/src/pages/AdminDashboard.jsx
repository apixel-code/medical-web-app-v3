import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, CalendarDays, FileText, Mail,
  CheckCircle, XCircle, AlertCircle, Clock, TrendingUp,
  Stethoscope, Building2, Plus, Trash2
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [contactMsgs, setContactMsgs] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '', excerpt: '', category: '', image_url: '' });

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/auth'); return; }
    Promise.all([
      api.get('/admin/stats').then(r => setStats(r.data)),
      api.get('/admin/appointments').then(r => setAppointments(r.data)),
      api.get('/admin/patients').then(r => setPatients(r.data)),
      api.get('/blog').then(r => setBlogPosts(r.data)),
      api.get('/admin/contact-messages').then(r => setContactMsgs(r.data)),
      api.get('/doctors').then(r => setDoctors(r.data)),
      api.get('/departments').then(r => setDepartments(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [user, navigate]);

  const updateApptStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}`, { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Appointment ${status}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const createPost = async () => {
    if (!newPost.title || !newPost.content) { toast.error('Title and content required'); return; }
    try {
      const { data } = await api.post('/blog', newPost);
      setBlogPosts(prev => [data, ...prev]);
      setNewPost({ title: '', content: '', excerpt: '', category: '', image_url: '' });
      toast.success('Post created');
    } catch {
      toast.error('Failed to create post');
    }
  };

  const deletePost = async (id) => {
    try {
      await api.delete(`/blog/${id}`);
      setBlogPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const statusIcon = (s) => {
    if (s === 'confirmed') return <CheckCircle className="w-4 h-4 text-medical-emerald" />;
    if (s === 'cancelled') return <XCircle className="w-4 h-4 text-medical-rose" />;
    if (s === 'completed') return <CheckCircle className="w-4 h-4 text-medical-blue" />;
    return <AlertCircle className="w-4 h-4 text-amber-500" />;
  };

  if (!user || user.role !== 'admin') return null;

  const statCards = stats ? [
    { label: 'Total Patients', value: stats.total_patients, icon: Users, color: 'text-medical-blue' },
    { label: 'Total Doctors', value: stats.total_doctors, icon: Stethoscope, color: 'text-medical-emerald' },
    { label: 'Appointments', value: stats.total_appointments, icon: CalendarDays, color: 'text-purple-500' },
    { label: 'Pending', value: stats.pending_appointments, icon: Clock, color: 'text-amber-500' },
    { label: 'Departments', value: stats.total_departments, icon: Building2, color: 'text-sky-500' },
    { label: 'Blog Posts', value: stats.total_blog_posts, icon: FileText, color: 'text-pink-500' },
  ] : [];

  return (
    <div className="pt-20 min-h-screen bg-slate-50" data-testid="admin-dashboard">
      <section className="bg-white border-b border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-medical-blue" /> Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage your hospital operations</p>
          </div>
          <Badge className="bg-medical-blue-light text-medical-blue border-0">Admin</Badge>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8" data-testid="admin-stats">
            {statCards.map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="font-heading font-bold text-2xl text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="bg-white border border-slate-100 p-1 rounded-xl flex-wrap">
            <TabsTrigger value="appointments" className="rounded-lg" data-testid="admin-tab-appts">Appointments</TabsTrigger>
            <TabsTrigger value="patients" className="rounded-lg" data-testid="admin-tab-patients">Patients</TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg" data-testid="admin-tab-blog">Blog</TabsTrigger>
            <TabsTrigger value="messages" className="rounded-lg" data-testid="admin-tab-msgs">Messages</TabsTrigger>
          </TabsList>

          {/* Appointments */}
          <TabsContent value="appointments" data-testid="admin-appointments">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-heading font-semibold text-lg">All Appointments ({appointments.length})</h2>
              </div>
              {appointments.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No appointments</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr><th className="px-5 py-3 text-left">Patient</th><th className="px-5 py-3 text-left">Doctor</th><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-left">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.slice(0, 20).map(a => (
                        <tr key={a.id} data-testid={`admin-appt-${a.id}`}>
                          <td className="px-5 py-3 font-medium text-slate-900">{a.patient_name}</td>
                          <td className="px-5 py-3 text-slate-600">{doctors.find(d => d.id === a.doctor_id)?.name || '-'}</td>
                          <td className="px-5 py-3 text-slate-600">{a.date} {a.time}</td>
                          <td className="px-5 py-3"><Badge className={`${a.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : a.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'} border-0 text-xs capitalize`}>{a.status}</Badge></td>
                          <td className="px-5 py-3">
                            {a.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-xs h-7 rounded-full text-emerald-600 border-emerald-200" onClick={() => updateApptStatus(a.id, 'confirmed')} data-testid={`confirm-${a.id}`}>Confirm</Button>
                                <Button size="sm" variant="outline" className="text-xs h-7 rounded-full text-red-600 border-red-200" onClick={() => updateApptStatus(a.id, 'cancelled')} data-testid={`cancel-${a.id}`}>Cancel</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Patients */}
          <TabsContent value="patients" data-testid="admin-patients">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-heading font-semibold text-lg">Registered Patients ({patients.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr><th className="px-5 py-3 text-left">Name</th><th className="px-5 py-3 text-left">Email</th><th className="px-5 py-3 text-left">Phone</th><th className="px-5 py-3 text-left">Joined</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map(p => (
                      <tr key={p.id}>
                        <td className="px-5 py-3 font-medium text-slate-900">{p.full_name}</td>
                        <td className="px-5 py-3 text-slate-600">{p.email}</td>
                        <td className="px-5 py-3 text-slate-600">{p.phone || '-'}</td>
                        <td className="px-5 py-3 text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Blog */}
          <TabsContent value="blog" data-testid="admin-blog">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg">Blog Posts ({blogPosts.length})</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-full bg-medical-blue text-white gap-1" data-testid="create-post-btn"><Plus className="w-3.5 h-3.5" /> New Post</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Create Blog Post</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Title</Label><Input value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="mt-1" data-testid="new-post-title" /></div>
                      <div><Label>Category</Label><Input value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} placeholder="e.g. Heart Health" className="mt-1" data-testid="new-post-category" /></div>
                      <div><Label>Image URL</Label><Input value={newPost.image_url} onChange={e => setNewPost({...newPost, image_url: e.target.value})} className="mt-1" data-testid="new-post-image" /></div>
                      <div><Label>Excerpt</Label><Textarea value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})} rows={2} className="mt-1" data-testid="new-post-excerpt" /></div>
                      <div><Label>Content</Label><Textarea value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} rows={6} className="mt-1" data-testid="new-post-content" /></div>
                      <Button onClick={createPost} className="rounded-full bg-medical-blue text-white w-full" data-testid="publish-post-btn">Publish</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="divide-y divide-slate-100">
                {blogPosts.map(p => (
                  <div key={p.id} className="p-5 flex items-center justify-between" data-testid={`admin-post-${p.id}`}>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{p.title}</p>
                      <p className="text-xs text-slate-500">{p.category} - {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => deletePost(p.id)} data-testid={`delete-post-${p.id}`}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages" data-testid="admin-messages">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-heading font-semibold text-lg">Contact Messages ({contactMsgs.length})</h2>
              </div>
              {contactMsgs.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No messages</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {contactMsgs.map(m => (
                    <div key={m.id} className="p-5" data-testid={`contact-msg-${m.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-medical-blue" />
                          <span className="font-medium text-slate-900 text-sm">{m.name}</span>
                          <span className="text-xs text-slate-400">{m.email}</span>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700">{m.subject}</p>
                      <p className="text-sm text-slate-500 mt-1">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
