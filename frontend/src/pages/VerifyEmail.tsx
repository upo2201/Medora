import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * VerifyEmail is obsolete in Medora's simplified email notification workflow.
 * Automatically redirects any legacy URL accesses directly to Profile.
 */
export const VerifyEmail: React.FC = () => {
  return <Navigate to="/profile" replace />;
};
