import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useEffect } from 'react';



export default function Stepper() {
  const location = useLocation();
  const navigate = useNavigate();

  const steps = [
    { id: 0, title: 'Payment & Subscription', description: '', path: '/admin/settings/subscription' },
    { id: 1, title: 'Masters', description: '', path: '/admin/settings/masters' },
    // { id: 2, title: 'Final', description: 'Review & Submit', path: '/step3' },
  ];

  const activeStep = steps.findIndex((step) => location.pathname.startsWith(step.path));

  const handleStepClick = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };


   useEffect(() => {
      // If user is at the base path, redirect to the default tab
      if (location.pathname === '/admin/settings') {
        navigate('/admin/settings/subscription', { replace: true });
      }
    }, [location.pathname, navigate])

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between border-b border-gray-300 mb-4">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(step.path)}
            className={cn(
              'flex-1 text-center py-2 relative transition-colors duration-300',
              activeStep === index ? 'text-blue-600 font-semibold' : 'text-gray-500'
            )}
          >
            {step.title}
            <span
              className={cn(
                'absolute bottom-0 left-0 h-[2px] transition-all duration-300',
                activeStep === index ? 'bg-blue-600 w-full' : 'w-0'
              )}
            />
          </button>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-600">
        {steps[activeStep]?.description}
      </div>
      <Outlet/>
    </div>
  );
}
