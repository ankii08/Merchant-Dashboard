import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  Calendar, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  CheckCircle,
  XCircle,
  DollarSign,
  Minus
} from 'lucide-react';

/**
 * MonthlySummary Component
 * 
 * Displays historical transaction data as expandable month cards.
 * Each card shows summary metrics and can be clicked to reveal:
 * - Volume and transaction count
 * - Approved/declined breakdown
 * - Approval rate with trend indicator vs previous month
 * 
 * Cards are sorted by date (most recent first) and include
 * month-over-month comparison indicators when applicable.
 */
function MonthlySummary({ data, loading }) {
  const [expandedMonth, setExpandedMonth] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonthYear = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Monthly Breakdown</h2>
            <p className="text-slate-500 text-sm mt-0.5">Transaction trends by month</p>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="bg-slate-900/50 backdrop-blur-2xl border border-white/5 rounded-3xl p-6"
            >
              <div className="animate-pulse flex items-center justify-between">
                <div className="h-6 bg-slate-800 rounded w-32"></div>
                <div className="h-6 bg-slate-800 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Monthly Breakdown</h2>
            <p className="text-slate-500 text-sm mt-0.5">Transaction trends by month</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-12 text-center">
          <p className="text-slate-500">No monthly data available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20">
          <Calendar className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Monthly Breakdown</h2>
          <p className="text-slate-500 text-sm mt-0.5">Transaction trends by month</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((month, index) => {
          const isExpanded = expandedMonth === month.month;
          const prevMonth = data[index + 1];
          const approvalRate = month.totalTransactions > 0 
            ? (month.totalApproved / month.totalTransactions * 100) 
            : 0;
          const prevApprovalRate = prevMonth && prevMonth.totalTransactions > 0
            ? (prevMonth.totalApproved / prevMonth.totalTransactions * 100)
            : null;
          const volumeChange = prevMonth && prevMonth.totalAmount > 0
            ? ((month.totalAmount - prevMonth.totalAmount) / prevMonth.totalAmount * 100)
            : null;
          const rateChange = prevApprovalRate !== null
            ? (approvalRate - prevApprovalRate)
            : null;

          return (
            <motion.div
              key={month.month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.05,
                ease: [0.23, 1, 0.32, 1]
              }}
              className={`
                group relative bg-slate-900/50 backdrop-blur-2xl
                border border-white/5 rounded-3xl overflow-hidden
                transition-all duration-300
                ${isExpanded ? 'border-amber-500/20 bg-slate-900/80' : 'hover:border-white/10'}
              `}
            >
              {/* Subtle gradient on expanded */}
              {isExpanded && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
              )}

              <button
                onClick={() => setExpandedMonth(isExpanded ? null : month.month)}
                className="w-full p-6 flex items-center justify-between relative"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">
                      {formatMonthYear(month.month)}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {(month.totalTransactions || 0).toLocaleString()} transactions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(month.totalAmount || 0)}
                    </p>
                    {volumeChange !== null && (
                      <div className={`flex items-center justify-end gap-1 text-xs ${
                        volumeChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {volumeChange >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(volumeChange).toFixed(1)}% vs prev</span>
                      </div>
                    )}
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-2 rounded-xl bg-slate-800/50"
                  >
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-white/5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                        <div className="bg-slate-800/30 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-medium text-slate-500 uppercase">Volume</span>
                          </div>
                          <p className="text-xl font-bold text-white">
                            <CountUp
                              end={month.totalAmount || 0}
                              duration={0.8}
                              separator=","
                              prefix="$"
                              preserveValue
                            />
                          </p>
                        </div>

                        <div className="bg-slate-800/30 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-medium text-slate-500 uppercase">Count</span>
                          </div>
                          <p className="text-xl font-bold text-white">
                            <CountUp
                              end={month.totalTransactions || 0}
                              duration={0.8}
                              separator=","
                              preserveValue
                            />
                          </p>
                        </div>

                        <div className="bg-slate-800/30 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-medium text-slate-500 uppercase">Approved</span>
                          </div>
                          <p className="text-xl font-bold text-white">
                            <CountUp
                              end={month.totalApproved || 0}
                              duration={0.8}
                              separator=","
                              preserveValue
                            />
                          </p>
                        </div>

                        <div className="bg-slate-800/30 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span className="text-xs font-medium text-slate-500 uppercase">Declined</span>
                          </div>
                          <p className="text-xl font-bold text-white">
                            <CountUp
                              end={month.totalDeclined || 0}
                              duration={0.8}
                              separator=","
                              preserveValue
                            />
                          </p>
                        </div>
                      </div>

                      {/* Approval Rate Bar */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">Approval Rate</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${
                              approvalRate >= 80 ? 'text-emerald-400' :
                              approvalRate >= 60 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {approvalRate.toFixed(1)}%
                            </span>
                            {rateChange !== null && (
                              <span className={`text-xs flex items-center gap-0.5 ${
                                rateChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                {rateChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {Math.abs(rateChange).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${approvalRate}%` }}
                            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                            className={`h-full rounded-full ${
                              approvalRate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                              approvalRate >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 
                              'bg-gradient-to-r from-rose-500 to-pink-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthlySummary;
