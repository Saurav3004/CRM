const KPICard = ({ icon, label, value, gradient }) => (
  <div className={`p-4 rounded-2xl shadow-md text-white bg-gradient-to-r ${gradient} flex items-center gap-4`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-lg font-semibold">{label}</p>
      <p className="text-2xl">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

export default KPICard;
