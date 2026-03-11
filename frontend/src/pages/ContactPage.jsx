import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '+1 (555) 0100', href: 'tel:+15550100' },
  { icon: Mail, label: 'Email', value: 'info@luminamedical.com', href: 'mailto:info@luminamedical.com' },
  { icon: MapPin, label: 'Address', value: '1200 Healthcare Blvd, Medical City, CA 90210', href: null },
  { icon: Clock, label: 'Hours', value: 'Mon-Sat: 8:00 AM - 9:00 PM', href: null },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20" data-testid="contact-page">
      {/* Hero */}
      <section className="hero-gradient py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4">Get In Touch</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Have a question or need assistance? We're here to help. Reach out to us anytime.</p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-heading font-bold text-2xl text-slate-900 mb-6">Contact Information</h2>
                <div className="space-y-5">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-4" data-testid={`contact-info-${item.label.toLowerCase()}`}>
                      <div className="w-11 h-11 rounded-xl bg-medical-blue-light flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-medical-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-sm text-slate-500 hover:text-medical-blue transition-colors">{item.value}</a>
                        ) : (
                          <p className="text-sm text-slate-500">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency */}
              <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                <h3 className="font-heading font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-medical-rose" /> Emergency Contact
                </h3>
                <a href="tel:+15550911" className="text-2xl font-heading font-bold text-medical-rose">+1 (555) 0911</a>
                <p className="text-sm text-red-700 mt-1">Available 24 hours, 7 days a week</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              {sent ? (
                <div className="bg-medical-emerald-light rounded-2xl p-12 text-center" data-testid="contact-success">
                  <CheckCircle className="w-16 h-16 text-medical-emerald mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-2xl text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600 mb-6">Thank you for contacting us. We'll get back to you within 24 hours.</p>
                  <Button onClick={() => setSent(false)} className="rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm" data-testid="contact-form">
                  <h2 className="font-heading font-bold text-2xl text-slate-900 mb-6">Send us a Message</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" className="mt-1.5" data-testid="contact-name" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@example.com" className="mt-1.5" data-testid="contact-email" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 0000" className="mt-1.5" data-testid="contact-phone" />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input id="subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="General Inquiry" className="mt-1.5" data-testid="contact-subject" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="How can we help you?" rows={5} className="mt-1.5" data-testid="contact-message" />
                  </div>
                  <Button type="submit" disabled={loading} className="rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white px-8 gap-2" data-testid="contact-submit">
                    <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-slate-50 py-16" data-testid="map-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-2xl text-slate-900">Find Us</h2>
            <p className="text-sm text-slate-500 mt-2">Located in the heart of Medical City for easy access</p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '400px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.7152203584424!2d-118.2941!3d34.0522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1640000000000!5m2!1sen!2sus"
              width="100%" height="100%" style={{ border: 0, filter: 'grayscale(30%)' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Lumina Medical Center Location"
              data-testid="google-map"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
