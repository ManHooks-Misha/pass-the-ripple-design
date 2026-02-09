import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Info, Shield, HelpCircle, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/config/api';
import Seo from '@/components/Seo';

interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastUpdated: string;
}

const Content = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSlug = searchParams.get('page') || 'about-us';

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiFetch<{ data: PageContent }>(`/pages/${pageSlug}`);
        
        if (response.data) {
          setPage({
            id: response.data.id.toString(),
            title: response.data.title,
            slug: response.data.slug,
            content: response.data.content,
            lastUpdated: new Date(response.data.updated_at || response.data.created_at).toLocaleDateString()
          });
        } else {
          setError('Page not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch page', err);
        setError(err.message || 'Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageSlug]);

  const getIcon = (slug: string) => {
    switch (slug) {
      case 'about-us': return <Info className="h-5 w-5" />;
      case 'faq': return <HelpCircle className="h-5 w-5" />;
      case 'terms-of-service':
      case 'terms-of-service': return <FileText className="h-5 w-5" />;
      case 'privacy-policy': return <Shield className="h-5 w-5" />;
      case 'contact': return <Users className="h-5 w-5" />;
      case 'help': return <HelpCircle className="h-5 w-5" />;
      case 'community-guidelines': return <Users className="h-5 w-5" />;
      case 'how-it-works': return <BookOpen className="h-5 w-5" />;
      case 'safety-guidelines': return <Shield className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
              <p className="text-gray-600 mb-6">
                {error || 'The requested page could not be found.'}
              </p>
              <Link to="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Seo
        title={`${page.title} | Pass The Ripple`}
        description={`${page.title} - Learn more about Pass The Ripple and our mission to spread kindness worldwide.`}
        canonical={`${window.location.origin}/content?page=${page.slug}`}
      />
      
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Page Content */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              {getIcon(page.slug)}
              <div>
                <CardTitle className="text-2xl">{page.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {page.lastUpdated}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-8">
            <div
              className="cms-content"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </CardContent>
        </Card>

        {/* Related Links */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              to="/content?page=about-us" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Info className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">About Us</span>
            </Link>
            <Link 
              to="/content?page=faq" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <HelpCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">FAQ</span>
            </Link>
            <Link 
              to="/content?page=how-it-works" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">How It Works</span>
            </Link>
            <Link 
              to="/content?page=safety-guidelines" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">Safety</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
