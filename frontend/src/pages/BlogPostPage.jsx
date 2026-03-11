import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/blog/${slug}`).then(r => setPost(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pt-32 text-center text-slate-500">Loading...</div>;
  if (!post) return <div className="pt-32 text-center text-slate-500">Article not found</div>;

  return (
    <div className="pt-20" data-testid="blog-post-page">
      <section className="hero-gradient py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-medical-blue mb-6 transition-colors" data-testid="back-to-blog">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4">{post.category}</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.ceil(post.content.length / 1000)} min read</span>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden mb-10 border border-slate-100">
            <img src={post.image_url} alt={post.title} className="w-full h-[300px] md:h-[400px] object-cover" />
          </div>
          <article className="prose prose-slate max-w-none" data-testid="blog-content">
            {post.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-slate-600 leading-relaxed mb-6 text-base">{paragraph}</p>
            ))}
          </article>
          <div className="mt-12 pt-8 border-t border-slate-100">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-medical-blue hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to All Articles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
