import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays, ArrowRight, Phone, Star, Heart, Brain, Bone,
  Baby, Scan, Shield, Activity, Stethoscope, Clock, Users, Award, Building2,
  ChevronRight, Quote, Search
} from 'lucide-react';

const iconMap = { Heart, Brain, Bone, Baby, Scan, Shield, Activity, Stethoscope };

const stats = [
  { value: '30+', label: 'Years of Excellence', icon: Award },
  { value: '200+', label: 'Expert Doctors', icon: Users },
  { value: '50K+', label: 'Happy Patients', icon: Heart },
  { value: '9', label: 'Departments', icon: Building2 },
];

const testimonials = [
  { name: 'Margaret Thompson', text: 'The cardiology team saved my life. Dr. Chen and his team provided exceptional care throughout my treatment and recovery.', rating: 5, dept: 'Cardiology Patient' },
  { name: 'Robert Williams', text: 'Outstanding orthopedic surgery experience. The robotic-assisted joint replacement gave me my mobility back. Truly grateful.', rating: 5, dept: 'Orthopedics Patient' },
  { name: 'Susan Davis', text: 'The pediatrics department is wonderful with children. Dr. Watson made my son feel comfortable and cared for during every visit.', rating: 5, dept: 'Pediatrics Patient' },
];

const insurancePartners = ['Aetna', 'Blue Cross', 'Cigna', 'United Health', 'Humana', 'Kaiser'];

export default function HomePage() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data.slice(0, 6))).catch(() => {});
    api.get('/doctors').then(r => setDoctors(r.data.slice(0, 4))).catch(() => {});
    api.get('/blog').then(r => setPosts(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="hero-gradient pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #0369a1 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-medical-emerald-light text-medical-emerald-dark border-0 px-4 py-1.5 font-medium" data-testid="hero-badge">
                Trusted by 50,000+ patients
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                World-Class <span className="text-medical-blue">Healthcare</span> With a Human Touch
              </h1>
              <p className="text-base md:text-lg text-slate-600 max-w-lg leading-relaxed">
                Advanced medical technology meets compassionate care. Our team of 200+ specialists ensures the best outcomes for you and your family.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/appointment" data-testid="hero-book-appointment">
                  <Button size="lg" className="rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white px-8 shadow-lg shadow-medical-blue/20 gap-2 w-full sm:w-auto">
                    <CalendarDays className="w-5 h-5" /> Book Appointment
                  </Button>
                </Link>
                <Link to="/doctors" data-testid="hero-find-doctor">
                  <Button size="lg" variant="outline" className="rounded-full px-8 gap-2 border-slate-300 w-full sm:w-auto">
                    <Search className="w-5 h-5" /> Find a Doctor
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-2">
                {stats.slice(0, 3).map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-heading font-bold text-2xl text-medical-blue">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-medical-blue/10 border border-slate-100">
                <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=700&h=500&fit=crop" alt="Lumina Medical Center" className="w-full h-[480px] object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-lg border border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-medical-emerald-light flex items-center justify-center">
                  <Shield className="w-6 h-6 text-medical-emerald" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm">HIPAA Compliant</p>
                  <p className="text-xs text-slate-500">Your data is secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-medical-rose text-white" data-testid="emergency-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 animate-pulse-soft" />
            <p className="font-heading font-semibold">24/7 Emergency Services Available</p>
          </div>
          <a href="tel:+15550911" className="font-heading font-bold text-lg hover:underline">Call: +1 (555) 0911</a>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={s.label} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center text-center opacity-0 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <s.icon className="w-8 h-8 text-medical-blue mb-3" />
                <p className="font-heading font-bold text-3xl text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-24 bg-slate-50" data-testid="departments-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4">Our Departments</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Specialized Medical Care</h2>
            <p className="text-base md:text-lg text-slate-500 mt-3 max-w-2xl mx-auto">Expert care across 9 specialized departments, equipped with the latest medical technology.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, i) => {
              const Icon = iconMap[dept.icon] || Stethoscope;
              return (
                <Link key={dept.id} to={`/departments/${dept.slug}`} className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-medical-blue/20 transition-all hover:shadow-lg card-hover opacity-0 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }} data-testid={`dept-card-${dept.slug}`}>
                  <div className="w-14 h-14 rounded-2xl bg-medical-blue-light flex items-center justify-center mb-4 group-hover:bg-medical-blue group-hover:text-white transition-colors">
                    <Icon className="w-7 h-7 text-medical-blue group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">{dept.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{dept.description}</p>
                  <span className="text-sm font-medium text-medical-blue flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn More <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link to="/departments" data-testid="view-all-departments">
              <Button variant="outline" className="rounded-full gap-2">View All Departments <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-24 bg-white" data-testid="doctors-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-medical-emerald-light text-medical-emerald-dark border-0 mb-4">Our Specialists</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Meet Our Expert Doctors</h2>
            <p className="text-base md:text-lg text-slate-500 mt-3 max-w-2xl mx-auto">Highly qualified specialists dedicated to your health and well-being.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc, i) => (
              <Link key={doc.id} to={`/doctors/${doc.id}`} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow card-hover opacity-0 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }} data-testid={`doctor-card-${i}`}>
                <div className="h-56 overflow-hidden bg-slate-100">
                  <img src={doc.image_url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-semibold text-slate-900">{doc.name}</h3>
                  <p className="text-sm text-medical-blue font-medium">{doc.specialization}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-slate-700">{doc.rating}</span>
                    <span className="text-xs text-slate-400 ml-1">{doc.experience_years} yrs exp</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/doctors" data-testid="view-all-doctors">
              <Button variant="outline" className="rounded-full gap-2">View All Doctors <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">What Our Patients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm opacity-0 animate-fade-up" style={{ animationDelay: `${i * 150}ms` }} data-testid={`testimonial-${i}`}>
                <Quote className="w-8 h-8 text-medical-blue/20 mb-4" />
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="font-heading font-semibold text-slate-900 text-sm">{t.name}</p>
                <p className="text-xs text-slate-500">{t.dept}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      {posts.length > 0 && (
        <section className="py-24 bg-white" data-testid="blog-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="bg-medical-emerald-light text-medical-emerald-dark border-0 mb-4">Health Resources</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Latest Health Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow card-hover" data-testid={`blog-card-${i}`}>
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <Badge variant="secondary" className="mb-3 text-xs">{post.category}</Badge>
                    <h3 className="font-heading font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-medical-blue transition-colors">{post.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/blog" data-testid="view-all-blog">
                <Button variant="outline" className="rounded-full gap-2">All Articles <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Insurance Partners */}
      <section className="py-16 bg-slate-50 border-y border-slate-100" data-testid="insurance-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500 mb-8 font-medium uppercase tracking-wide">Accepted Insurance Partners</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {insurancePartners.map((name) => (
              <div key={name} className="text-slate-400 font-heading font-bold text-lg hover:text-medical-blue transition-colors">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-medical-blue" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-sky-100 text-base md:text-lg mb-8 max-w-2xl mx-auto">Book an appointment with one of our specialists today and take the first step towards better health.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/appointment" data-testid="cta-book-appointment">
              <Button size="lg" className="rounded-full bg-white text-medical-blue hover:bg-sky-50 px-8 gap-2 shadow-lg w-full sm:w-auto">
                <CalendarDays className="w-5 h-5" /> Book Appointment
              </Button>
            </Link>
            <Link to="/contact" data-testid="cta-contact">
              <Button size="lg" variant="outline" className="rounded-full px-8 gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Contact Us <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
