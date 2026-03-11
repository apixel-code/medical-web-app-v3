import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, GraduationCap, Award, CalendarDays, Clock, ArrowLeft, DollarSign } from 'lucide-react';

export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/doctors/${id}`).then(r => setDoctor(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pt-32 text-center text-slate-500">Loading...</div>;
  if (!doctor) return <div className="pt-32 text-center text-slate-500">Doctor not found</div>;

  return (
    <div className="pt-20" data-testid="doctor-profile-page">
      <section className="hero-gradient py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/doctors" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-medical-blue mb-6 transition-colors" data-testid="back-to-doctors">
            <ArrowLeft className="w-4 h-4" /> Back to Doctors
          </Link>
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Photo & Quick Info */}
            <div className="lg:col-span-1">
              <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-lg bg-white">
                <div className="h-72 overflow-hidden bg-slate-100">
                  <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 text-center">
                  <h1 className="font-heading font-bold text-2xl text-slate-900">{doctor.name}</h1>
                  <p className="text-medical-blue font-medium mt-1">{doctor.specialization}</p>
                  <p className="text-sm text-slate-500">{doctor.department_name}</p>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-lg">{doctor.rating}</span>
                  </div>
                  <Link to={`/appointment?doctor=${doctor.id}`} className="block mt-5" data-testid="doctor-book-btn">
                    <Button className="rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white w-full gap-2">
                      <CalendarDays className="w-4 h-4" /> Book Appointment
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                <h2 className="font-heading font-bold text-xl text-slate-900 mb-3">About</h2>
                <p className="text-slate-600 leading-relaxed">{doctor.bio}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-100 text-center">
                  <Clock className="w-6 h-6 text-medical-blue mx-auto mb-2" />
                  <p className="font-heading font-bold text-2xl text-slate-900">{doctor.experience_years}</p>
                  <p className="text-xs text-slate-500">Years Experience</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-100 text-center">
                  <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="font-heading font-bold text-2xl text-slate-900">{doctor.rating}</p>
                  <p className="text-xs text-slate-500">Rating</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-100 text-center">
                  <DollarSign className="w-6 h-6 text-medical-emerald mx-auto mb-2" />
                  <p className="font-heading font-bold text-2xl text-slate-900">${doctor.consultation_fee}</p>
                  <p className="text-xs text-slate-500">Consultation Fee</p>
                </div>
              </div>

              {/* Education */}
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                <h2 className="font-heading font-bold text-xl text-slate-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-medical-blue" /> Education
                </h2>
                <div className="space-y-3">
                  {doctor.education?.map((edu, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                      <div className="w-2 h-2 rounded-full bg-medical-blue shrink-0" />
                      <span className="text-sm text-slate-700">{edu}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                <h2 className="font-heading font-bold text-xl text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-medical-blue" /> Certifications
                </h2>
                <div className="flex flex-wrap gap-2">
                  {doctor.certifications?.map((cert) => (
                    <Badge key={cert} className="bg-medical-emerald-light text-medical-emerald-dark border-0 py-1.5 px-3">{cert}</Badge>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm" data-testid="doctor-schedule">
                <h2 className="font-heading font-bold text-xl text-slate-900 mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-medical-blue" /> Available Schedule
                </h2>
                <div className="flex flex-wrap gap-2">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => (
                    <div key={day} className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      doctor.available_days?.includes(day)
                        ? 'bg-medical-blue text-white' : 'bg-slate-100 text-slate-400'
                    }`}>{day}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
