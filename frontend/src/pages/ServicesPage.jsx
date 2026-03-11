import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TestTube2, ClipboardCheck, Scissors, Syringe, Ambulance, Video, Activity, Microscope, ArrowRight, CalendarDays } from 'lucide-react';

const iconMap = {
  TestTube: TestTube2, ClipboardCheck, Scissors, Syringe, Ambulance, Video, Activity, Microscope,
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data)).catch(() => {});
  }, []);

  return (
    <div className="pt-20" data-testid="services-page">
      <section className="hero-gradient py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-medical-emerald-light text-medical-emerald-dark border-0 mb-4">What We Offer</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Our Services</h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Comprehensive medical services tailored to your healthcare needs.</p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc, i) => {
              const Icon = iconMap[svc.icon] || Activity;
              return (
                <div key={svc.id} className="group bg-white rounded-3xl p-8 border border-slate-100 hover:border-medical-blue/20 hover:shadow-lg transition-all card-hover opacity-0 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }} data-testid={`service-${svc.slug}`}>
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-medical-blue-light flex items-center justify-center shrink-0 group-hover:bg-medical-blue transition-colors">
                      <Icon className="w-8 h-8 text-medical-blue group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">{svc.name}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{svc.description}</p>
                      <Link to="/appointment" className="inline-flex items-center gap-1 text-sm font-medium text-medical-blue mt-4 hover:gap-2 transition-all">
                        Book Now <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-medical-blue" data-testid="services-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Need a Service Not Listed?</h2>
          <p className="text-sky-100 mb-6">Contact us to learn about all our medical services and how we can help you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/appointment">
              <Button size="lg" className="rounded-full bg-white text-medical-blue hover:bg-sky-50 gap-2 w-full sm:w-auto">
                <CalendarDays className="w-5 h-5" /> Book Appointment
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 gap-2 w-full sm:w-auto">
                Contact Us <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
