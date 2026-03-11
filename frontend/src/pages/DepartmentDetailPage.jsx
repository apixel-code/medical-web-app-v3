import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Star, ChevronRight, Stethoscope, Wrench, Users, ArrowLeft } from 'lucide-react';

export default function DepartmentDetailPage() {
  const { slug } = useParams();
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/departments/${slug}`).then(r => setDept(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pt-32 text-center text-slate-500">Loading...</div>;
  if (!dept) return <div className="pt-32 text-center text-slate-500">Department not found</div>;

  return (
    <div className="pt-20" data-testid="department-detail-page">
      {/* Hero */}
      <section className="hero-gradient py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/departments" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-medical-blue mb-4 transition-colors" data-testid="back-to-departments">
            <ArrowLeft className="w-4 h-4" /> Back to Departments
          </Link>
          <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4 block w-fit">{dept.name}</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">{dept.name}</h1>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl leading-relaxed">{dept.description}</p>
          <Link to="/appointment" className="inline-block mt-6" data-testid="dept-book-appointment">
            <Button className="rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white gap-2">
              <CalendarDays className="w-4 h-4" /> Book Appointment
            </Button>
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white" data-testid="dept-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Stethoscope className="w-6 h-6 text-medical-blue" />
            <h2 className="font-heading font-bold text-2xl text-slate-900">Services Offered</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dept.services?.map((svc, i) => (
              <div key={svc} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 opacity-0 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-8 h-8 rounded-lg bg-medical-blue-light flex items-center justify-center shrink-0">
                  <ChevronRight className="w-4 h-4 text-medical-blue" />
                </div>
                <span className="text-sm font-medium text-slate-700">{svc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="py-16 bg-slate-50" data-testid="dept-equipment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Wrench className="w-6 h-6 text-medical-blue" />
            <h2 className="font-heading font-bold text-2xl text-slate-900">Equipment & Technology</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dept.equipment?.map((eq) => (
              <div key={eq} className="bg-white rounded-xl p-5 border border-slate-100 text-center">
                <Wrench className="w-6 h-6 text-medical-emerald mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">{eq}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      {dept.doctors?.length > 0 && (
        <section className="py-16 bg-white" data-testid="dept-doctors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Users className="w-6 h-6 text-medical-blue" />
              <h2 className="font-heading font-bold text-2xl text-slate-900">Department Doctors</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dept.doctors.map((doc) => (
                <Link key={doc.id} to={`/doctors/${doc.id}`} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow card-hover" data-testid={`dept-doctor-${doc.id}`}>
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img src={doc.image_url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading font-semibold text-slate-900">{doc.name}</h3>
                    <p className="text-sm text-medical-blue font-medium">{doc.specialization}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{doc.rating}</span>
                      <span className="text-xs text-slate-400 ml-1">{doc.experience_years} yrs exp</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
