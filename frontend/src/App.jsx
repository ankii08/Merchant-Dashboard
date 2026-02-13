import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CreditCard, CheckCircle, XCircle, Zap, X } from 'lucide-react';
import FilterSection from './components/FilterSection';
import MTDSummary from './components/MTDSummary';
import MonthlySummary from './components/MonthlySummary';
import { fetchSummary, fetchFilterOptions } from './api/transactionApi';

/**
 * AnimatedBackground Component
 * 
 * Creates a dynamic visual layer behind the dashboard content.
 * Uses multiple gradient orbs with different colors and positions
 * to add depth without distracting from the data.
 * The grid overlay provides subtle structure to the dark theme.
 */
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      {/* Primary gradient orb - warm amber/copper */}
      <div 
        className="absolute -top-[400px] -right-[400px] w-[800px] h-[800px] rounded-full opacity-20 blur-[120px] animate-blob"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.7) 0%, rgba(234,88,12,0.4) 50%, transparent 70%)'
        }}
      />
      {/* Secondary gradient orb - cool cyan/teal */}
      <div 
        className="absolute top-[60%] -left-[300px] w-[600px] h-[600px] rounded-full opacity-15 blur-[100px] animate-blob animation-delay-2000"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(20,184,166,0.3) 50%, transparent 70%)'
        }}
      />
      {/* Tertiary accent orb - warm coral */}
      <div 
        className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] animate-blob animation-delay-4000"
        style={{
          background: 'radial-gradient(circle, rgba(251,146,60,0.5) 0%, transparent 60%)'
        }}
      />
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }}
      />
    </div>
  );
}

/**
 * HeroHeader Component
 * 
 * Sticky header with gradient text branding.
 * Provides visual anchor and context for the dashboard.
 * Uses backdrop blur for depth when content scrolls beneath.
 */
function HeroHeader() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="relative border-b border-white/5 bg-slate-950/50 backdrop-blur-2xl sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                Merchant
              </span>
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent ml-3">
                Dashboard
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm sm:text-base text-slate-500 mt-2 font-medium tracking-wide"
            >
              Real-time transaction analytics & insights
            </motion.p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function App() {
  const [filters, setFilters] = useState({
    cardBrand: 'all',
    status: 'all',
    declineReasonCode: 'all',
  });
  const [filterOptions, setFilterOptions] = useState({
    cardBrands: [],
    statuses: [],
    declineReasonCodes: [],
  });
  const [mtdSummary, setMtdSummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const response = await fetchFilterOptions();
        if (response.success) {
          setFilterOptions(response.data);
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    loadFilterOptions();
  }, []);

  const loadSummaryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const effectiveFilters = { ...filters };
      if (effectiveFilters.status === 'Approved') {
        effectiveFilters.declineReasonCode = 'all';
      }
      
      const response = await fetchSummary(effectiveFilters);
      
      if (response.success) {
        setMtdSummary(response.mtdSummary);
        setMonthlySummary(response.monthByMonth);
      } else {
        throw new Error('Failed to fetch summary data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  const handleFilterChange = (newFilters) => {
    if (newFilters.status === 'Approved') {
      newFilters.declineReasonCode = 'all';
    }
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.cardBrand !== 'all' || filters.status !== 'all' || filters.declineReasonCode !== 'all';

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <HeroHeader />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 text-rose-300 px-6 py-5 rounded-2xl mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-rose-500/20">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-rose-200">Error loading data</p>
                  <p className="text-sm mt-1 text-rose-400/80">{error}</p>
                  <button
                    onClick={loadSummaryData}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-rose-300 hover:text-rose-200 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Try again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FilterSection
            filters={filters}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
            loading={loading}
          />
        </motion.div>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 flex items-center flex-wrap gap-3"
            >
              <span className="text-slate-500 text-sm font-medium">Active:</span>
              {filters.cardBrand !== 'all' && (
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-300 px-4 py-2 rounded-xl text-sm font-medium border border-amber-500/20 group"
                >
                  <CreditCard className="w-4 h-4" />
                  {filters.cardBrand}
                  <button
                    onClick={() => handleFilterChange({ ...filters, cardBrand: 'all' })}
                    className="ml-1 p-0.5 rounded-full hover:bg-amber-500/30 transition-colors"
                    aria-label="Remove card brand filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.span>
              )}
              {filters.status !== 'all' && (
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border group ${
                    filters.status === 'Approved' 
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                  }`}
                >
                  {filters.status === 'Approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {filters.status}
                  <button
                    onClick={() => handleFilterChange({ ...filters, status: 'all' })}
                    className={`ml-1 p-0.5 rounded-full transition-colors ${
                      filters.status === 'Approved' 
                        ? 'hover:bg-emerald-500/30' 
                        : 'hover:bg-rose-500/30'
                    }`}
                    aria-label="Remove status filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.span>
              )}
              {filters.declineReasonCode !== 'all' && (
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-300 px-4 py-2 rounded-xl text-sm font-medium border border-amber-500/20 group"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {filters.declineReasonCode.replace('-', ' – ')}
                  <button
                    onClick={() => handleFilterChange({ ...filters, declineReasonCode: 'all' })}
                    className="ml-1 p-0.5 rounded-full hover:bg-amber-500/30 transition-colors"
                    aria-label="Remove decline reason filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.span>
              )}
              {/* Clear All button when multiple filters are active */}
              {(filters.cardBrand !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0) + (filters.declineReasonCode !== 'all' ? 1 : 0) > 1 && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => handleFilterChange({ cardBrand: 'all', status: 'all', declineReasonCode: 'all' })}
                  className="inline-flex items-center gap-2 bg-slate-700/50 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium border border-slate-600/30 hover:bg-slate-600/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MTDSummary data={mtdSummary} loading={loading} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <MonthlySummary data={monthlySummary} loading={loading} filters={filters} />
        </motion.div>
      </main>
    </div>
  );
}

export default App;
