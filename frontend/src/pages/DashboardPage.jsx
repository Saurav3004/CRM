// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import ExportModal from '../components/ExportContact';
// import DashboardCharts from '../components/DashboardCharts';

// const Dashboard = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showExport, setShowExport] = useState(false);

//   useEffect(() => {
//     axios.get('http://localhost:3000/api/dashboard/stats')
//       .then((res) => {
//         setLoading(false);
//         setData(res.data);
//       })
//       .catch(err => console.error(err));
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
//         <div className="flex flex-col items-center space-y-6">
//           <div className="relative">
//             <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin"></div>
//             <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-l-purple-300 rounded-full animate-spin animate-reverse" style={{animationDuration: '1.5s'}}></div>
//           </div>
//           <div className="text-center">
//             <p className="text-slate-700 font-semibold text-lg">Loading Dashboard</p>
//             <p className="text-slate-500 text-sm mt-1">Fetching your latest data...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       <div className="max-w-7xl mx-auto p-6 lg:p-8">
//         {/* Header Section */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//           <div>
//             <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 flex items-center gap-3">
//               <span className="text-4xl">📊</span>
//               Dashboard Overview
//             </h1>
//             <p className="text-slate-600 mt-2">Monitor your business performance at a glance</p>
//           </div>
          // <button
          //   onClick={() => setShowExport(true)}
          //   className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2"
          // >
          //   <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          //     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          //   </svg>
          //   Export Data
          // </button>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           <StatCard 
//             title="Total Users" 
//             value={data.totalUsers} 
//             icon="👥"
//             gradient="from-blue-500 to-blue-600"
//             bgGradient="from-blue-50 to-blue-100"
//           />
//           <StatCard 
//             title="Total Revenue" 
//             value={`${data.recentPayments[0].currency} ${data.totalRevenue.toFixed(2)}`} 
//             icon="💰"
//             gradient="from-green-500 to-green-600"
//             bgGradient="from-green-50 to-green-100"
//           />
//           <StatCard 
//             title="Total Bookings" 
//             value={data.totalBookings} 
//             icon="📅"
//             gradient="from-purple-500 to-purple-600"
//             bgGradient="from-purple-50 to-purple-100"
//           />
//         </div>

//         {/* Data Lists */}
//         <div className="grid lg:grid-cols-2 gap-8">
//           <ListCard 
//             title="💸 Top Spenders" 
//             items={data.topSpenders} 
//             type="spender" 
//             gradient="from-amber-500 to-orange-500"
//           />
//           <ListCard 
//             title="🧾 Recent Payments" 
//             items={data.recentPayments} 
//             type="payment" 
//             gradient="from-emerald-500 to-teal-500"
//           />
//         </div>

//         {showExport && <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />}
//       </div>
//       <DashboardCharts chartData={data.chartData} />
//     </div>
//   );
// };

// const StatCard = ({ title, value, icon, gradient, bgGradient }) => (
//   <div className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-1`}>
//     <div className="relative z-10">
//       <div className="flex items-center justify-between mb-4">
//         <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
//           {icon}
//         </div>
//         <div className="w-8 h-8 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//       </div>
//       <h4 className="text-slate-600 font-medium text-sm uppercase tracking-wide mb-2">{title}</h4>
//       <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
//     </div>
//     <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl"></div>
//   </div>
// );

// const ListCard = ({ title, items, type, gradient }) => (
//   <div className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
//     <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
//       <h4 className="text-xl font-bold flex items-center gap-2">
//         {title}
//         <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
//       </h4>
//       <p className="text-white/80 text-sm mt-1">
//         {type === 'spender' ? 'Your highest value customers' : 'Latest transaction activity'}
//       </p>
//     </div>
    
//     <div className="p-6">
//       <div className="space-y-4">
//         {items.map((item, idx) => (
//           <div key={idx} className="group p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:shadow-md transition-all duration-200 hover:border-slate-200">
//             {type === 'spender' ? (
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                     {item.name.charAt(0).toUpperCase()}
//                   </div>
//                   <div>
//                     <div className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">
//                       {item.name}
//                     </div>
//                     <div className="text-slate-500 text-sm">{item.email}</div>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-lg font-bold text-green-600">AUD {item.spent.toFixed(2)}</div>
//                   <div className="text-xs text-slate-500">Total Spent</div>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
//                     item.status === 'paid' 
//                       ? 'bg-gradient-to-r from-green-400 to-green-500' 
//                       : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
//                   }`}>
//                     {item.status === 'paid' ? '✓' : '⏳'}
//                   </div>
//                   <div>
//                     <div className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">
//                       {item.name}
//                     </div>
//                     <div className="text-slate-500 text-sm">
//                       {new Date(item.date).toLocaleDateString('en-US', { 
//                         month: 'short', 
//                         day: 'numeric', 
//                         year: 'numeric' 
//                       })}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className={`font-bold text-lg ${
//                     item.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
//                   }`}>
//                     {item.currency} {item.amount}
//                   </div>
//                   <div className={`text-xs px-2 py-1 rounded-full font-medium uppercase tracking-wide ${
//                     item.status === 'paid' 
//                       ? 'bg-green-100 text-green-700' 
//                       : 'bg-yellow-100 text-yellow-700'
//                   }`}>
//                     {item.status}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );

// export default Dashboard;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import KPICard from '../components/Dashboard/KpiCard';
import DashboardRecent from '../components/Dashboard/DashboardRecent';
import TopEvents from '../components/Dashboard/DashboardTopEvents';
import SpenderInsights from '../components/Dashboard/SpenderInsights';
import TrendChart from '../components/Dashboard/DashboardCharts';
import SegmentsWidget from '../components/Dashboard/SegmentWidget';
import FunnelWidget from '../components/Dashboard/FunnelWidget';
import AgeChart from '../components/Dashboard/AgeChart';
import ExportModal from '../components/ExportContact'

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [showExport,setShowExport] = useState(false)
  const VITE_API = import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const { data } = await axios.get(`${VITE_API}/api/dashboard/kpis`);
        setKpis(data);
      } catch (err) {
        console.error('Failed to fetch KPIs', err);
      }
    };
    fetchKPIs();
  }, []);

  if (!kpis) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium text-lg">Loading Dashboard...</p>
        </div>
      </div>
  )

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
       <button
            onClick={() => setShowExport(true)}
            className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </button>
          {showExport && <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />}
      <KPICard icon="👥" label="Total Users" value={kpis.totalUsers} gradient="from-purple-500 to-indigo-600" />
      <KPICard icon="🟢" label="Active Users" value={kpis.activeUsers} gradient="from-green-400 to-emerald-500" />
      <KPICard icon="📅" label="Total Events" value={kpis.totalEvents} gradient="from-pink-500 to-red-500" />
      <KPICard icon="🎟️" label="Tickets Sold" value={kpis.ticketsSold} gradient="from-yellow-500 to-orange-500" />
      <KPICard icon="💰" label="Total Revenue" value={`AUD ${kpis.totalRevenue}`} gradient="from-green-600 to-teal-600" />
      <KPICard icon="⏳" label="Pending Payments" value={`AUD ${kpis.pendingPayments}`} gradient="from-red-500 to-rose-600" />
      <KPICard icon="🚀" label="Running Campaigns" value={kpis.campaignsRunning} gradient="from-blue-500 to-cyan-500" />
      <KPICard icon="📈" label="Conversion Rate" value={`${kpis.conversionRate?.toFixed(1)}%`} gradient="from-sky-500 to-blue-600" />
    </div>
    <DashboardRecent />
    <TopEvents />
    <SpenderInsights />
    <TrendChart />
    <AgeChart /> 
    <SegmentsWidget />
    <FunnelWidget />
    </>
  );
};

export default Dashboard;
