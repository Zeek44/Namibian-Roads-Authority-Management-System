'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Plus, 
  Wrench,
  Calendar,
  DollarSign,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MoreVertical
} from "lucide-react";

// Status badge component
function StatusBadge({ status }) {
  const getStatusProps = (status) => {
    switch (status) {
      case 'completed':
        return { text: 'Completed', className: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' };
      case 'in_progress':
        return { text: 'In Progress', className: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' };
      case 'assigned':
        return { text: 'Assigned', className: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' };
      case 'approved':
        return { text: 'Approved', className: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400' };
      case 'pending':
        return { text: 'Pending', className: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' };
      case 'cancelled':
        return { text: 'Cancelled', className: 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400' };
      case 'rejected':
        return { text: 'Rejected', className: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' };
      default:
        return { text: status, className: 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400' };
    }
  };

  const { text, className } = getStatusProps(status);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

// Priority badge component
function PriorityBadge({ priority }) {
  const getPriorityProps = (priority) => {
    switch (priority) {
      case 'critical':
        return { text: 'Critical', className: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400' };
      case 'high':
        return { text: 'High', className: 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' };
      case 'medium':
        return { text: 'Medium', className: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' };
      case 'low':
        return { text: 'Low', className: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400' };
      default:
        return { text: priority, className: 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400' };
    }
  };

  const { text, className } = getPriorityProps(priority);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

// Work order card component
function WorkOrderCard({ workOrder, onSelect, onApprove, onView, isSelected }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const canApprove = workOrder.status === 'pending';

  return (
    <div
      className={`bg-white dark:bg-[#1E1E1E] rounded-xl border shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200 p-4 cursor-pointer ${
        isSelected 
          ? "border-[#0062FF] dark:border-[#4A90E2] ring-2 ring-[#0062FF]/20 dark:ring-[#4A90E2]/20" 
          : "border-[#F1F3F8] dark:border-gray-700 hover:border-[#E1E5E9] dark:hover:border-gray-600"
      }`}
      onClick={() => onSelect(workOrder)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-[#111827] dark:text-[#DEDEDE] font-inter">
            {workOrder.work_order_id}
          </h3>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
            {workOrder.asset_name} • {workOrder.work_type}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <PriorityBadge priority={workOrder.priority} />
          <StatusBadge status={workOrder.status} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('More options for work order:', workOrder.work_order_id);
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
          >
            <MoreVertical size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
          </button>
        </div>
      </div>

      {/* Title and Description */}
      <div className="mb-4">
        <h4 className="font-medium text-[#111827] dark:text-[#DEDEDE] font-inter mb-1">
          {workOrder.title}
        </h4>
        {workOrder.description && (
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter line-clamp-2">
            {workOrder.description}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">Estimated Cost:</span>
          <span className="text-sm font-medium text-[#111827] dark:text-[#DEDEDE] font-inter">
            {formatCurrency(workOrder.estimated_cost)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar size={14} className="text-[#6B7280] dark:text-[#9CA3AF]" />
          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
            Scheduled: {formatDate(workOrder.scheduled_date)}
          </span>
        </div>

        {workOrder.contractor_name && (
          <div className="flex items-center space-x-2">
            <User size={14} className="text-[#6B7280] dark:text-[#9CA3AF]" />
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              {workOrder.contractor_name}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(workOrder);
          }}
          className="flex-1 px-3 py-2 bg-[#E7EEFF] dark:bg-[#1A2332] text-[#0065FF] dark:text-[#4A90E2] text-sm font-medium rounded-lg hover:bg-[#D4E4FF] dark:hover:bg-[#243040] transition-colors duration-150 font-inter flex items-center justify-center space-x-1"
        >
          <Eye size={14} />
          <span>View</span>
        </button>
        
        {canApprove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApprove(workOrder);
            }}
            className="flex-1 px-3 py-2 bg-[#0066FF] dark:bg-[#4A90E2] text-white text-sm font-medium rounded-lg hover:bg-[#0052E6] dark:hover:bg-[#3A7BC8] transition-colors duration-150 font-inter flex items-center justify-center space-x-1"
          >
            <CheckCircle size={14} />
            <span>Approve</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function WorkOrdersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterWorkType, setFilterWorkType] = useState("");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  // Fetch work orders data
  const { data: workOrders = [], isLoading, error } = useQuery({
    queryKey: ['work-orders', filterStatus, filterPriority, filterWorkType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterWorkType) params.append('work_type', filterWorkType);
      
      const response = await fetch(`/api/work-orders?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch work orders');
      }
      return response.json();
    },
  });

  // Filter work orders based on search term
  const filteredWorkOrders = workOrders.filter(workOrder =>
    searchTerm === "" ||
    workOrder.work_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workOrder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workOrder.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workOrder.contractor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewWorkOrder = () => {
    console.log('Create new work order');
  };

  const handleApprove = (workOrder) => {
    console.log('Approve work order:', workOrder.work_order_id);
  };

  const handleView = (workOrder) => {
    console.log('View work order:', workOrder.work_order_id);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <span className="text-red-700 dark:text-red-400">Failed to load work orders</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-b from-[#FCFDFF] to-[#F6F8FF] dark:from-[#121212] dark:to-[#0F0F0F] flex flex-col">
      {/* Header Controls */}
      <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white dark:bg-[#1E1E1E] border border-[#E7EAF1] dark:border-gray-700 rounded-xl shadow-sm text-sm text-[#111827] dark:text-[#DEDEDE] placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-11 px-3 bg-white dark:bg-[#1E1E1E] border border-[#E7EAF1] dark:border-gray-700 rounded-xl shadow-sm text-sm text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="h-11 px-3 bg-white dark:bg-[#1E1E1E] border border-[#E7EAF1] dark:border-gray-700 rounded-xl shadow-sm text-sm text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterWorkType}
              onChange={(e) => setFilterWorkType(e.target.value)}
              className="h-11 px-3 bg-white dark:bg-[#1E1E1E] border border-[#E7EAF1] dark:border-gray-700 rounded-xl shadow-sm text-sm text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            >
              <option value="">All Types</option>
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
              <option value="replacement">Replacement</option>
              <option value="cleaning">Cleaning</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>
        </div>

        {/* New Work Order Button */}
        <button
          onClick={handleNewWorkOrder}
          className="w-full h-12 bg-[#E1ECFF] dark:bg-[#1A2332] hover:bg-[#D3E2FF] dark:hover:bg-[#243040] text-[#1E5CFF] dark:text-[#4A90E2] font-medium text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors duration-150 font-inter"
        >
          <Plus size={16} />
          <span>New Work Order</span>
        </button>

        {/* Results count */}
        <div className="mt-4 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
          {isLoading ? 'Loading...' : `${filteredWorkOrders.length} work orders found`}
        </div>
      </div>

      {/* Work Orders Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#F1F3F8] dark:border-gray-700 p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredWorkOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-[#F0F4FF] dark:bg-[#1A2332] rounded-full flex items-center justify-center mb-4">
              <Wrench size={32} className="text-[#6B7BD8] dark:text-[#4A90E2]" />
            </div>
            <h3 className="text-[#111827] dark:text-[#DEDEDE] font-inter font-semibold text-lg mb-2">
              No work orders found
            </h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter text-sm text-center mb-6 max-w-sm">
              {searchTerm || filterStatus || filterPriority || filterWorkType 
                ? 'Try adjusting your filters to find work orders.'
                : 'Start by creating your first work order.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredWorkOrders.map((workOrder) => (
              <WorkOrderCard
                key={workOrder.id}
                workOrder={workOrder}
                onSelect={setSelectedWorkOrder}
                onApprove={handleApprove}
                onView={handleView}
                isSelected={selectedWorkOrder?.id === workOrder.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}