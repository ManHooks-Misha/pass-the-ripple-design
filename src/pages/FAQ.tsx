import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/config/api';
import Seo from '@/components/Seo';
import footprint from "@/assets/Footprint.png";
import faqHeadTitle from "@/assets/page-img/FAQ title.png";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  created_at: string;
  // Optional fields that may not be present in public API
  is_active?: boolean;
  created_by?: number;
  updated_by?: number;
  updated_at?: string;
  creator?: {
    id: number;
    nickname: string;
    email: string;
  };
  updater?: {
    id: number;
    nickname: string;
    email: string;
  };
}

const FAQ = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch FAQs only
        const faqsResponse = await apiFetch('/faqs') as any;
        
        if (faqsResponse.success && faqsResponse.data) {
          // Handle the public endpoint response structure: response.data.faqs.data
          const faqsData = faqsResponse.data?.faqs?.data || [];
          setFaqs(faqsData);
        } else {
          setFaqs([]);
        }
        
      } catch (err: any) {
        console.error('Failed to fetch FAQs', err);
        console.error('Error details:', err);
        
        // Check if it's an authentication error
        if (err.message?.includes('Authentication required') || err.message?.includes('Unauthorized')) {
          setError('The FAQ system is currently being set up. Please check back later.');
        } else if (err.message?.includes('404') || err.message?.includes('Not Found')) {
          setError('FAQ endpoint not found. The FAQ system may not be fully configured yet.');
        } else {
          setError(err.message || 'Failed to load FAQs. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
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

  if (error) {
    return (
      <main className="container py-8 relative">
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">❓</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading FAQs</h1>
            <p className="text-gray-600 mb-6">
              {error}
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

  const filteredFAQs = Array.isArray(faqs) ? faqs : [];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <main className="min-h-screen  relative overflow-hidden">
      <Seo
        title="Frequently Asked Questions | Pass The Ripple"
        description="Find answers to frequently asked questions about Pass The Ripple. Get help with account, features, and more."
        canonical={window.location.origin + "/faq"}
      />
      
      {/* Footprint Graphics */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img src={footprint} alt="" className="absolute top-12 left-12 w-10 h-10 md:w-14 md:h-14 opacity-25" style={{ transform: 'rotate(-15deg)' }} />
        <img src={footprint} alt="" className="absolute bottom-20 right-16 w-12 h-12 md:w-16 md:h-16 opacity-30" style={{ transform: 'rotate(20deg)' }} />
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

        {/* Header */}
        <div className="text-center mb-8">
          <img
                src={faqHeadTitle}
                alt="Get In Touch"
                className="mx-auto mb-4 w-full"
              />
          <p className="text-base md:text-xl text-gray-900 mx-auto">
            Find answers to common questions about Pass The Ripple. Can't find what you're looking for? 
            <Link to="/contact-us" className="text-blue-600 hover:underline ml-1">Contact us</Link>.
          </p>
        </div>


        {/* FAQs List */}
        <div className="space-y-4 p-4">
          {filteredFAQs.length === 0 ? (
            <Card className=" shadow-none relative" style={{
              borderRadius: '45px 38px 42px 40px / 42px 40px 38px 45px',
              border: '2px solid #374151',
              borderStyle: 'solid'
            }}>
              <CardContent className="text-center py-12">
                <div className="text-4xl mb-4">🤔</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">No FAQs Found</h3>
                <p className="text-gray-900 mb-4">
                  No frequently asked questions are available at the moment.
                </p>
                {faqs.length === 0 && (
                  <div className="text-sm text-gray-900">
                    <p>This might be because:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>No FAQs have been created yet</li>
                      <li>All FAQs are currently inactive</li>
                      <li>There's a temporary issue loading the content</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((faq) => (
              <Card 
                key={faq.id} 
                className=" shadow-none relative hover:shadow-md transition-shadow" 
                style={{
                  borderRadius: '45px 38px 42px 40px / 42px 40px 38px 45px',
                  border: '2px solid #374151',
                  borderStyle: 'solid'
                }}
              >
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-left text-gray-900 font-black">
                      {faq.question}
                    </CardTitle>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-purple-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                </CardHeader>
                {expandedFAQ === faq.id && (
                  <CardContent className="pt-0">
                    <div className="prose prose-sm max-w-none text-gray-900">
                      <p className="whitespace-pre-wrap">{faq.answer}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default FAQ;
