'use client';

import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Building2,
  Clipboard,
  Wrench,
  DollarSign,
  MapPin,
  ArrowRight
} from "lucide-react";

// Dashboard stat card component
function StatCard({ title, value, subtitle, icon: Icon, color, trend, onClick }) {
  return (
    <div 
      className={`bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#F1F3F8] dark:border-gray-700 p-4 sm:p-6 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="sm:size-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-sm">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-green-500 font-medium">{trend}</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-[#DEDEDE] font-inter">
          {value}
        </div>
        <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-[#9CA3AF] dark:text-[#6B7280] font-inter">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// Recent activity item component
function ActivityItem({ type, title, subtitle, time, status }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
      case 'submitted':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in_progress':
      case 'assigned':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'rejected':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'inspection':
        return <Clipboard size={16} className="text-[#0066FF] dark:text-[#4A90E2]" />;
      case 'work_order':
        return <Wrench size={16} className="text-[#0066FF] dark:text-[#4A90E2]" />;
      default:
        return <Building2 size={16} className="text-[#0066FF] dark:text-[#4A90E2]" />;
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150">
      <div className="w-8 h-8 bg-[#EDF1FF] dark:bg-[#1A2332] rounded-lg flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#111827] dark:text-[#DEDEDE] truncate font-inter">
          {title}
        </div>
        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate font-inter">
          {subtitle}
        </div>
      </div>
      <div className="flex flex-col items-end space-y-1 flex-shrink-0">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status.replace('_', ' ')}
        </span>
        <span className="text-xs text-[#9CA3AF] dark:text-[#6B7280] font-inter">
          {time}
        </span>
      </div>
    </div>
  );
}

export default function RAMMSDashboard({ onNavigate = () => {} }) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#F1F3F8] dark:border-gray-700 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <span className="text-red-700 dark:text-red-400">Failed to load dashboard data</span>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-b from-[#FCFDFF] to-[#F6F8FF] dark:from-[#121212] dark:to-[#0F0F0F] h-full overflow-y-auto">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <StatCard
          title="Total Assets"
          value={stats?.assets?.total || 0}
          subtitle={`${stats?.assets?.critical_count || 0} need attention`}
          icon={Building2}
          color="bg-[#0066FF] dark:bg-[#4A90E2]"
          onClick={() => onNavigate('assets')}
        />
        
        <StatCard
          title="Pending Inspections"
          value={stats?.inspections?.pending_inspections || 0}
          subtitle={`${stats?.inspections?.recent_inspections || 0} this month`}
          icon={Clipboard}
          color="bg-[#F59E0B] dark:bg-[#F59E0B]"
          onClick={() => onNavigate('inspections')}
        />
        
        <StatCard
          title="Active Work Orders"
          value={stats?.work_orders?.in_progress_work_orders || 0}
          subtitle={`${stats?.work_orders?.pending_work_orders || 0} pending approval`}
          icon={Wrench}
          color="bg-[#10B981] dark:bg-[#10B981]"
          onClick={() => onNavigate('work-orders')}
        />
        
        <StatCard
          title="Budget Status"
          value={formatCurrency(stats?.work_orders?.estimated_budget)}
          subtitle={`${formatCurrency(stats?.work_orders?.actual_spent)} spent`}
          icon={DollarSign}
          color="bg-[#8B5CF6] dark:bg-[#8B5CF6]"
        />
      </div>

      {/* Approval Queue */}
      {stats?.pending_approvals?.total > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="text-yellow-600 mr-3" size={20} />
              <div>
                <div className="text-yellow-800 dark:text-yellow-200 font-semibold font-inter">
                  {stats.pending_approvals.total} Items Pending Approval
                </div>
                <div className="text-yellow-700 dark:text-yellow-300 text-sm font-inter">
                  {stats.pending_approvals.assets} assets, {stats.pending_approvals.inspections} inspections, {stats.pending_approvals.work_orders} work orders
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-150 font-inter font-medium">
              Review Queue
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Condition Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#F1F3F8] dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] font-inter">
                Asset Overview by Type
              </h3>
              <button 
                onClick={() => onNavigate('map')}
                className="flex items-center space-x-2 text-[#0066FF] dark:text-[#4A90E2] hover:underline font-inter"
              >
                <MapPin size={16} />
                <span>View Map</span>
                <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="space-y-4">
              {stats?.assets?.by_type?.map((assetType) => (
                <div key={assetType.asset_type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: assetType.color }}
                    ></div>
                    <div>
                      <div className="font-medium text-[#111827] dark:text-[#DEDEDE] font-inter">
                        {assetType.asset_type}
                      </div>
                      <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                        Avg. condition: {parseFloat(assetType.avg_condition).toFixed(1)}/5
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] font-inter">
                      {assetType.total_count}
                    </div>
                    <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                      {assetType.poor_condition_count} poor
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#F1F3F8] dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#111827] dark:text-[#DEDEDE] font-inter">
                Recent Activity
              </h3>
              <button className="text-[#0066FF] dark:text-[#4A90E2] hover:underline text-sm font-inter">
                View All
              </button>
            </div>
            
            <div className="space-y-2">
              {stats?.recent_activity?.slice(0, 5)?.map((activity, index) => (
                <ActivityItem
                  key={index}
                  type={activity.activity_type}
                  title={activity.reference_id}
                  subtitle={activity.asset_name}
                  time={formatTimeAgo(activity.activity_date)}
                  status={activity.status}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}