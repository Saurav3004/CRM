import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IntegrateSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 2 seconds
    const timer = setTimeout(() => {
      navigate('/integration');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-green-700 mb-2">✅ Connected Successfully!</h2>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default IntegrateSuccess;
