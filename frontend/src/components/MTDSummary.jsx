import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Percent
} from 'lucide-react';

/**
 * MTDSummary Component
 * 
 * Displays current month's key performance indicators in a grid of cards:
 * - Total Volume: Sum of all transaction amounts
 * - Transaction Count: Number of transactions
 * - Approved/Declined: Breakdown by status
 * - Approval Rate: Percentage with color coding (green >80%, amber >60%, red <60%)
 * 
 * Uses CountUp for animated number transitions on data changes.
 */
function MTDSummary({ data, loading }) {
  if (loading) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Month-to-Date Overview</h2>
            <p className="text-slate-500 text-sm mt-1">Performance metrics for the current period</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="relative bg-slate-900/50 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 overflow-hidden"
            >
              <div className="animate-pulse space-y-4">
                <div className="h-3 bg-slate-800 rounded w-20"></div>
                <div className="h-8 bg-slate-800 rounded w-28"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mb-10">
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-12 text-center">
          <p className="text-slate-500">No data available</p>
        </div>
      </div>
    );
  }

  // Calculate approval rate from the data
  const approvalRate = data.totalTransactions > 0 
    ? (data.totalApproved / data.totalTransactions * 100) 
    : 0;

  const stats = [
    {
      id: 'volume',
      label: 'Total Volume',
      value: data.totalAmount || 0,
      prefix: '$',
      format: true,
      icon: DollarSign,
      gradient: 'from-amber-500/20 to-orange-600/20',
      iconBg: 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20',
      iconColor: 'text-amber-400',
      borderGlow: 'hover:border-amber-500/30',
    },
    {
      id: 'count',
      label: 'Transactions',
      value: data.totalTransactions || 0,
      icon: CreditCard,
      gradient: 'from-cyan-500/20 to-teal-500/20',
      iconBg: 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20',
      iconColor: 'text-cyan-400',
      borderGlow: 'hover:border-cyan-500/30',
    },
    {
      id: 'approved',
      label: 'Approved',
      value: data.totalApproved || 0,
      icon: CheckCircle,
      gradient: 'from-emerald-500/20 to-green-500/20',
      iconBg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/20',
      iconColor: 'text-emerald-400',
      borderGlow: 'hover:border-emerald-500/30',
    },
    {
      id: 'declined',
      label: 'Declined',
      value: data.totalDeclined || 0,
      icon: XCircle,
      gradient: 'from-rose-500/20 to-pink-500/20',
      iconBg: 'bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/20',
      iconColor: 'text-rose-400',
      borderGlow: 'hover:border-rose-500/30',
    },
    {
      id: 'rate',
      label: 'Approval Rate',
      value: approvalRate,
      suffix: '%',
      decimals: 1,
      icon: approvalRate >= 80 ? TrendingUp : Percent,
      gradient: approvalRate >= 80 
        ? 'from-emerald-500/20 to-green-500/20'
        : approvalRate >= 60 
          ? 'from-amber-500/20 to-orange-500/20'
          : 'from-rose-500/20 to-red-500/20',
      iconBg: approvalRate >= 80 
        ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/20' 
        : approvalRate >= 60 
          ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20' 
          : 'bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/20',
      iconColor: approvalRate >= 80 
        ? 'text-emerald-400' 
        : approvalRate >= 60 
          ? 'text-amber-400' 
          : 'text-rose-400',
      borderGlow: approvalRate >= 80 
        ? 'hover:border-emerald-500/30' 
        : approvalRate >= 60 
          ? 'hover:border-amber-500/30' 
          : 'hover:border-rose-500/30',
    },
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Month-to-Date Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Performance metrics for the current period</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.05,
                ease: [0.23, 1, 0.32, 1]
              }}
              className={`
                group relative bg-slate-900/50 backdrop-blur-2xl
                border border-white/5 ${stat.borderGlow}
                rounded-3xl p-6 overflow-hidden
                transition-all duration-300
                hover:bg-slate-900/80
              `}
            >
              {/* Gradient background on hover */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${stat.gradient}
                opacity-0 group-hover:opacity-100 transition-opacity duration-500
              `} />
              
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                </div>
                
                <div className="text-2xl font-bold text-white tracking-tight">
                  {stat.prefix}
                  <CountUp
                    end={stat.value}
                    duration={1.2}
                    decimals={stat.decimals || 0}
                    separator=","
                    preserveValue
                  />
                  {stat.suffix}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default MTDSummary;
