'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { googleAuthApi } from '@/network/Api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authorization...');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    console.log("ONAUTHPAGE");

    if (error) {
      console.log('OAuth error:', error);
      setStatus('error');
      setMessage('Authorization failed. Redirecting back to integrations...');
      setTimeout(() => router.push('/integrations/calendars'), 2000);
      return;
    }

    // Prevent duplicate API calls by checking if we're already processing
    if (code && !isProcessing) {
      setIsProcessing(true);
      
      googleAuthApi(
        JSON.stringify({ code, state }),
      )
        .then((res) => {
          console.log('Token Exchange Success:', res);
          setStatus('success');
          setMessage('Google Calendar connected successfully! Redirecting...');
          setTimeout(() => router.push('/integrations/calendars'), 2000);
        })
        .catch((error) => {
          console.log('Token Exchange Error:', error);
          setStatus('error');
          setMessage('Failed to connect Google Calendar. Redirecting back...');
          setTimeout(() => router.push('/integrations'), 2000);
        });
    }
  }, [searchParams, router, isProcessing]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing authorization...</h2>
            <p className="text-gray-600">Please wait while we complete the connection.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connection Successful!</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="h-12 w-12 text-red-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}