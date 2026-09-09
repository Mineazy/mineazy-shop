import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle, Loader2, User, Building, MessageSquare, Zap, Shield } from 'lucide-react';
import { contactAPI } from '../services/api';
import Seo from '../components/Common/Seo';


const Contact = () => {
  const branches = [
    {
      name: 'Head Office – Bulawayo',
      code: 'HO001',
      city: 'Bulawayo',
      address: '15 Plumtree Road, Belmont, Bulawayo, Zimbabwe',
      phone: '+263 29 226 5103',
      phone2: '+263 712 290 046',
      email: 'enquiries@mineazy.co.zw',
      hours: 'Mon-Fri: 8:00-17:00, Sat: 8:00-12:00',
    },
    {
      name: 'Esigodini Branch',
      code: 'ESI001',
      city: 'Esigodini',
      address: 'Lot 3 Essex, Esigodini',
      phone: '+263 714 786 731',
      phone2: '+263 777 319 370',
      email: 'enquiries@mineazy.co.zw',
      hours: 'Mon-Fri: 8:00-17:00',
    },
    {
      name: 'Filabusi Branch',
      code: 'FIL001',
      city: 'Filabusi',
      address: 'Filabusi',
      phone: '+263 84 2801428',
      phone2: '+263 777 485 017',
      email: 'enquiries@mineazy.co.zw',
      hours: 'Mon-Fri: 8:00-17:00',
    },
    {
      name: 'Gwanda Branch',
      code: 'GWA001',
      city: 'Gwanda',
      address: 'Thobelani Building & 946 Jahunda, Gwanda',
      phone: '+263 84 2820513',
      phone2: '+263 717 852 371',
      phone3: '+263 712 290 774',
      email: 'enquiries@mineazy.co.zw',
      hours: 'Mon-Fri: 8:00-17:00',
    },
    {
      name: 'Maphisa Branch',
      code: 'MAP001',
      city: 'Maphisa',
      address: 'Stand No 259, Maphisa',
      phone: '+263 292 807623',
      phone2: '+263 715 348 701',
      phone3: '+263 777 487 417',
      email: 'enquiries@mineazy.co.zw',
      hours: 'Mon-Fri: 8:00-17:00',
    },
    {
      name: 'Gweru Branch',
      code: 'GWE001',
      city: 'Gweru',
      address: '22 Bedford, Light Industry, Gweru',
      phone: '+263 54 222 2261',
      phone2: '+263 717 129 181',
      email: 'enquiries@mineazy.co.zw',
      hours: 'Mon-Fri: 8:00-17:00',
    },
    {
      name: 'Francistown – Botswana',
      code: 'BWA001',
      city: 'Francistown, Botswana',
      address: 'Francistown, Botswana',
      phone: '+267 7685 3875',
      email: 'enquiries@mineazy.co.zw',
      hours: 'Mon-Fri: 8:00-17:00',
    },
    {
      name: 'Lusaka – Zambia',
      code: 'ZMB001',
      city: 'Lusaka, Zambia',
      address: 'Lusaka, Zambia',
      phone: '+260 775 541 770',
      email: 'enquiries@mineazy.co.zw',
      hours: 'Mon-Fri: 8:00-17:00',
    },
  ];

  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    type: 'general_inquiry'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const inquiryTypes = [
    { value: 'general_inquiry', label: 'General Inquiry' },
    { value: 'product_inquiry', label: 'Product Inquiry' },
    { value: 'quote_request', label: 'Quote Request' },
    { value: 'technical_support', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership Opportunity' },
    { value: 'complaint', label: 'Feedback & Complaints' }
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+263 712 290 046', '+263 29 226 5103'],
      description: 'Available during business hours',
      color: 'bg-[#0000fe]'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['enquiries@mineazy.co.zw'],
      description: 'We respond within 24 hours',
      color: 'bg-[#0000fe]'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      details: ['Available Mon-Fri', '8:00 AM - 5:00 PM'],
      description: 'Chat with our support team',
      color: 'bg-[#0000fe]',
      action: () => {
        // Initialize live chat here
        alert('Live chat feature coming soon!');
      }
    },
    {
      icon: Zap,
      title: 'Quick Quote',
      details: ['Get instant estimates', 'For your products'],
      description: 'Fast response guaranteed',
      color: 'bg-[#0000fe]',
      link: '/shop'
    }
  ];
const validateForm = () => {
  const newErrors = {};
  
  // Name validation
  if (!formData.name.trim()) {
    newErrors.name = 'Name is required';
  } else if (formData.name.trim().length < 2) {
    newErrors.name = 'Name must be at least 2 characters';
  }
  
  // Email validation
  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Please enter a valid email';
  }
  
  // Phone validation (optional but validate if provided)
  if (formData.phone.trim() && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
    newErrors.phone = 'Please enter a valid phone number';
  }
  
  // Subject validation
  if (!formData.subject.trim()) {
    newErrors.subject = 'Subject is required';
  } else if (formData.subject.trim().length < 5) {
    newErrors.subject = 'Subject must be at least 5 characters';
  }
  
  // Message validation
  if (!formData.message.trim()) {
    newErrors.message = 'Message is required';
  } else if (formData.message.trim().length < 10) {
    newErrors.message = 'Message must be at least 10 characters';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    setSubmitStatus('error');
    setSubmitMessage('Please fix the errors above');
    return;
  }
  
  setIsSubmitting(true);
  setSubmitStatus(null);
  setSubmitMessage('');
  
  try {
    
    // Prepare data matching backend schema
    const contactData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim()
    };
    
    // Submit to API
    const response = await contactAPI.submit(contactData);
    
    
    // Show success message
    setSubmitStatus('success');
    setSubmitMessage(
      response.data?.message || 
      'Thank you for your message! We will get back to you within 24 hours.'
    );
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: '',
      type: 'general_inquiry'
    });
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSubmitStatus(null);
      setSubmitMessage('');
    }, 5000);
    
  } catch (error) {
    console.error('❌ Contact form submission failed:', error);
    
    let errorMessage = 'Failed to send message. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 400) {
      errorMessage = 'Please check your information and try again.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Too many requests. Please try again in a few minutes.';
    } else if (!error.response) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    setSubmitStatus('error');
    setSubmitMessage(errorMessage);
    
    // Clear error message after 8 seconds
    setTimeout(() => {
      setSubmitStatus(null);
      setSubmitMessage('');
    }, 8000);
    
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Seo
        title="Contact Us"
        description="Get in touch with Mineazy for mining equipment inquiries, quotes, and support. Visit our branches in Bulawayo, Harare, and other locations across Zimbabwe."
        keywords="contact Mineazy, mining equipment Zimbabwe, mining supplies inquiry, Mineazy branches"
        canonicalUrl="https://mineazy.co.zw/contact"
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0000fe] via-[#1e2870] to-[#0000fe] text-white overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#fcf250] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#fcf250] rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <MessageSquare className="w-5 h-5 text-[#fcf250]" />
              <span className="text-sm font-semibold">Let's Connect</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Get In Touch With
              <span className="block text-[#fcf250] mt-2">Mining Experts</span>
            </h1>

            <p className="text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed">
              Ready to elevate your mining operations? Our team is here to provide expert guidance and competitive solutions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:+263712290046"
                className="group px-8 py-4 bg-[#fcf250] text-[#0000fe] rounded-full font-bold text-lg hover:bg-yellow-400 transition-all duration-300 flex items-center gap-2 shadow-2xl hover:shadow-yellow-400/50 hover:scale-105"
              >
                <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Call Now
              </a>
              <a
                href="#contact-form"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white hover:text-[#0000fe] transition-all duration-300 flex items-center gap-2 hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                Send Message
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Branch Selector Card */}
          <div className="group bg-white rounded-2xl shadow-xl border-2 border-transparent hover:border-[#fcf250] p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 lg:col-span-2">
            <div className="w-14 h-14 bg-[#0000fe] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Select Your Branch</h3>
            <p className="text-sm text-gray-600 mb-4">Choose a branch to view contact details</p>
            
            <div className="space-y-2">
              {branches.map((branch) => (
                <button
                  key={branch.code}
                  onClick={() => setSelectedBranch(branch)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    selectedBranch.code === branch.code
                      ? 'bg-[#0000fe] text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">{branch.name}</div>
                      <div className={`text-xs mt-1 ${
                        selectedBranch.code === branch.code ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {branch.city}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      selectedBranch.code === branch.code
                        ? 'bg-[#fcf250] text-[#0000fe]'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {branch.code}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Branch Details Card */}
          <div className="group bg-white rounded-2xl shadow-xl border-2 border-transparent hover:border-[#fcf250] p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 lg:col-span-2">
            <div className="w-14 h-14 bg-[#0000fe] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Building className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedBranch.name}</h3>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#0000fe] flex-shrink-0 mt-1" />
                <span className="text-sm text-gray-700 font-medium">{selectedBranch.address}</span>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-[#0000fe] flex-shrink-0 mt-1" />
                <div className="flex flex-col gap-1">
                  {[selectedBranch.phone, selectedBranch.phone2, selectedBranch.phone3].filter(Boolean).map((p) => (
                    <a key={p} href={`tel:${p}`} className="text-sm text-[#0000fe] hover:text-[#1e2870] font-bold transition-colors">
                      {p}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#0000fe]" />
                <a
                  href={`mailto:${selectedBranch.email}`}
                  className="text-sm text-[#0000fe] hover:text-[#1e2870] font-bold transition-colors break-all"
                >
                  {selectedBranch.email}
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-[#0000fe] flex-shrink-0 mt-1" />
                <span className="text-sm text-gray-700 font-medium">{selectedBranch.hours}</span>
              </div>
            </div>
          </div>

          {/* Contact Info Cards */}
          {contactInfo.map((info, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl shadow-xl border-2 border-transparent hover:border-[#fcf250] p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
              onClick={info.action ? info.action : (info.link ? () => window.location.href = info.link : undefined)}
            >
              <div className={`w-14 h-14 ${info.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <info.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
              <div className="space-y-1 mb-3">
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-700 font-medium text-sm">{detail}</p>
                ))}
              </div>
              <p className="text-sm text-gray-500">{info.description}</p>
              {(info.action || info.link) && (
                <div className="mt-4 flex items-center text-sm font-bold text-[#0000fe] group-hover:text-[#1e2870]">
                  <span>Click to {info.action ? 'start' : 'explore'}</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-8 lg:p-12" id="contact-form">
              <div className="mb-8">
                <div className="inline-block px-4 py-2 bg-[#0000fe]/10 text-[#0000fe] rounded-full text-sm font-semibold mb-4">
                  📝 Contact Form
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Send Us a Message
                </h2>
                <p className="text-gray-600 text-lg">
                  Fill out the form below and our team will respond within 24 hours. For urgent matters, please call us directly.
                </p>
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-5 bg-green-50 border-2 border-green-200 rounded-2xl flex items-start space-x-3 animate-slide-up">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-green-800 text-lg">Success!</h3>
                    <p className="text-sm text-green-700 mt-1">{submitMessage}</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-800 text-lg">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{submitMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inquiry Type - Simple Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Inquiry Type *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#0000fe]/20 focus:border-[#0000fe] transition-all text-gray-900 font-medium appearance-none bg-white cursor-pointer"
                    >
                      {inquiryTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-[#0000fe]/20 focus:border-[#0000fe] transition-all text-gray-900 font-medium ${
                          errors.name ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-[#0000fe]/20 focus:border-[#0000fe] transition-all text-gray-900 font-medium ${
                          errors.email ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="your.email@company.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Phone and Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-[#0000fe]/20 focus:border-[#0000fe] transition-all text-gray-900 font-medium ${
                          errors.phone ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="+263 77 123 4567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#0000fe]/20 focus:border-[#0000fe] transition-all text-gray-900 font-medium"
                        placeholder="Your company (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-[#0000fe]/20 focus:border-[#0000fe] transition-all text-gray-900 font-medium ${
                      errors.subject ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Brief subject of your inquiry"
                  />
                  {errors.subject && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows="6"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-[#0000fe]/20 focus:border-[#0000fe] transition-all resize-none text-gray-900 font-medium ${
                      errors.message ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Tell us about your needs, project requirements, or any questions..."
                  />
                  {errors.message && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#0000fe] to-[#1e2870] hover:from-[#1e2870] hover:to-[#0000fe] disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-[#0000fe]/50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group disabled:transform-none hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Contact Card */}
            <div className="bg-gradient-to-br from-[#0000fe] to-[#1e2870] text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#fcf250] opacity-10 rounded-full filter blur-3xl"></div>
              <div className="relative">
                <Zap className="w-12 h-12 text-[#fcf250] mb-4" />
                <h3 className="text-2xl font-bold mb-3">Need Urgent Help?</h3>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  For immediate assistance or technical emergencies, our expert team is ready to help.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+263712290046"
                    className="block w-full bg-[#fcf250] hover:bg-yellow-400 text-[#0000fe] text-center py-4 px-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-yellow-400/50 hover:scale-105"
                  >
                    📞 +263 712290 046
                  </a>
                  <a
                    href="mailto:enquiries@mineazy.co.zw"
                    className="block w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-center py-4 px-4 rounded-xl font-bold transition-all duration-200 border-2 border-white/20"
                  >
                    ✉️ Email Support
                  </a>
                </div>
              </div>
            </div>

            {/* Business Hours & Response Times */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#0000fe]/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#0000fe]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  { day: 'Monday - Friday', hours: '8:00 AM - 5:00 PM', color: 'text-green-600', bg: 'bg-green-50' },
                  { day: 'Saturday', hours: '8:00 AM - 12:00 PM', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { day: 'Sunday', hours: 'Closed', color: 'text-red-600', bg: 'bg-red-50' }
                ].map((item, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-3 ${item.bg} rounded-xl`}>
                    <span className="text-sm text-gray-700 font-semibold">{item.day}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-[#0000fe] via-[#1e2870] to-[#0000fe] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#fcf250] rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#fcf250] rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#fcf250]/20 backdrop-blur-sm border border-[#fcf250]/30 rounded-full px-6 py-3 mb-8">
              <Shield className="w-5 h-5 text-[#fcf250]" />
              <span className="text-sm font-bold">Trusted Mining Partner</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Ready to Transform Your
              <span className="block text-[#fcf250] mt-2">Mining Operations?</span>
            </h2>

            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              Join hundreds of satisfied clients who trust Mineazy for premium mining equipment and exceptional service. Let's discuss your project today.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="tel:+263712290046" 
                className="group px-10 py-5 bg-[#fcf250] hover:bg-yellow-400 text-[#0000fe] text-xl font-bold rounded-full transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 flex items-center gap-3 hover:scale-110"
              >
                <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Call: +263 712290 046
              </a>
              <a 
                href="/shop" 
                className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white hover:text-[#0000fe] text-white text-xl font-bold rounded-full transition-all duration-300 flex items-center gap-3 hover:scale-105"
              >
                🛒 Browse Products
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#fcf250]"></div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Contact;
