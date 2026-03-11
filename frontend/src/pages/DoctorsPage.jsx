import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Search, CalendarDays, Clock } from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/doctors').then(r => setDoctors(r.data)),
      api.get('/departments').then(r => setDepartments(r.data))
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || d.department_id === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="pt-20" data-testid="doctors-page">
      <section className="hero-gradient py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-medical-emerald-light text-medical-emerald-dark border-0 mb-4">Our Specialists</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Find a Doctor</h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Browse our team of 200+ expert physicians and find the right specialist for you.</p>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-slate-100 sticky top-16 z-30" data-testid="doctor-filters">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" data-testid="doctor-search" />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-full sm:w-[220px]" data-testid="doctor-dept-filter">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading doctors...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No doctors found matching your criteria.</div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-6">{filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((doc, i) => (
                  <Link key={doc.id} to={`/doctors/${doc.id}`} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow card-hover opacity-0 animate-fade-up" style={{ animationDelay: `${(i % 8) * 80}ms` }} data-testid={`doctor-card-${doc.id}`}>
                    <div className="h-56 overflow-hidden bg-slate-100">
                      <img src={doc.image_url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading font-semibold text-slate-900 group-hover:text-medical-blue transition-colors">{doc.name}</h3>
                      <p className="text-sm text-medical-blue font-medium mt-0.5">{doc.specialization}</p>
                      <p className="text-xs text-slate-400 mt-1">{doc.department_name}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{doc.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" /> {doc.experience_years} yrs
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {doc.available_days?.slice(0, 3).map(d => (
                          <Badge key={d} variant="secondary" className="text-[10px] py-0">{d}</Badge>
                        ))}
                        {doc.available_days?.length > 3 && <Badge variant="secondary" className="text-[10px] py-0">+{doc.available_days.length - 3}</Badge>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
