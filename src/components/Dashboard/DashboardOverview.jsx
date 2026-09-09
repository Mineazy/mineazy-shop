// src/components/Dashboard/DashboardOverview.jsx
import React from 'react';
import { Package, DollarSign, Clock, CheckCircle } from 'lucide-react';

const DashboardOverview = ({ user, stats }) => {
  const welcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickStats = [
    {
      icon: Package,
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: DollarSign,
      label: 'Total Spent',
      value: `$${stats?.totalSpent?.toLocaleString() || '0'}`,
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Clock,
      label: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      icon: CheckCircle,
      label: 'Completed Orders',
      value: stats?.completedOrders || 0,
      color: 'text-green-600 bg-green-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-secondary to-secondary/80 text-white rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {welcomeMessage()}, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-white/80">
              Welcome back to your Mineazy dashboard. Here's an overview of your account activity.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Verification</p>
              <p className="text-sm text-gray-600">Your email is verified</p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              user?.isEmailVerified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Account Type</p>
              <p className="text-sm text-gray-600 capitalize">{user?.role || 'Customer'}</p>
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;