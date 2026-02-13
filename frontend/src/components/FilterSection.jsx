import { motion } from 'framer-motion';
import { CreditCard, Activity, AlertTriangle, ChevronDown } from 'lucide-react';

/**
 * FilterSection Component
 * 
 * Renders three dropdown filters for narrowing transaction data:
 * - Card Brand: Visa, Mastercard, Amex, Discover
 * - Status: Approved, Declined
 * - Decline Reason: Only enabled when status is "Declined"
 * 
 * Filter changes are immediately propagated to parent via onFilterChange,
 * triggering an API refresh.
 */
function FilterSection({ filters, onFilterChange, filterOptions, loading }) {
  const handleFilterChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const filterGroups = [
    {
      id: 'cardBrand',
      label: 'Card Brand',
      icon: CreditCard,
      options: [{ value: 'all', label: 'All Brands' }, ...filterOptions.cardBrands.map(b => ({ value: b, label: b }))],
    },
    {
      id: 'status',
      label: 'Status',
      icon: Activity,
      options: [{ value: 'all', label: 'All Statuses' }, ...filterOptions.statuses.map(s => ({ value: s, label: s }))],
    },
    {
      id: 'declineReasonCode',
      label: 'Decline Reason',
      icon: AlertTriangle,
      options: [{ value: 'all', label: 'All Reasons' }, ...filterOptions.declineReasonCodes.map(d => ({ value: d, label: d.replace('-', ' – ') }))],
      disabled: filters.status === 'Approved',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="relative bg-slate-900/50 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden"
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20">
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Filter Transactions</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filterGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.id} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <Icon className="w-4 h-4" />
                  <span>{group.label}</span>
                </label>
                <div className="relative">
                  <select
                    value={filters[group.id]}
                    onChange={(e) => handleFilterChange(group.id, e.target.value)}
                    disabled={loading || group.disabled}
                    className={`
                      w-full px-4 py-3.5 pr-12 rounded-2xl
                      bg-slate-800/50 border border-white/10
                      text-white text-sm font-medium
                      transition-all duration-200
                      appearance-none cursor-pointer
                      hover:bg-slate-800/80 hover:border-white/20
                      focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50
                      disabled:opacity-40 disabled:cursor-not-allowed
                    `}
                  >
                    {group.options.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default FilterSection;
