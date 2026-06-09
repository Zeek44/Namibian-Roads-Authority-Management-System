'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Plus, 
  Clipboard,
  Calendar,
  MapPin,
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
      case 'approved':
        return { text: 'Approved', className: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' };
      case 'submitted':
        return { text: 'Submitted', className: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' };
      case 'draft':
        return { text: 'Draft', className: 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400' };
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

// Condition rating component
function ConditionRating({ rating }) {
  if (!rating) return <span className="text-gray-400">—</span>;
  
  const getColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating === 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <span className={`font-medium ${getColor(rating)}`}>
      {rating}/5
    </span>
  );
}

// Inspection card component
function InspectionCard({ inspection, onSelect, onApprove, onView, isSelected }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const canApprove = inspection.status === 'submitted';

  return (
    <div
      className={`bg-white dark:bg-[#1E1E1E] rounded-xl border shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200 p-4 cursor-pointer ${
        isSelected 
          ? "border-[#0062FF] dark:border-[#4A90E2] ring-2 ring-[#0062FF]/20 dark:ring-[#4A90E2]/20" 
          : "border-[#F1F3F8] dark:border-gray-700 hover:border-[#E1E5E9] dark:hover:border-gray-600"
      }`}
      onClick={() => onSelect(inspection)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-[#111827] dark:text-[#DEDEDE] font-inter">
            {inspection.inspection_id}
          </h3>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
            {inspection.asset_name} • {inspection.asset_type_name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={inspection.status} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('More options for inspection:', inspection.inspection_id);
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
          >
            <MoreVertical size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">Condition:</span>
          <ConditionRating rating={inspection.condition_rating} />
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar size={14} className="text-[#6B7280] dark:text-[#9CA3AF]" />
          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
            {formatDate(inspection.inspection_date)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <User size={14} className="text-[#6B7280] dark:text-[#9CA3AF]" />
          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
            {inspection.inspector_name}
          </span>
        </div>

        {inspection.findings && (
          <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter line-clamp-2">
            {inspection.findings}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(inspection);
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
              onApprove(inspection);
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

export default function InspectionsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);

  // Fetch inspections data
  const { data: inspections = [], isLoading, error } = useQuery({
    queryKey: ['inspections', filterStatus, filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('type', filterType);
      
      const response = await fetch(`/api/inspections?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch inspections');
      }
      return response.json();
    },
  });

  // Filter inspections based on search term
  const filteredInspections = inspections.filter(inspection =>
    searchTerm === "" ||
    inspection.inspection_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.inspector_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewInspection = () => {
    console.log('Create new inspection');
  };

  const handleApprove = (inspection) => {
    console.log('Approve inspection:', inspection.inspection_id);
  };

  const handleView = (inspection) => {
    console.log('View inspection:', inspection.inspection_id);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <span className="text-red-700 dark:text-red-400">Failed to load inspections</span>
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
              placeholder="Search inspections..."
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
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-11 px-3 bg-white dark:bg-[#1E1E1E] border border-[#E7EAF1] dark:border-gray-700 rounded-xl shadow-sm text-sm text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            >
              <option value="">All Types</option>
              <option value="routine">Routine</option>
              <option value="emergency">Emergency</option>
              <option value="follow_up">Follow-up</option>
            </select>
          </div>
        </div>

        {/* New Inspection Button */}
        <button
          onClick={handleNewInspection}
          className="w-full h-12 bg-[#E1ECFF] dark:bg-[#1A2332] hover:bg-[#D3E2FF] dark:hover:bg-[#243040] text-[#1E5CFF] dark:text-[#4A90E2] font-medium text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors duration-150 font-inter"
        >
          <Plus size={16} />
          <span>New Inspection</span>
        </button>

        {/* Results count */}
        <div className="mt-4 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
          {isLoading ? 'Loading...' : `${filteredInspections.length} inspections found`}
        </div>
      </div>

      {/* Inspections Grid */}
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
        ) : filteredInspections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-[#F0F4FF] dark:bg-[#1A2332] rounded-full flex items-center justify-center mb-4">
              <Clipboard size={32} className="text-[#6B7BD8] dark:text-[#4A90E2]" />
            </div>
            <h3 className="text-[#111827] dark:text-[#DEDEDE] font-inter font-semibold text-lg mb-2">
              No inspections found
            </h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter text-sm text-center mb-6 max-w-sm">
              {searchTerm || filterStatus || filterType 
                ? 'Try adjusting your filters to find inspections.'
                : 'Start by creating your first inspection report.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredInspections.map((inspection) => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                onSelect={setSelectedInspection}
                onApprove={handleApprove}
                onView={handleView}
                isSelected={selectedInspection?.id === inspection.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}