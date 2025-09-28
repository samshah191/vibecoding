import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const GitHubCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error }, window.location.origin);
        }
        window.close();
        return;
      }

      if (code) {
        // Send success message with code to parent window
        if (window.opener) {
          window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', code }, window.location.origin);
        }
        window.close();
        return;
      }

      // If no code or error, redirect back to main app
      navigate('/');
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              Connecting to GitHub...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we complete the authentication process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubCallback;