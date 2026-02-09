import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/config/api';
import Seo from '@/components/Seo';
import footprint from "@/assets/Footprint.png";

interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastUpdated: string;
}

const PrivacyPolicy = () => {
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiFetch<{ data: PageContent }>('/view-pages/privacy-policy');
        
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
        console.error('Failed to fetch privacy policy page', err);
        setError(err.message || 'Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, []);

  if (loading) {
    return (
      <main className="container py-8 relative">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </main>
    );
  }

  if (error || !page) {
    return (
      <main className="container py-8 relative">
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
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
      </main>
    );
  }

  return (
    <main className="min-h-screen  relative overflow-hidden">
      <Seo
        title={`${page.title} | Pass The Ripple`}
        description={`${page.title} - Learn how Pass The Ripple protects your privacy and data.`}
        canonical={window.location.origin + "/privacy-policy"}
      />
      
      {/* Footprint Graphics */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img src={footprint} alt="" className="absolute top-12 left-12 w-10 h-10 md:w-14 md:h-14 opacity-25" style={{ transform: 'rotate(-10deg)' }} />
        <img src={footprint} alt="" className="absolute bottom-20 right-16 w-12 h-12 md:w-16 md:h-16 opacity-30" style={{ transform: 'rotate(25deg)' }} />
      </div>
      
      <div className="container max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
        {/* Back Button */}
        {/* <div className="mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div> */}

        {/* Page Content */}
        <div className=" shadow-none relative" >
          <div className="py-8">
            <div
              className="cms-content"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
