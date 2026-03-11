import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, ArrowRight } from 'lucide-react';

const categories = ['All', 'Heart Health', 'Preventive Care', 'Disease Guide', 'Pediatrics', 'Mental Health', 'Technology'];

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = {};
    if (category !== 'All') params.category = category;
    if (search) params.search = search;
    api.get('/blog', { params }).then(r => setPosts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="pt-20" data-testid="blog-page">
      <section className="hero-gradient py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4">Health Resources</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Health Blog</h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Expert medical insights, health tips, and the latest in healthcare innovation.</p>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button key={cat} variant={category === cat ? 'default' : 'ghost'} size="sm"
                  className={`rounded-full text-xs ${category === cat ? 'bg-medical-blue text-white' : 'text-slate-600'}`}
                  onClick={() => setCategory(cat)} data-testid={`blog-cat-${cat.toLowerCase().replace(' ', '-')}`}>
                  {cat}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" data-testid="blog-search" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading articles...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No articles found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow card-hover opacity-0 animate-fade-up" style={{ animationDelay: `${(i % 6) * 100}ms` }} data-testid={`blog-post-${post.slug}`}>
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-medical-blue transition-colors">{post.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{post.excerpt}</p>
                    <span className="text-sm font-medium text-medical-blue flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
