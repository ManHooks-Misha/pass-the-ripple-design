import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, Users, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentImport() {
  const [file, setFile] = useState<File | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [importedStudents, setImportedStudents] = useState<any[]>([]);
  const [consentEmails, setConsentEmails] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      // Simulate file processing
      setTimeout(() => {
        const mockStudents = [
          { nickname: 'Alex', rippleId: 'PTR001', email: 'parent1@example.com' },
          { nickname: 'Sam', rippleId: 'PTR002', email: 'parent2@example.com' },
          { nickname: 'Jordan', rippleId: 'PTR003', email: 'parent3@example.com' },
        ];
        setImportedStudents(mockStudents);
        localStorage.setItem('teacher_students', JSON.stringify(mockStudents));
        toast.success('File uploaded successfully');
      }, 1000);
    }
  };

  const handleManualImport = () => {
    if (!manualInput.trim()) {
      toast.error('Please enter student data');
      return;
    }

    const lines = manualInput.split('\n');
    const students = lines.map((line, index) => {
      const [nickname, rippleId] = line.split(',').map(s => s.trim());
      return {
        nickname: nickname || `Student${index + 1}`,
        rippleId: rippleId || `RIP${String(index + 1).padStart(3, '0')}`,
        email: `parent${index + 1}@example.com`
      };
    });

    setImportedStudents(students);
    localStorage.setItem('teacher_students', JSON.stringify(students));
    toast.success('Students imported successfully');
    setManualInput('');
  };

  const handleSendConsentEmails = () => {
    if (!consentEmails.trim()) {
      toast.error('Please enter parent emails');
      return;
    }

    const emails = consentEmails.split(',').map(e => e.trim());
    
    // Simulate sending emails
    const consentData = {
      emails,
      sentAt: new Date().toISOString(),
      status: 'pending'
    };
    
    localStorage.setItem('parent_consent_requests', JSON.stringify(consentData));
    toast.success(`Consent emails sent to ${emails.length} parents`);
    setConsentEmails('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Import Students</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CSV/Excel Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              CSV/Excel Upload
            </CardTitle>
            <CardDescription>
              Upload a file with student nicknames and Ripple IDs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file">Choose File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="mt-2"
              />
            </div>
            {file && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  File selected: {file.name}
                </AlertDescription>
              </Alert>
            )}
            <div className="text-sm text-muted-foreground">
              <p>File format:</p>
              <code className="block bg-muted p-2 rounded mt-1">
                Nickname, RippleID<br />
                Alex, PTR-001-01<br />
                Sam, PTR-001-02
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manual Entry
            </CardTitle>
            <CardDescription>
              Enter student data manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="manual">Student Data (one per line)</Label>
              <Textarea
                id="manual"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Nickname, RippleID&#10;Alex, RIP001&#10;Sam, RIP002"
                rows={6}
                className="mt-2"
              />
            </div>
            <Button onClick={handleManualImport} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Import Students
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Imported Students */}
      {importedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imported Students</CardTitle>
            <CardDescription>
              {importedStudents.length} students imported successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {importedStudents.map((student, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">{student.nickname}</span>
                  <span className="text-sm text-muted-foreground">{student.rippleId}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parental Consent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Parental Consent
          </CardTitle>
          <CardDescription>
            Send bulk consent emails to parents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emails">Parent Email Addresses (comma-separated)</Label>
            <Textarea
              id="emails"
              value={consentEmails}
              onChange={(e) => setConsentEmails(e.target.value)}
              placeholder="parent1@example.com, parent2@example.com, parent3@example.com"
              rows={3}
              className="mt-2"
            />
          </div>
          <Button onClick={handleSendConsentEmails} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Send Consent Emails
          </Button>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Parents will receive an email with instructions to approve their child's participation
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}