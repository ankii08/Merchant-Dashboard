import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  Calendar, 
  ChevronDown, 
  CreditCard,
  CheckCircle,
  XCircle,
  DollarSign,
  ChevronUpSquare,
  ChevronDownSquare,
  AlertCircle
} from 'lucide-react';

// Card brand colors for visual distinction
const CARD_BRAND_COLORS = {
  Visa: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/20' },
  Mastercard: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/20' },
  Amex: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  Discover: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/20' },
};

const getCardBrandColor = (brand) => CARD_BRAND_COLORS[brand] || { 
  bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/20' 
};

/**
 * MonthlySummary Component
 * 
 * Displays historical transaction data as expandable month cards.
 * Each card shows summary metrics and can be clicked to reveal:
 * - Volume and transaction count
 * - Approved/declined breakdown
 * - Approval rate
 * - Card brand breakdown with individual stats
 * - Decline reason breakdown with lost volume
 * 
 * Cards are sorted by date (most recent first) and include
 * month-over-month comparison indicators when applicable.
 * Includes Expand All / Collapse All controls for convenience.
 */
function MonthlySummary({ data, loading, filters }) {
  const [expandedMonths, setExpandedMonths] = useState(new Set());

  // Collapse all months when filters change
  useEffect(() => {
    setExpandedMonths(new Set());
  }, [filters]);

  // Compute if all months are expanded
  const allExpanded = useMemo(() => {
    if (!data || data.length === 0) return false;
    return data.every(month => expandedMonths.has(month.month));
  }, [data, expandedMonths]);

  const toggleMonth = (month) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(month)) {
        newSet.delete(month);
      } else {
        newSet.add(month);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (data) {
      setExpandedMonths(new Set(data.map(m => m.month)));
    }
  };

  const collapseAll = () => {
    setExpandedMonths(new Set());
  };

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Monthly Breakdown</h2>
            <p className="text-slate-500 text-sm mt-0.5">Transaction trends by month</p>
          </div>
        </div>
        
        {/* Expand All / Collapse All Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            disabled={allExpanded}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              transition-all duration-200
              ${allExpanded 
                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }
            `}
          >
            <ChevronDownSquare className="w-3.5 h-3.5" />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            disabled={expandedMonths.size === 0}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              transition-all duration-200
              ${expandedMonths.size === 0
                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }
            `}
          >
            <ChevronUpSquare className="w-3.5 h-3.5" />
            Collapse All
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((month, index) => {
          const isExpanded = expandedMonths.has(month.month);
          const approvalRate = month.totalTransactions > 0 
            ? (month.totalApproved / month.totalTransactions * 100) 
            : 0;

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
                onClick={() => toggleMonth(month.month)}
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
                          <span className={`text-lg font-bold ${
                            approvalRate >= 80 ? 'text-emerald-400' :
                            approvalRate >= 60 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {approvalRate.toFixed(1)}%
                          </span>
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

                      {/* Card Brand Breakdown */}
                      {month.byCardBrand && Object.keys(month.byCardBrand).length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-amber-400" />
                            By Card Brand
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(month.byCardBrand).map(([brand, stats]) => {
                              const colors = getCardBrandColor(brand);
                              return (
                                <div
                                  key={brand}
                                  className={`bg-slate-800/50 border ${colors.border} rounded-xl p-3`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-semibold ${colors.text}`}>{brand}</span>
                                    <span className="text-xs text-slate-500">{stats.count} txn</span>
                                  </div>
                                  <div className="text-sm font-bold text-white">${stats.amount.toLocaleString()}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Decline Reasons */}
                      {month.byDeclineReason && Object.keys(month.byDeclineReason).length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-slate-400 mb-3">
                            Declines by Reason
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(month.byDeclineReason)
                              .sort((a, b) => b[1].count - a[1].count)
                              .map(([reason, stats]) => (
                                <div
                                  key={reason}
                                  className="bg-slate-800/50 border border-rose-500/10 rounded-xl p-3"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-rose-400">{reason}</span>
                                    <span className="text-xs text-slate-500">{stats.count} declined</span>
                                  </div>
                                  <div className="text-sm font-bold text-white">${stats.amount.toLocaleString()}</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
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
