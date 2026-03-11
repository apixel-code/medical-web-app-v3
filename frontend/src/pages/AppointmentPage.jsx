import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { CalendarDays, User, Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

export default function AppointmentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    department_id: '', doctor_id: searchParams.get('doctor') || '',
    date: '', time: '', patient_name: '', patient_email: '', patient_phone: '', notes: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/departments').then(r => setDepartments(r.data)),
      api.get('/doctors').then(r => {
        setDoctors(r.data);
        if (searchParams.get('doctor')) {
          const doc = r.data.find(d => d.id === searchParams.get('doctor'));
          if (doc) setForm(f => ({ ...f, department_id: doc.department_id, doctor_id: doc.id }));
        }
      })
    ]).catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    if (form.department_id) {
      setFilteredDoctors(doctors.filter(d => d.department_id === form.department_id));
    } else {
      setFilteredDoctors(doctors);
    }
  }, [form.department_id, doctors]);

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      setForm(f => ({ ...f, date: date.toISOString().split('T')[0] }));
    }
  };

  const handleSubmit = async () => {
    if (!form.patient_name || !form.patient_email || !form.doctor_id || !form.date || !form.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/appointments', form);
      setSuccess(true);
      toast.success('Appointment booked successfully!');
    } catch (err) {
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-20 min-h-screen bg-slate-50 flex items-center justify-center" data-testid="appointment-success">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">
            <CheckCircle className="w-20 h-20 text-medical-emerald mx-auto mb-6" />
            <h2 className="font-heading font-bold text-2xl text-slate-900 mb-3">Appointment Booked!</h2>
            <p className="text-slate-600 mb-6">Your appointment has been scheduled. You'll receive a confirmation at {form.patient_email}.</p>
            <div className="bg-slate-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
              <p><span className="font-medium text-slate-700">Date:</span> {form.date}</p>
              <p><span className="font-medium text-slate-700">Time:</span> {form.time}</p>
              <p><span className="font-medium text-slate-700">Doctor:</span> {doctors.find(d => d.id === form.doctor_id)?.name}</p>
            </div>
            <Button onClick={() => navigate('/')} className="rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white w-full">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-slate-50" data-testid="appointment-page">
      <section className="hero-gradient py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4">Easy Scheduling</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Book an Appointment</h1>
          <p className="text-slate-600">Schedule your visit in just a few steps.</p>
        </div>
      </section>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                step >= s ? 'bg-medical-blue text-white' : 'bg-slate-200 text-slate-500'
              }`}>{s}</div>
              <span className={`text-sm hidden sm:block ${step >= s ? 'text-medical-blue font-medium' : 'text-slate-400'}`}>
                {s === 1 ? 'Select Doctor' : s === 2 ? 'Choose Time' : 'Your Details'}
              </span>
              {s < 3 && <div className={`h-0.5 flex-1 ${step > s ? 'bg-medical-blue' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          {/* Step 1: Select Doctor */}
          {step === 1 && (
            <div className="space-y-6" data-testid="step-1">
              <h2 className="font-heading font-bold text-xl text-slate-900">Select Department & Doctor</h2>
              <div>
                <Label>Department</Label>
                <Select value={form.department_id} onValueChange={v => setForm({...form, department_id: v, doctor_id: ''})}>
                  <SelectTrigger className="mt-1.5" data-testid="appt-dept-select"><SelectValue placeholder="Choose a department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Doctor</Label>
                <Select value={form.doctor_id} onValueChange={v => setForm({...form, doctor_id: v})}>
                  <SelectTrigger className="mt-1.5" data-testid="appt-doctor-select"><SelectValue placeholder="Choose a doctor" /></SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} - {d.specialization}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => { if (!form.doctor_id) { toast.error('Please select a doctor'); return; } setStep(2); }}
                className="rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white gap-2 w-full sm:w-auto" data-testid="step-1-next">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Choose Time */}
          {step === 2 && (
            <div className="space-y-6" data-testid="step-2">
              <h2 className="font-heading font-bold text-xl text-slate-900">Choose Date & Time</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Select Date</Label>
                  <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="rounded-xl border border-slate-200" data-testid="appt-calendar" />
                </div>
                <div>
                  <Label className="mb-2 block">Select Time</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map(time => (
                      <button key={time} onClick={() => setForm({...form, time})}
                        className={`p-2.5 rounded-lg text-sm font-medium transition-colors border ${
                          form.time === time ? 'bg-medical-blue text-white border-medical-blue' : 'bg-white text-slate-700 border-slate-200 hover:border-medical-blue/30'
                        }`} data-testid={`time-${time.replace(/\s/g, '-')}`}>
                        <Clock className="w-3.5 h-3.5 inline mr-1" />{time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-full gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={() => { if (!form.date || !form.time) { toast.error('Please select date and time'); return; } setStep(3); }}
                  className="rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white gap-2" data-testid="step-2-next">
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Patient Info */}
          {step === 3 && (
            <div className="space-y-5" data-testid="step-3">
              <h2 className="font-heading font-bold text-xl text-slate-900">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="pname">Full Name *</Label>
                  <Input id="pname" value={form.patient_name} onChange={e => setForm({...form, patient_name: e.target.value})} placeholder="John Doe" className="mt-1.5" data-testid="appt-name" />
                </div>
                <div>
                  <Label htmlFor="pemail">Email *</Label>
                  <Input id="pemail" type="email" value={form.patient_email} onChange={e => setForm({...form, patient_email: e.target.value})} placeholder="john@example.com" className="mt-1.5" data-testid="appt-email" />
                </div>
                <div>
                  <Label htmlFor="pphone">Phone</Label>
                  <Input id="pphone" value={form.patient_phone} onChange={e => setForm({...form, patient_phone: e.target.value})} placeholder="+1 (555) 0000" className="mt-1.5" data-testid="appt-phone" />
                </div>
              </div>
              <div>
                <Label htmlFor="pnotes">Additional Notes</Label>
                <Textarea id="pnotes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Describe your symptoms..." rows={3} className="mt-1.5" data-testid="appt-notes" />
              </div>
              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-5 text-sm space-y-2">
                <h4 className="font-heading font-semibold text-slate-900">Appointment Summary</h4>
                <p><span className="text-slate-500">Department:</span> {departments.find(d => d.id === form.department_id)?.name || 'N/A'}</p>
                <p><span className="text-slate-500">Doctor:</span> {doctors.find(d => d.id === form.doctor_id)?.name || 'N/A'}</p>
                <p><span className="text-slate-500">Date:</span> {form.date}</p>
                <p><span className="text-slate-500">Time:</span> {form.time}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-full gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleSubmit} disabled={loading} className="rounded-full bg-medical-emerald hover:bg-medical-emerald-dark text-white gap-2" data-testid="appt-submit">
                  <CheckCircle className="w-4 h-4" /> {loading ? 'Booking...' : 'Confirm Appointment'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
