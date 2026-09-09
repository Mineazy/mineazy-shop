import React, { useState } from 'react';
import { ChevronDown, MapPin, Phone, Clock } from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { useClickOutside } from '../../hooks';

const BranchSelector = () => {
  const { branches, selectedBranch, setSelectedBranch, loading } = useBranch();
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useClickOutside(() => setIsOpen(false));

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setIsOpen(false);
  };

  // Helper function to format operating hours safely
  const formatOperatingHours = (operatingHours) => {
    if (!operatingHours) return '08:00-17:00';
    
    // Handle different data structures
    if (typeof operatingHours === 'string') {
      return operatingHours;
    }
    
    if (typeof operatingHours === 'object') {
      // Check for monday hours specifically
      if (operatingHours.monday) {
        const monday = operatingHours.monday;
        if (typeof monday === 'object' && monday.open && monday.close) {
          return `${monday.open}-${monday.close}`;
        }
        if (typeof monday === 'string') {
          return monday;
        }
      }
      
      // Fallback to a general format
      return '08:00-17:00';
    }
    
    return '08:00-17:00';
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-4 h-4 bg-white/30 rounded"></div>
        <div className="w-24 h-4 bg-white/30 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-colors duration-200 text-white"
        aria-label="Select branch"
      >
        <MapPin className="w-4 h-4 text-white" />
        <span className="text-sm font-medium text-white">
          {selectedBranch ? selectedBranch.name : 'Select Branch'}
        </span>
        <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-elegant border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 text-sm">Select Your Preferred Branch</h3>
            <p className="text-xs text-gray-600 mt-1">Choose a branch for pricing and availability</p>
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {branches.map((branch) => (
              <button
                key={branch._id}
                onClick={() => handleBranchSelect(branch)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                  selectedBranch?._id === branch._id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{branch.name}</h4>
                      <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                        {branch.branch_code || branch.code || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {branch.location?.address || 'Address not available'}, {branch.location?.city || 'City not available'}
                        </span>
                      </div>
                      
                      {branch.contact?.phone && (
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{branch.contact.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatOperatingHours(branch.operatingHours)} (Mon-Fri)
                        </span>
                      </div>
                    </div>

                    {branch.services && Array.isArray(branch.services) && branch.services.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {branch.services.slice(0, 3).map((service, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                            >
                              {service}
                            </span>
                          ))}
                          {branch.services.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{branch.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedBranch?._id === branch._id && (
                    <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {branches.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No branches available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BranchSelector;