import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, MapPin, Phone, Mail, Building, Calendar, Package, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Account = () => {
  const [searchParams] = useSearchParams();
  const { user, updateProfile, refreshProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    address: {
      street: '',
      suburb: '',
      city: '',
      province: 'Harare',
      country: 'Zimbabwe',
      postalCode: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadUserData = async () => {
      
      if (user) {
        if (refreshProfile) {
          try {
            await refreshProfile();
          } catch (error) {
            console.warn('Could not refresh profile:', error);
          }
        }
        
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          company: user.company || '',
          address: {
            street: user.address?.street || '',
            suburb: user.address?.suburb || '',
            city: user.address?.city || '',
            province: user.address?.province || 'Harare',
            country: user.address?.country || 'Zimbabwe',
            postalCode: user.address?.postalCode || ''
          }
        });
      }

      setIsLoading(false);
    };

    loadUserData();
  }, [user, refreshProfile]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (requestedTab && ['profile', 'orders', 'security'].includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  const provinces = [
    'Harare', 'Bulawayo', 'Manicaland', 'Mashonaland Central',
    'Mashonaland East', 'Mashonaland West', 'Masvingo',
    'Matabeleland North', 'Matabeleland South', 'Midlands'
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setUpdateMessage({ type: '', text: '' });
    
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setIsEditing(false);
        setUpdateMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setUpdateMessage({ type: '', text: '' }), 3000);
        
        if (refreshProfile) {
          await refreshProfile();
        }
      } else {
        setUpdateMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setUpdateMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      company: user?.company || '',
      address: {
        street: user?.address?.street || '',
        suburb: user?.address?.suburb || '',
        city: user?.address?.city || '',
        province: user?.address?.province || 'Harare',
        country: user?.address?.country || 'Zimbabwe',
        postalCode: user?.address?.postalCode || ''
      }
    });
    setIsEditing(false);
    setUpdateMessage({ type: '', text: '' });
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (passwordMessage.text) {
      setPasswordMessage({ type: '', text: '' });
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!passwordData.currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Current password is required.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);

      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordMessage({ type: 'success', text: result.message || 'Password changed successfully.' });
      } else {
        setPasswordMessage({ type: 'error', text: result.error || 'Failed to change password.' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'An error occurred while changing your password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const getFullName = () => {
    const first = user?.firstName || '';
    const last = user?.lastName || '';
    const fullName = `${first} ${last}`.trim();
    
    if (fullName) return fullName;
    if (user?.name) return user.name;
    return user?.email?.split('@')[0] || 'User';
  };

  const getInitials = () => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    const initials = (first + last).toUpperCase();
    
    if (initials) return initials;
    if (user?.name) return user.name.substring(0, 2).toUpperCase();
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0000fe] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#0000fe] to-[#1f2a6b] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-[#F0A422] font-bold text-3xl">
                    {getInitials()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{getFullName()}</h3>
                <p className="text-sm text-gray-600 mt-1 break-words px-2">{user?.email}</p>
                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                    user?.isVerified || user?.isEmailVerified
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user?.isVerified || user?.isEmailVerified ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </>
                    ) : (
                      'Unverified'
                    )}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                    {user?.role || 'Customer'}
                  </span>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#0000fe] to-[#1f2a6b] text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Profile Information</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#0000fe] text-white rounded-lg hover:bg-[#1f2a6b] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>

                  {updateMessage.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                      updateMessage.type === 'success' 
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      {updateMessage.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm font-medium ${
                        updateMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {updateMessage.text}
                      </p>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe]/50 focus:border-[#0000fe] transition-colors"
                              placeholder="John"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe]/50 focus:border-[#0000fe] transition-colors"
                              placeholder="Doe"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe]/50 focus:border-[#0000fe] transition-colors"
                              placeholder="+263 77 123 4567"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Company
                            </label>
                            <input
                              type="text"
                              value={formData.company}
                              onChange={(e) => handleInputChange('company', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe]/50 focus:border-[#0000fe] transition-colors"
                              placeholder="Your company name"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Street Address
                            </label>
                            <input
                              type="text"
                              value={formData.address.street}
                              onChange={(e) => handleInputChange('address.street', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe]/50 focus:border-[#0000fe] transition-colors"
                              placeholder="123 Main Street"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Suburb
                              </label>
                              <input
                                type="text"
                                value={formData.address.suburb}
                                onChange={(e) => handleInputChange('address.suburb', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe]/50 focus:border-[#0000fe] transition-colors"
                                placeholder="CBD"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                City
                              </label>
                              <input
                                type="text"
                                value={formData.address.city}
                                onChange={(e) => handleInputChange('address.city', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe]/50 focus:border-[#0000fe] transition-colors"
                                placeholder="Harare"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Province
                              </label>
                              <select
                                value={formData.address.province}
                                onChange={(e) => handleInputChange('address.province', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe]/50 focus:border-[#0000fe] transition-colors"
                              >
                                {provinces.map(province => (
                                  <option key={province} value={province}>
                                    {province}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Postal Code
                              </label>
                              <input
                                type="text"
                                value={formData.address.postalCode}
                                onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe]/50 focus:border-[#0000fe] transition-colors"
                                placeholder="00263"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country
                              </label>
                              <input
                                type="text"
                                value={formData.address.country}
                                disabled
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSubmitting}
                          className="px-6 py-2.5 bg-[#0000fe] text-white font-medium rounded-lg hover:bg-[#1f2a6b] transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-start space-x-3">
                            <User className="w-5 h-5 text-[#0000fe] mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">Full Name</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {user?.firstName || user?.lastName
                                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                  : user?.name || <span className="text-gray-400 italic">Not provided</span>}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <Mail className="w-5 h-5 text-[#0000fe] mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">Email Address</p>
                              <p className="text-sm text-gray-600 mt-1 break-words">{user?.email}</p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <Phone className="w-5 h-5 text-[#0000fe] mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">Phone Number</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {user?.phone || <span className="text-gray-400 italic">Not provided</span>}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <Building className="w-5 h-5 text-[#0000fe] mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">Company</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {user?.company || <span className="text-gray-400 italic">Not provided</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-[#0000fe] mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            {user?.address && (user.address.street || user.address.city) ? (
                              <div className="text-sm text-gray-600 space-y-1">
                                {user.address.street && <p>{user.address.street}</p>}
                                {user.address.suburb && <p>{user.address.suburb}</p>}
                                {user.address.city && (
                                  <p>
                                    {user.address.city}
                                    {user.address.province && `, ${user.address.province}`}
                                  </p>
                                )}
                                {user.address.country && <p>{user.address.country}</p>}
                                {user.address.postalCode && <p>{user.address.postalCode}</p>}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No address provided. Click "Edit Profile" to add your delivery address.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-[#0000fe] mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Member Since</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'Unknown'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-[#0000fe] mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Email Status</p>
                              <p className={`text-sm font-medium mt-1 ${
                                user?.isVerified || user?.isEmailVerified ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {user?.isVerified || user?.isEmailVerified ? 'Verified' : 'Unverified'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order History</h2>
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">View Your Orders</h3>
                    <p className="text-gray-600 mb-6">Access detailed order history and tracking information.</p>
                    <a href="/orders" className="inline-block px-6 py-3 bg-[#0000fe] text-white font-medium rounded-lg hover:bg-[#1f2a6b] transition-colors">
                      Go to Orders
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#0000fe]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="w-6 h-6 text-[#0000fe]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Password</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Keep your account secure by using a strong password.
                          </p>
                          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            {passwordMessage.text && (
                              <div className={`p-3 rounded-lg flex items-start gap-2 ${
                                passwordMessage.type === 'success'
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-red-50 border border-red-200'
                              }`}>
                                {passwordMessage.type === 'success' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <p className={`text-sm font-medium ${
                                  passwordMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                  {passwordMessage.text}
                                </p>
                              </div>
                            )}

                            <div>
                              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                              </label>
                              <input
                                id="currentPassword"
                                type="password"
                                autoComplete="current-password"
                                value={passwordData.currentPassword}
                                onChange={(event) => handlePasswordInputChange('currentPassword', event.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe] focus:border-transparent"
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                              </label>
                              <input
                                id="newPassword"
                                type="password"
                                autoComplete="new-password"
                                value={passwordData.newPassword}
                                onChange={(event) => handlePasswordInputChange('newPassword', event.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe] focus:border-transparent"
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                              </label>
                              <input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                value={passwordData.confirmPassword}
                                onChange={(event) => handlePasswordInputChange('confirmPassword', event.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0000fe] focus:border-transparent"
                                required
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isChangingPassword}
                              className="inline-block px-4 py-2 bg-[#0000fe] text-white rounded-lg hover:bg-[#1f2a6b] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            user?.isVerified || user?.isEmailVerified 
                              ? 'bg-green-100' 
                              : 'bg-yellow-100'
                          }`}>
                            <Mail className={`w-6 h-6 ${
                              user?.isVerified || user?.isEmailVerified 
                                ? 'text-green-600' 
                                : 'text-yellow-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Verification</h3>
                            <p className="text-sm text-gray-600">
                              Your email is {user?.isVerified || user?.isEmailVerified ? 'verified' : 'not verified'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                          user?.isVerified || user?.isEmailVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user?.isVerified || user?.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
