import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CalendarDays, FileText, ClipboardList, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Send, Pill, Download } from 'lucide-react';

export default function PatientPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [newMsg, setNewMsg] = useState({ receiver_id: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    Promise.all([
      api.get('/appointments').then(r => setAppointments(r.data)),
      api.get('/prescriptions').then(r => setPrescriptions(r.data)),
      api.get('/reports').then(r => setReports(r.data)),
      api.get('/messages').then(r => setMessages(r.data)),
      api.get('/doctors').then(r => setDoctors(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [user, navigate]);

  const sendMessage = async () => {
    if (!newMsg.receiver_id || !newMsg.content) { toast.error('Select a doctor and enter message'); return; }
    try {
      const { data } = await api.post('/messages', newMsg);
      setMessages(prev => [data, ...prev]);
      setNewMsg({ receiver_id: newMsg.receiver_id, content: '' });
      toast.success('Message sent');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const statusIcon = (s) => {
    if (s === 'confirmed') return <CheckCircle className="w-4 h-4 text-medical-emerald" />;
    if (s === 'cancelled') return <XCircle className="w-4 h-4 text-medical-rose" />;
    if (s === 'completed') return <CheckCircle className="w-4 h-4 text-medical-blue" />;
    return <AlertCircle className="w-4 h-4 text-amber-500" />;
  };

  const statusColor = (s) => {
    if (s === 'confirmed') return 'bg-emerald-50 text-emerald-700';
    if (s === 'cancelled') return 'bg-red-50 text-red-700';
    if (s === 'completed') return 'bg-sky-50 text-sky-700';
    return 'bg-amber-50 text-amber-700';
  };

  if (!user) return null;

  return (
    <div className="pt-20 min-h-screen bg-slate-50" data-testid="patient-portal">
      <section className="bg-white border-b border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-bold text-2xl text-slate-900">Welcome back, {user.full_name}</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your appointments, prescriptions, and health records.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-100"><CalendarDays className="w-6 h-6 text-medical-blue mb-2" /><p className="font-heading font-bold text-2xl text-slate-900">{appointments.length}</p><p className="text-xs text-slate-500">Appointments</p></div>
          <div className="bg-white rounded-xl p-5 border border-slate-100"><Pill className="w-6 h-6 text-medical-emerald mb-2" /><p className="font-heading font-bold text-2xl text-slate-900">{prescriptions.length}</p><p className="text-xs text-slate-500">Prescriptions</p></div>
          <div className="bg-white rounded-xl p-5 border border-slate-100"><FileText className="w-6 h-6 text-amber-500 mb-2" /><p className="font-heading font-bold text-2xl text-slate-900">{reports.length}</p><p className="text-xs text-slate-500">Reports</p></div>
          <div className="bg-white rounded-xl p-5 border border-slate-100"><MessageSquare className="w-6 h-6 text-purple-500 mb-2" /><p className="font-heading font-bold text-2xl text-slate-900">{messages.length}</p><p className="text-xs text-slate-500">Messages</p></div>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="bg-white border border-slate-100 p-1 rounded-xl">
            <TabsTrigger value="appointments" className="rounded-lg" data-testid="portal-tab-appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions" className="rounded-lg" data-testid="portal-tab-prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-lg" data-testid="portal-tab-reports">Reports</TabsTrigger>
            <TabsTrigger value="messages" className="rounded-lg" data-testid="portal-tab-messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" data-testid="portal-appointments">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg">Your Appointments</h2>
                <Button onClick={() => navigate('/appointment')} size="sm" className="rounded-full bg-medical-blue text-white gap-1"><CalendarDays className="w-3.5 h-3.5" /> Book New</Button>
              </div>
              {appointments.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No appointments yet</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {appointments.map(a => (
                    <div key={a.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" data-testid={`appt-${a.id}`}>
                      <div className="flex items-center gap-4">
                        {statusIcon(a.status)}
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{doctors.find(d => d.id === a.doctor_id)?.name || 'Doctor'}</p>
                          <p className="text-xs text-slate-500">{a.date} at {a.time}</p>
                        </div>
                      </div>
                      <Badge className={`${statusColor(a.status)} border-0 text-xs capitalize`}>{a.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="prescriptions" data-testid="portal-prescriptions">
            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-100">No prescriptions</div>
              ) : prescriptions.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-6 border border-slate-100" data-testid={`rx-${p.id}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-semibold text-slate-900">{p.diagnosis}</h3>
                      <p className="text-xs text-slate-500">By {p.doctor_name} - {p.date}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs"><Download className="w-3 h-3" /> Download</Button>
                  </div>
                  <div className="space-y-2">
                    {p.medications?.map((med, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 text-sm">
                        <Pill className="w-4 h-4 text-medical-blue shrink-0" />
                        <div><span className="font-medium text-slate-900">{med.name}</span> <span className="text-slate-500">- {med.dosage} ({med.duration})</span></div>
                      </div>
                    ))}
                  </div>
                  {p.notes && <p className="text-xs text-slate-500 mt-3 italic">{p.notes}</p>}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" data-testid="portal-reports">
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-100">No reports</div>
              ) : reports.map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-6 border border-slate-100" data-testid={`report-${r.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-heading font-semibold text-slate-900">{r.title}</h3>
                      <p className="text-xs text-slate-500">{r.type} - {r.date} - {r.doctor_name}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs"><Download className="w-3 h-3" /> View</Button>
                  </div>
                  <p className="text-sm text-slate-600">{r.summary}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages" data-testid="portal-messages">
            <div className="bg-white rounded-2xl border border-slate-100">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-heading font-semibold text-lg mb-4">Send a Message</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={newMsg.receiver_id} onValueChange={v => setNewMsg({...newMsg, receiver_id: v})}>
                    <SelectTrigger className="w-full sm:w-[250px]" data-testid="msg-doctor-select"><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                    <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Textarea value={newMsg.content} onChange={e => setNewMsg({...newMsg, content: e.target.value})} placeholder="Type your message..." rows={2} className="flex-1" data-testid="msg-content" />
                  <Button onClick={sendMessage} className="rounded-full bg-medical-blue text-white gap-1 shrink-0" data-testid="msg-send"><Send className="w-4 h-4" /> Send</Button>
                </div>
              </div>
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No messages yet</div>
                ) : messages.map(m => (
                  <div key={m.id} className={`p-4 ${m.sender_id === user?.id ? 'bg-medical-blue-light/30' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900">{m.sender_name || 'You'}</p>
                      <span className="text-xs text-slate-400">{new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600">{m.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
