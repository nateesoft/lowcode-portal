import React from 'react';

interface DashboardContentProps {
  children: React.ReactNode;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ children }) => {
  return (
    <div className="lg:ml-64">
      <div className="p-4 sm:p-8">
        {children}
      </div>
    </div>
  );
};

export default DashboardContent;