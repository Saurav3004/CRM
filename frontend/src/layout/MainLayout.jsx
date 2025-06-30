// layout/MainLayout.jsx
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4 sticky top-0 h-screen">

        <h2 className="text-2xl font-bold mb-6">CRM Panel</h2>
        <nav className="flex flex-col space-y-2">
          <Link to="/dashboard" className={`hover:bg-gray-700 px-4 py-2 rounded ${isActive('/dashboard') ? 'bg-gray-800' : ''}`}>Dashboard</Link>
          <Link to="/audience" className={`hover:bg-gray-700 px-4 py-2 rounded ${isActive('/audience') ? 'bg-gray-800' : ''}`}>Audience</Link>
          <Link to="/campaign" className={`hover:bg-gray-700 px-4 py-2 rounded ${isActive('/campaign') ? 'bg-gray-800' : ''}`}>Campaign</Link>
        </nav>
      </aside>

      {/* Page Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
