import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
        <h2 className="text-3xl font-extrabold text-gray-900">404 - Page Not Found</h2>
        <p className="mt-2 text-gray-600">The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary">
          <Home className="h-4 w-4 mr-2" /> Go Home
        </Link>
      </div>
    </div>
  );
}
