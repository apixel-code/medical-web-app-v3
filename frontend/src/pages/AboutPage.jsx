import { Badge } from '@/components/ui/badge';
import { Award, Building2, Clock, Eye, Heart, Microscope, Shield, Star, Target, Users } from 'lucide-react';

const timeline = [
  { year: '1995', title: 'Foundation', desc: 'Modina Clinic & D. Center was founded with a vision to provide world-class healthcare.' },
  { year: '2002', title: 'Expansion', desc: 'Added 5 new specialized departments and 200-bed capacity.' },
  { year: '2010', title: 'Technology Upgrade', desc: 'Introduced robotic surgery and advanced diagnostic imaging.' },
  { year: '2018', title: 'Research Center', desc: 'Launched dedicated medical research and innovation center.' },
  { year: '2023', title: 'Digital Health', desc: 'Telemedicine and digital patient portal serving 50,000+ patients.' },
];

const leadership = [
  { name: 'Dr. Sarah Mitchell', role: 'Chief Medical Officer', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop', bio: '25+ years in healthcare leadership' },
  { name: 'Dr. Robert Chen', role: 'Head of Cardiology', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop', bio: '20+ years of cardiac excellence' },
  { name: 'Dr. Emily Watson', role: 'Head of Pediatrics', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964d8ba?w=300&h=300&fit=crop', bio: '15+ years of children\'s healthcare' },
  { name: 'James Harrison', role: 'CEO & Administrator', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop', bio: 'MBA, 20+ years hospital management' },
];

const certifications = [
  { name: 'JCI Accredited', icon: Award, desc: 'Joint Commission International Gold Seal' },
  { name: 'ISO 9001:2015', icon: Shield, desc: 'Quality Management System Certified' },
  { name: 'NABH Certified', icon: Star, desc: 'National Accreditation Board for Hospitals' },
  { name: 'CAP Accredited', icon: Microscope, desc: 'College of American Pathologists' },
];

const facilities = [
  { name: '500+ Bed Capacity', icon: Building2 },
  { name: '24/7 Emergency Care', icon: Clock },
  { name: '15 Operating Theaters', icon: Heart },
  { name: '200+ Specialist Doctors', icon: Users },
];

export default function AboutPage() {
  return (
    <div className="pt-20" data-testid="about-page">
      {/* Hero */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4">About Us</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                A Legacy of <span className="text-medical-blue">Healing</span> Since 1995
              </h1>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6">
                Modina Clinic & D. Center has been at the forefront of healthcare innovation for over 30 years. We combine cutting-edge technology with compassionate care to deliver exceptional medical outcomes.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Our 500+ bed facility serves over 50,000 patients annually, supported by a team of 200+ specialists across 9 specialized departments. We are committed to advancing medical science while keeping the human touch at the center of everything we do.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-100">
              <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=700&h=500&fit=crop" alt="Modina Clinic & D. Center Building" className="w-full h-[400px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white" data-testid="mission-vision">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-medical-blue-light rounded-3xl p-8 md:p-10">
              <div className="w-14 h-14 rounded-2xl bg-medical-blue flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                To provide world-class medical care with a human touch, leveraging advanced technology and evidence-based practices to improve health outcomes for every patient who walks through our doors.
              </p>
            </div>
            <div className="bg-medical-emerald-light rounded-3xl p-8 md:p-10">
              <div className="w-14 h-14 rounded-2xl bg-medical-emerald flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                To be the global benchmark in healthcare excellence, recognized for innovation, patient satisfaction, and our commitment to advancing medical science for the benefit of communities worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-slate-50" data-testid="history-timeline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4">Our Journey</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Hospital History</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-0">
            {timeline.map((item, i) => (
              <div key={item.year} className="flex gap-6 opacity-0 animate-fade-up" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-medical-blue flex items-center justify-center text-white font-heading font-bold text-xs shrink-0">{item.year}</div>
                  {i < timeline.length - 1 && <div className="w-0.5 h-full bg-medical-blue/20 my-2" />}
                </div>
                <div className="pb-10">
                  <h4 className="font-heading font-semibold text-lg text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 bg-white" data-testid="leadership-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-medical-emerald-light text-medical-emerald-dark border-0 mb-4">Leadership</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Our Leadership Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((person, i) => (
              <div key={person.name} className="text-center opacity-0 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }} data-testid={`leader-${i}`}>
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-medical-blue-light">
                  <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-heading font-semibold text-slate-900">{person.name}</h4>
                <p className="text-sm text-medical-blue font-medium">{person.role}</p>
                <p className="text-xs text-slate-500 mt-1">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-24 bg-slate-50" data-testid="certifications-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4">Accreditations</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Certifications & Accreditations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, i) => (
              <div key={cert.name} className="bg-white rounded-2xl p-6 border border-slate-100 text-center opacity-0 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <cert.icon className="w-10 h-10 text-medical-blue mx-auto mb-3" />
                <h4 className="font-heading font-semibold text-slate-900 text-sm">{cert.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-16 bg-white" data-testid="facilities-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {facilities.map((f) => (
              <div key={f.name} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <f.icon className="w-8 h-8 text-medical-blue" />
                <p className="font-heading font-semibold text-sm text-slate-900 text-center">{f.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
