import { Link } from 'react-router-dom';
import { Plus, Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';

const footerLinks = {
  'Quick Links': [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Departments', href: '/departments' },
    { label: 'Find a Doctor', href: '/doctors' },
    { label: 'Book Appointment', href: '/appointment' },
  ],
  'Services': [
    { label: 'Emergency Care', href: '/services' },
    { label: 'Diagnostic Tests', href: '/services' },
    { label: 'Health Checkups', href: '/services' },
    { label: 'Telemedicine', href: '/services' },
    { label: 'Surgery', href: '/services' },
  ],
  'Resources': [
    { label: 'Health Blog', href: '/blog' },
    { label: 'Patient Portal', href: '/portal' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300" data-testid="main-footer">
      {/* Emergency Banner */}
      <div className="bg-medical-rose text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse-soft">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-heading font-semibold text-sm">24/7 Emergency Helpline</p>
              <p className="text-white/80 text-xs">For immediate medical assistance</p>
            </div>
          </div>
          <a href="tel:+15550911" className="font-heading font-bold text-xl tracking-wide hover:underline" data-testid="emergency-number">
            +1 (555) 0911
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-medical-blue flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <span className="font-heading font-bold text-xl text-white">
                Lumina <span className="text-sky-400">Medical</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              World-class healthcare with a human touch. Providing comprehensive medical services with advanced technology and compassionate care since 1995.
            </p>
            <div className="space-y-3 text-sm">
              <a href="tel:+15550100" className="flex items-center gap-3 text-slate-400 hover:text-sky-400 transition-colors">
                <Phone className="w-4 h-4 text-medical-blue" /> +1 (555) 0100
              </a>
              <a href="mailto:info@luminamedical.com" className="flex items-center gap-3 text-slate-400 hover:text-sky-400 transition-colors">
                <Mail className="w-4 h-4 text-medical-blue" /> info@luminamedical.com
              </a>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-4 h-4 text-medical-blue shrink-0" /> 1200 Healthcare Blvd, Medical City, CA 90210
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Clock className="w-4 h-4 text-medical-blue" /> Mon-Sat: 8:00 AM - 9:00 PM
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-semibold text-white mb-4 text-sm tracking-wide uppercase">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Lumina Medical Center. All rights reserved.</p>
          <p>Committed to Excellence in Healthcare</p>
        </div>
      </div>
    </footer>
  );
}
