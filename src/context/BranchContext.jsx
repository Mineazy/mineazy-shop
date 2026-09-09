// src/context/BranchContext.jsx - Updated to remove branch functionality
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state - branches are no longer used in the new backend
const initialState = {
  branches: [],
  selectedBranch: null,
  loading: false,
  error: null,
};

// Action types (minimal as branches are deprecated)
const BRANCH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const branchReducer = (state, action) => {
  switch (action.type) {
    case BRANCH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case BRANCH_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case BRANCH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const BranchContext = createContext();

// Provider component
export const BranchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(branchReducer, initialState);

  // No-op functions to maintain compatibility with existing components
  const loadBranches = async () => {
    return { branches: [], selectedBranch: null };
  };

  const setSelectedBranch = (branch) => {
    // No-op for compatibility
  };

  const getBranchById = (branchId) => {
    return null;
  };

  const getBranchByCode = (code) => {
    return null;
  };

  const clearError = () => {
    dispatch({ type: BRANCH_ACTIONS.CLEAR_ERROR });
  };

  // Log deprecation warning on mount
  useEffect(() => {
  }, []);

  const value = {
    ...state,
    loadBranches,
    setSelectedBranch,
    getBranchById,
    getBranchByCode,
    clearError,
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};

// Custom hook to use branch context (now deprecated)
export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

export default BranchContext;