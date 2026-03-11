import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Bone, Baby, Scan, Shield, Activity, Stethoscope, ChevronRight, CalendarDays } from 'lucide-react';

const iconMap = { Heart, Brain, Bone, Baby, Scan, Shield, Activity, Stethoscope };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data)).catch(() => {});
  }, []);

  return (
    <div className="pt-20" data-testid="departments-page">
      <section className="hero-gradient py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4">Specialized Care</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Our Departments</h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Nine specialized departments equipped with advanced technology and staffed by expert physicians.</p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, i) => {
              const Icon = iconMap[dept.icon] || Stethoscope;
              return (
                <Link key={dept.id} to={`/departments/${dept.slug}`} className="group bg-white rounded-3xl p-8 border border-slate-100 hover:border-medical-blue/20 transition-all hover:shadow-xl card-hover opacity-0 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }} data-testid={`dept-${dept.slug}`}>
                  <div className="w-16 h-16 rounded-2xl bg-medical-blue-light flex items-center justify-center mb-6 group-hover:bg-medical-blue transition-colors">
                    <Icon className="w-8 h-8 text-medical-blue group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">{dept.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">{dept.description}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {dept.services?.slice(0, 3).map(s => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                    {dept.services?.length > 3 && <Badge variant="secondary" className="text-xs">+{dept.services.length - 3} more</Badge>}
                  </div>
                  <span className="text-sm font-medium text-medical-blue flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Department <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-medical-blue" data-testid="dept-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Need Help Choosing a Department?</h2>
          <p className="text-sky-100 mb-6">Our team can guide you to the right specialist based on your symptoms.</p>
          <Link to="/appointment">
            <Button size="lg" className="rounded-full bg-white text-medical-blue hover:bg-sky-50 px-8 gap-2">
              <CalendarDays className="w-5 h-5" /> Book a Consultation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
