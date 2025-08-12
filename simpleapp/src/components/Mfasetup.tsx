import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
export default function MfaSetup() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [isLoading, setIsLoading] = useState({
    setup: false,
    verification: false
  });
  const navigate = useNavigate();

  const fetchQrCode = async () => {
    setIsLoading(prev => ({...prev, setup: true}));
    setMessage(null);
    try {
      const res = await API.get('/api/mfa/setup/');
      setQrCode(res.data.qr_code);
      setSecret(res.data.secret);
    } catch (error) {
      setMessage({
        text: 'Failed to load 2FA setup. Please try again.',
        type: 'error'
      });
      console.error('2FA Setup Error:', error);
    } finally {
      setIsLoading(prev => ({...prev, setup: false}));
    }
  };

  useEffect(() => {
    fetchQrCode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

      const pendingUserId = sessionStorage.getItem("pending_user");

      const payload = {
        otp: code,
        ...(pendingUserId && { user_id: pendingUserId }),
      };

    setIsLoading(prev => ({...prev, verification: true}));
    setMessage(null);
    
    try {
        document.cookie = 'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      const res = await API.post('/api/mfa/verify/', payload);
      if (res.data.verified) {
        setMessage({
          text: '2FA enabled successfully! Redirecting...',
          type: 'success'
        });
      
        if (res.data.access) {
          localStorage.setItem('access_token', res.data.access);
          localStorage.setItem('refresh_token', res.data.refresh);
        }
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setMessage({
          text: 'Invalid verification code. Please try again.',
          type: 'error'
        });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Verification failed. Please try again.';
      setMessage({
        text: errorMsg,
        type: 'error'
      });
      console.error('Verification Error:', error);
    } finally {
      setIsLoading(prev => ({...prev, verification: false}));
    }
  };

  const handleRegenerate = async () => {
    await fetchQrCode();
    setCode('');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Set Up Two-Factor Authentication</h2>
      {isLoading.setup && !qrCode && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Setting up 2FA...</p>
        </div>
      )}

    
      {qrCode && (
        <>
          <div className="mb-6">
            <p className="mb-2">Scan this QR code with your authenticator app:</p>
            <div className="flex justify-center mb-4">
              <img 
                src={qrCode} 
                alt="MFA QR Code" 
                className="border p-2 rounded-lg w-48 h-48 object-contain"
              />
            </div>
            <button
              onClick={handleRegenerate}
              disabled={isLoading.setup}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {isLoading.setup ? 'Regenerating...' : 'Generate new QR code'}
            </button>
          </div>

          <div className="mb-6">
            <p className="mb-2">Or enter this secret manually:</p>
            <div className="bg-gray-100 p-3 rounded-lg mb-2 font-mono text-center text-sm break-all">
              {secret}
            </div>
            <p className="text-xs text-gray-500">
              Save this secret in a secure place if you want to add this device to multiple authenticator apps.
            </p>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="code" className="block mb-2 font-medium">
            Enter 6-digit verification code:
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="123456"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(value);
            }}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading.verification}
            autoComplete="one-time-code"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading.verification || code.length !== 6}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
            isLoading.verification || code.length !== 6
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading.verification ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : 'Verify and Enable 2FA'}
        </button>
      </form>

  
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}