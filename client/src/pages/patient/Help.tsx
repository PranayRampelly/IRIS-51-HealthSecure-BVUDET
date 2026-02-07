import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Info, BookOpen, LifeBuoy } from 'lucide-react';

const faqs = [
  {
    question: 'How do I upload my medical documents?',
    answer: 'Go to the Document Vault, click the upload button, and select your files. Supported formats include PDF, PNG, JPG, and more.'
  },
  {
    question: 'How can I share my records securely?',
    answer: 'Select the files you want to share in the Document Vault, click Share, and generate a secure link. You can set an expiry for the link.'
  },
  {
    question: 'What should I do if I forget my password?',
    answer: 'Click on Forgot Password on the login page and follow the instructions to reset your password.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach out to our support team using the contact details below.'
  },
];

const Help: React.FC = () => (
  <div className="min-h-screen bg-health-light-gray flex flex-col items-center py-12 px-2">
    <Card className="w-full max-w-3xl mx-auto shadow-xl rounded-2xl border-0">
      <CardHeader>
        <CardTitle className="text-3xl font-extrabold text-health-teal text-center mb-2 flex items-center justify-center gap-2">
          <LifeBuoy className="w-8 h-8 text-health-teal" /> Help & Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <h2 className="text-xl font-bold text-health-teal mb-4 flex items-center gap-2"><Info className="w-6 h-6" /> Frequently Asked Questions</h2>
          <ul className="space-y-6">
            {faqs.map((faq, idx) => (
              <li key={idx}>
                <div className="font-semibold text-base text-health-charcoal mb-1">{faq.question}</div>
                <div className="text-gray-700 text-base">{faq.answer}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold text-health-teal mb-4 flex items-center gap-2"><BookOpen className="w-6 h-6" /> Resources</h2>
          <ul className="list-disc pl-6 text-base text-health-teal">
            <li><a href="/privacy-policy" className="underline">Privacy Policy</a></li>
            <li><a href="/terms-of-service" className="underline">Terms of Service</a></li>
            <li><a href="/resources" className="underline">User Guides & Tutorials</a></li>
            <li><a href="/compliance" className="underline">Compliance Information</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold text-health-teal mb-4 flex items-center gap-2"><Mail className="w-6 h-6" /> Contact Support</h2>
          <div className="flex flex-col gap-2 text-base">
            <div className="flex items-center gap-2"><Mail className="w-5 h-5 text-health-teal" /> <span>support@healthsecure.com</span></div>
            <div className="flex items-center gap-2"><Phone className="w-5 h-5 text-health-teal" /> <span>+1 (800) 123-4567</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Help; 