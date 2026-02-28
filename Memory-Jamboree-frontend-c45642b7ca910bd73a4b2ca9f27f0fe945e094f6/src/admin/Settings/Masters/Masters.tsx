import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { useEffect } from 'react';

const tabs = [
  { title: 'School Master', path: '/admin/settings/masters/schools' },
  // { title: 'Class Master', path: '/admin/settings/masters/classes' },
  { title: 'Category Master', path: '/admin/settings/masters/categories' },
];

export default function Masters() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = tabs.findIndex(tab => location.pathname.endsWith(tab.path));


  useEffect(() => {
    // If user is at the base path, redirect to the default tab
    if (location.pathname === '/admin/settings/masters') {
      navigate('/admin/settings/masters/schools', { replace: true });
    }
  }, [location.pathname, navigate])
  
  return (
    <div className="p-4">
      <div className="flex border-b mb-4">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => navigate(tab.path)}
            className={cn(
              'px-4 py-2 relative',
              activeTab === i ? 'text-blue-600 font-semibold' : 'text-gray-500'
            )}
          >
            {tab.title}
            <div className={cn(
              'absolute bottom-0 left-0 w-full h-1 transition-all duration-300',
              activeTab === i ? 'bg-blue-600' : 'bg-transparent'
            )} />
          </button>
        ))}
      </div>
      <Outlet/>
    </div>
  );
}
