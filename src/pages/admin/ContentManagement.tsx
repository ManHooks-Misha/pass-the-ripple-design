import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, Edit, FileText, Info, Shield, HelpCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, apiFetchFormData, API_BASE_URL } from '@/config/api';

interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastUpdated: string;
}

interface ApiPageResponse {
  id: number;
  slug: string;
  title: string;
  content: string;
  updated_at?: string;
  created_at: string;
}

interface CKEditor {
  setData: (data: string) => void;
  getData: () => string;
  destroy: () => Promise<void>;
  model: {
    document: {
      on: (event: string, callback: () => void) => void;
    };
  };
}

declare const CKEDITOR: {
  ClassicEditor: {
    create: (element: HTMLElement, config: any) => Promise<CKEditor>;
  };
};

export default function ContentManagement() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const editorRef = useRef<CKEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: ApiPageResponse[] }>('/admin/pages');
      if (res.data) {
        const formattedPages = res.data.map(p => ({
          id: p.id.toString(),
          slug: p.slug,
          title: p.title,
          content: p.content,
          lastUpdated: new Date(p.updated_at || p.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
        }));
        setPages(formattedPages);
        if (formattedPages.length > 0) {
          setSelectedPage(formattedPages[0]);
          setEditContent(formattedPages[0].content);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch pages', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to load pages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      setEditContent(selectedPage.content);
      setEditMode(false);
    }
  }, [selectedPage]);

  useEffect(() => {
    if (editMode && editorContainerRef.current) {
      // Custom upload adapter for CKEditor
      function uploadAdapter(loader: any) {
        return {
          upload: () => {
            return new Promise((resolve, reject) => {
              loader.file.then(async (file: File) => {
                try {
                  const formData = new FormData();
                  formData.append('file', file);

                  const response = await apiFetchFormData<{ success: boolean; data: { url: string } }>(
                    '/admin/upload-content-media',
                    {
                      method: 'POST',
                      body: formData,
                    }
                  );

                  if (response.success && response.data.url) {
                    resolve({
                      default: response.data.url
                    });
                  } else {
                    reject('Upload failed');
                  }
                } catch (error) {
                  reject(error);
                }
              });
            });
          }
        };
      }

      function uploadAdapterPlugin(editor: any) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
          return uploadAdapter(loader);
        };
      }

      // @ts-ignore - Use ClassicEditor from super-build
      CKEDITOR.ClassicEditor.create(editorContainerRef.current, {
        extraPlugins: [uploadAdapterPlugin],
        removePlugins: [
          'PasteFromOfficeEnhanced',  // Premium
          'RealTimeCollaborativeEditing',  // Premium
          'RealTimeCollaborativeComments',  // Premium
          'RealTimeCollaborativeTrackChanges',  // Premium
          'RealTimeCollaborativeRevisionHistory',  // Premium
          'PresenceList',  // Premium
          'Comments',  // Premium
          'TrackChanges',  // Premium
          'TrackChangesData',  // Premium
          'RevisionHistory',  // Premium
          'Pagination',  // Premium
          'WProofreader',  // Premium
          'MathType',  // Premium
          'SlashCommand',  // Premium
          'DocumentOutline',  // Premium
          'AIAssistant',  // Premium
          'MultiLevelList',  // Premium
          'TableOfContents',  // Premium
          'CaseChange',  // Premium
          'Template',  // Premium
          'FormatPainter',  // Premium - NEW: Added this plugin
          'Markdown'  // Premium - Add this if present  
        ],
        toolbar: {
          items: [
            'heading', '|',
            'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'alignment', '|',
            'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed', '|',
            'bulletedList', 'numberedList', '|',
            'indent', 'outdent', '|',
            'sourceEditing', '|',
            'undo', 'redo'
          ],
          shouldNotGroupWhenFull: true
        },
        htmlSupport: {
          allow: [
            {
              name: 'div',
              classes: true,
              styles: true,
              attributes: true
            },
            {
              name: 'img',
              classes: true,
              styles: true,
              attributes: true
            },
            {
              name: /.*/,
              attributes: true,
              classes: true,
              styles: true
            }
          ]
        },
        image: {
          toolbar: [
            'imageTextAlternative',
            'toggleImageCaption', '|',
            'imageStyle:inline',
            'imageStyle:alignLeft',
            'imageStyle:alignCenter',
            'imageStyle:alignRight',
            'imageStyle:side', '|',
            'resizeImage'
          ],
          resizeUnit: '%',
          resizeOptions: [
            {
              name: 'resizeImage:original',
              value: null,
              label: 'Original'
            },
            {
              name: 'resizeImage:20',
              value: '20',
              label: '20%'
            },
            {
              name: 'resizeImage:30',
              value: '30',
              label: '30%'
            },
            {
              name: 'resizeImage:40',
              value: '40',
              label: '40%'
            },
            {
              name: 'resizeImage:50',
              value: '50',
              label: '50%'
            },
            {
              name: 'resizeImage:60',
              value: '60',
              label: '60%'
            },
            {
              name: 'resizeImage:75',
              value: '75',
              label: '75%'
            },
            {
              name: 'resizeImage:100',
              value: '100',
              label: '100%'
            }
          ]
        },
        table: {
          contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableProperties',
            'tableCellProperties'
          ]
        },
        mediaEmbed: {
          previewsInData: true
        }
      })
        .then((editor: any) => {
          editorRef.current = editor;
          editor.setData(editContent);
          editor.model.document.on('change:data', () => setEditContent(editor.getData()));
        })
        .catch((err: any) => {
          console.error('Failed to initialize CKEditor:', err);
          toast({
            title: 'Editor Error',
            description: 'Failed to load the editor. Please refresh the page or use a different browser.',
            variant: 'destructive',
          });
        });

      return () => {
        if (editorRef.current) editorRef.current.destroy().catch(() => {});
      };
    }
  }, [editMode]);


  const savePage = async () => {
    if (!selectedPage) return;
    setSaving(true);
    try {
      const res = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/update-pages/${selectedPage.slug}`,
        {
          method: 'PUT',
          body: JSON.stringify({ content: editContent }),
        }
      );

      if (res.success) {
        toast({ 
          title: 'Success', 
          description: 'Content has been saved successfully.' 
        });
        const updatedPages = pages.map(p =>
          p.id === selectedPage.id
            ? { ...p, content: editContent, lastUpdated: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) }
            : p
        );
        setPages(updatedPages);
        setEditMode(false);
        setSelectedPage(updatedPages.find(p => p.id === selectedPage.id) || null);
      } else {
        throw new Error(res.message || 'Failed to update page');
      }
    } catch (err: any) {
      console.error(err);
      toast({ 
        title: 'Error', 
        description: err.message || 'Failed to update page', 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePagePreview = () => {
    if (!selectedPage) return;
    const previewUrl = `/${selectedPage.slug}`;
    window.open(previewUrl, '_blank');
  };

  const getIcon = (slug: string) => {
    switch (slug) {
      case 'about-us': return <Info className="h-4 w-4" />;
      case 'faq': return <HelpCircle className="h-4 w-4" />;
      case 'terms-of-service':
      case 'terms-of-service': return <FileText className="h-4 w-4" />;
      case 'privacy-policy': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading pages...</p>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-3">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-lg">No Pages Found</h3>
            <p className="text-sm text-muted-foreground">
              No content pages are available to manage at this time.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Editor container minimum height */
        .ck-editor__editable {
          min-height: 500px;
        }

        /* Toolbar styling */
        .ck.ck-toolbar {
          border: none !important;
          background: #f9fafb !important;
          padding: 0.75rem !important;
        }

        .ck.ck-editor__main > .ck-editor__editable {
          border: none !important;
        }

        /* Responsive font sizes and line heights for editor content */
        .ck-editor__editable {
          font-size: 14px;
          line-height: 1.6;
          color: #1f2937;
        }

        /* Mobile screens (default) */
        @media (max-width: 639px) {
          .ck-editor__editable {
            font-size: 14px;
            line-height: 1.6;
          }
          .ck-editor__editable p {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 0.875rem;
          }
          .ck-editor__editable h1 {
            font-size: 24px;
            line-height: 1.3;
            margin-bottom: 1rem;
            font-weight: 700;
          }
          .ck-editor__editable h2 {
            font-size: 20px;
            line-height: 1.35;
            margin-bottom: 0.875rem;
            font-weight: 600;
          }
          .ck-editor__editable h3 {
            font-size: 18px;
            line-height: 1.4;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }
          .ck-editor__editable h4 {
            font-size: 16px;
            line-height: 1.45;
            margin-bottom: 0.625rem;
            font-weight: 600;
          }
          .ck-editor__editable h5 {
            font-size: 15px;
            line-height: 1.5;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }
          .ck-editor__editable h6 {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }
        }

        /* Tablet screens */
        @media (min-width: 640px) and (max-width: 1023px) {
          .ck-editor__editable {
            font-size: 15px;
            line-height: 1.65;
          }
          .ck-editor__editable p {
            font-size: 15px;
            line-height: 1.65;
            margin-bottom: 1rem;
          }
          .ck-editor__editable h1 {
            font-size: 28px;
            line-height: 1.3;
            margin-bottom: 1.125rem;
            font-weight: 700;
          }
          .ck-editor__editable h2 {
            font-size: 24px;
            line-height: 1.35;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          .ck-editor__editable h3 {
            font-size: 20px;
            line-height: 1.4;
            margin-bottom: 0.875rem;
            font-weight: 600;
          }
          .ck-editor__editable h4 {
            font-size: 18px;
            line-height: 1.45;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }
          .ck-editor__editable h5 {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 0.625rem;
            font-weight: 600;
          }
          .ck-editor__editable h6 {
            font-size: 15px;
            line-height: 1.5;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }
        }

        /* Desktop screens */
        @media (min-width: 1024px) {
          .ck-editor__editable {
            font-size: 16px;
            line-height: 1.7;
          }
          .ck-editor__editable p {
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 1.125rem;
          }
          .ck-editor__editable h1 {
            font-size: 32px;
            line-height: 1.3;
            margin-bottom: 1.25rem;
            font-weight: 700;
          }
          .ck-editor__editable h2 {
            font-size: 28px;
            line-height: 1.35;
            margin-bottom: 1.125rem;
            font-weight: 600;
          }
          .ck-editor__editable h3 {
            font-size: 24px;
            line-height: 1.4;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          .ck-editor__editable h4 {
            font-size: 20px;
            line-height: 1.45;
            margin-bottom: 0.875rem;
            font-weight: 600;
          }
          .ck-editor__editable h5 {
            font-size: 18px;
            line-height: 1.5;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }
          .ck-editor__editable h6 {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 0.625rem;
            font-weight: 600;
          }
        }

        /* Large desktop screens */
        @media (min-width: 1280px) {
          .ck-editor__editable {
            font-size: 17px;
            line-height: 1.75;
          }
          .ck-editor__editable p {
            font-size: 17px;
            line-height: 1.75;
            margin-bottom: 1.25rem;
          }
          .ck-editor__editable h1 {
            font-size: 36px;
            line-height: 1.3;
            margin-bottom: 1.5rem;
            font-weight: 700;
          }
          .ck-editor__editable h2 {
            font-size: 30px;
            line-height: 1.35;
            margin-bottom: 1.25rem;
            font-weight: 600;
          }
          .ck-editor__editable h3 {
            font-size: 26px;
            line-height: 1.4;
            margin-bottom: 1.125rem;
            font-weight: 600;
          }
          .ck-editor__editable h4 {
            font-size: 22px;
            line-height: 1.45;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          .ck-editor__editable h5 {
            font-size: 19px;
            line-height: 1.5;
            margin-bottom: 0.875rem;
            font-weight: 600;
          }
          .ck-editor__editable h6 {
            font-size: 17px;
            line-height: 1.5;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }
        }

        /* Lists styling */
        .ck-editor__editable ul,
        .ck-editor__editable ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .ck-editor__editable li {
          margin-bottom: 0.5rem;
          line-height: inherit;
        }

        /* Table styling */
        .ck-editor__editable table {
          margin: 1rem 0;
          border-collapse: collapse;
          width: 100%;
        }

        .ck-editor__editable table td,
        .ck-editor__editable table th {
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
        }

        .ck-editor__editable table th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        /* Blockquote styling */
        .ck-editor__editable blockquote {
          margin: 1rem 0;
          padding: 0.75rem 1rem;
          border-left: 4px solid #3b82f6;
          background-color: #f0f9ff;
          font-style: italic;
        }

        /* Link styling */
        .ck-editor__editable a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .ck-editor__editable a:hover {
          color: #2563eb;
        }

        /* Image styling */
        .ck-editor__editable img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
        }

        /* Code styling */
        .ck-editor__editable code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.875em;
        }

        .ck-editor__editable pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .ck-editor__editable pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }

        /* Content Preview Styling (matches editor for consistency) */
        .content-preview {
          color: #1f2937;
        }

        /* Mobile - Content Preview */
        @media (max-width: 639px) {
          .content-preview {
            font-size: 14px;
            line-height: 1.6;
          }
          .content-preview p {
            margin-bottom: 0.875rem;
          }
          .content-preview h1 {
            font-size: 24px;
            line-height: 1.3;
            margin-bottom: 1rem;
            font-weight: 700;
          }
          .content-preview h2 {
            font-size: 20px;
            line-height: 1.35;
            margin-bottom: 0.875rem;
            font-weight: 600;
          }
          .content-preview h3 {
            font-size: 18px;
            line-height: 1.4;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }
          .content-preview h4 {
            font-size: 16px;
            line-height: 1.45;
            margin-bottom: 0.625rem;
            font-weight: 600;
          }
          .content-preview h5 {
            font-size: 15px;
            line-height: 1.5;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }
          .content-preview h6 {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }
        }

        /* Tablet - Content Preview */
        @media (min-width: 640px) and (max-width: 1023px) {
          .content-preview {
            font-size: 15px;
            line-height: 1.65;
          }
          .content-preview p {
            margin-bottom: 1rem;
          }
          .content-preview h1 {
            font-size: 28px;
            line-height: 1.3;
            margin-bottom: 1.125rem;
            font-weight: 700;
          }
          .content-preview h2 {
            font-size: 24px;
            line-height: 1.35;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          .content-preview h3 {
            font-size: 20px;
            line-height: 1.4;
            margin-bottom: 0.875rem;
            font-weight: 600;
          }
          .content-preview h4 {
            font-size: 18px;
            line-height: 1.45;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }
          .content-preview h5 {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 0.625rem;
            font-weight: 600;
          }
          .content-preview h6 {
            font-size: 15px;
            line-height: 1.5;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }
        }

        /* Desktop - Content Preview */
        @media (min-width: 1024px) {
          .content-preview {
            font-size: 16px;
            line-height: 1.7;
          }
          .content-preview p {
            margin-bottom: 1.125rem;
          }
          .content-preview h1 {
            font-size: 32px;
            line-height: 1.3;
            margin-bottom: 1.25rem;
            font-weight: 700;
          }
          .content-preview h2 {
            font-size: 28px;
            line-height: 1.35;
            margin-bottom: 1.125rem;
            font-weight: 600;
          }
          .content-preview h3 {
            font-size: 24px;
            line-height: 1.4;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          .content-preview h4 {
            font-size: 20px;
            line-height: 1.45;
            margin-bottom: 0.875rem;
            font-weight: 600;
          }
          .content-preview h5 {
            font-size: 18px;
            line-height: 1.5;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }
          .content-preview h6 {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 0.625rem;
            font-weight: 600;
          }
        }

        /* Large Desktop - Content Preview */
        @media (min-width: 1280px) {
          .content-preview {
            font-size: 17px;
            line-height: 1.75;
          }
          .content-preview p {
            margin-bottom: 1.25rem;
          }
          .content-preview h1 {
            font-size: 36px;
            line-height: 1.3;
            margin-bottom: 1.5rem;
            font-weight: 700;
          }
          .content-preview h2 {
            font-size: 30px;
            line-height: 1.35;
            margin-bottom: 1.25rem;
            font-weight: 600;
          }
          .content-preview h3 {
            font-size: 26px;
            line-height: 1.4;
            margin-bottom: 1.125rem;
            font-weight: 600;
          }
          .content-preview h4 {
            font-size: 22px;
            line-height: 1.45;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          .content-preview h5 {
            font-size: 19px;
            line-height: 1.5;
            margin-bottom: 0.875rem;
            font-weight: 600;
          }
          .content-preview h6 {
            font-size: 17px;
            line-height: 1.5;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }
        }

        /* Content Preview - Additional Elements */
        .content-preview ul,
        .content-preview ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .content-preview li {
          margin-bottom: 0.5rem;
        }

        .content-preview table {
          margin: 1rem 0;
          border-collapse: collapse;
          width: 100%;
        }

        .content-preview table td,
        .content-preview table th {
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
        }

        .content-preview table th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        .content-preview blockquote {
          margin: 1rem 0;
          padding: 0.75rem 1rem;
          border-left: 4px solid #3b82f6;
          background-color: #f0f9ff;
          font-style: italic;
        }

        .content-preview a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .content-preview a:hover {
          color: #2563eb;
        }

        .content-preview img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 0.375rem;
        }

        .content-preview code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.875em;
        }

        .content-preview pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .content-preview pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>
      <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Content Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Edit and manage your website's static pages and content
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pages</CardTitle>
              <CardDescription className="text-xs">
                {pages.length} {pages.length === 1 ? 'page' : 'pages'} available
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {pages.map(page => (
                  <Button
                    key={page.id}
                    variant={selectedPage?.id === page.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm h-auto py-2.5 px-3"
                    onClick={() => setSelectedPage(page)}
                  >
                    {getIcon(page.slug)}
                    <span className="ml-2 text-left flex-1">{page.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedPage && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{selectedPage.title}</CardTitle>
                    <CardDescription>
                      Last updated: {selectedPage.lastUpdated}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!editMode ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={handlePagePreview}
                          className="w-full sm:w-auto"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" /> Preview
                        </Button>
                        <Button onClick={() => setEditMode(true)} className="w-full sm:w-auto">
                          <Edit className="mr-2 h-4 w-4" /> Edit Content
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => { 
                            setEditMode(false); 
                            setEditContent(selectedPage.content); 
                          }}
                          disabled={saving}
                          className="flex-1 sm:flex-none"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={savePage} 
                          disabled={saving}
                          className="flex-1 sm:flex-none"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!editMode ? (
                  <div
                    className="content-preview prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedPage.content }}
                  />
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="editor" className="text-base font-semibold">Page Content</Label>
                    <div className="text-xs text-muted-foreground mb-2 space-y-1">
                      <p>Use the rich text editor below to format your content. Click the <code className="px-1 py-0.5 bg-gray-100 rounded text-blue-600">&lt;/&gt;</code> Source button for advanced layouts.</p>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">Image Container Templates (Click to expand)</summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded border space-y-2 text-[11px] font-mono">
                          <div>
                            <strong className="text-gray-700 block mb-1">Auto-adjust width (fits image):</strong>
                            <code className="block bg-white p-2 rounded border text-green-700">
                              &lt;div class="image-container auto float-right"&gt;<br/>
                              &nbsp;&nbsp;&lt;img src="URL" alt="Description"&gt;<br/>
                              &lt;/div&gt;
                            </code>
                          </div>
                          <div>
                            <strong className="text-gray-700 block mb-1">Fixed width (e.g., 20%, 30%, 50%):</strong>
                            <code className="block bg-white p-2 rounded border text-green-700">
                              &lt;div class="image-container float-right width-20"&gt;<br/>
                              &nbsp;&nbsp;&lt;img src="URL" alt="Description"&gt;<br/>
                              &lt;/div&gt;
                            </code>
                          </div>
                          <div>
                            <strong className="text-gray-700 block mb-1">Remaining width (covers full width):</strong>
                            <code className="block bg-white p-2 rounded border text-green-700">
                              &lt;div class="image-container remaining"&gt;<br/>
                              &nbsp;&nbsp;&lt;img src="URL" alt="Description"&gt;<br/>
                              &lt;/div&gt;
                            </code>
                          </div>
                          <div>
                            <strong className="text-gray-700 block mb-1">Clear floats (start new line):</strong>
                            <code className="block bg-white p-2 rounded border text-green-700">
                              &lt;div class="clear-both"&gt;&lt;/div&gt;
                            </code>
                          </div>
                          <div className="text-gray-600 text-[10px] pt-2 border-t">
                            <strong>Classes:</strong> auto | remaining | width-20 | width-30 | width-40 | width-50 | width-60 | width-70 | width-80 | width-100<br/>
                            <strong>Float:</strong> float-left | float-right
                          </div>
                        </div>
                      </details>
                    </div>
                    <div className="border rounded-md bg-white overflow-hidden">
                      {/* Editor Container - ClassicEditor includes toolbar */}
                      <div
                        id="editor"
                        ref={editorContainerRef}
                        className="min-h-[500px]"
                        style={{ minHeight: '500px' }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </>
  );
}