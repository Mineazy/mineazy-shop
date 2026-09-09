import React from 'react';
import { CheckCircle, Users, Award, TrendingUp, Target, Heart, Calendar, Globe, Hand, Package, Building, MapPin, Zap } from 'lucide-react';
import Seo from '../components/Common/Seo';
import aboutBanner from '../assets/about-us-banner-mineazy.webp';
import sideImage from '../assets/sideimage-3.jpg';
import miningOperations from '../assets/mining-operations-mineazy.jpg';
import placeholderImage from '../assets/placeholder.jpg'

const About = () => {
  const coreValues = [
    {
      icon: CheckCircle,
      title: "Commitment to Units",
      description: "We are dedicated to providing exceptional service and support to every operational unit within our organization, ensuring consistent quality across all touchpoints."
    },
    {
      icon: Award,
      title: "Operational Excellence",
      description: "Striving for the highest standards in every aspect of our mining equipment solutions and services, from procurement to after-sales support."
    },
    {
      icon: Heart,
      title: "Transparency & Collaboration",
      description: "Building trust through open communication and collaborative partnerships with our stakeholders, fostering long-term relationships."
    },
    {
      icon: TrendingUp,
      title: "Innovation & Investment",
      description: "Continuously investing in cutting-edge technology and innovative solutions for the mining industry to stay ahead of market demands."
    }
  ];

  const companyStats = [
    { 
      number: "15+", 
      label: "Years of Experience", 
      description: "Serving Zimbabwe's mining industry with dedication",
      icon: Calendar
    },
    { 
      number: "5,000+", 
      label: "Products in Portfolio", 
      description: "From trusted global manufacturers",
      icon: Package
    },
    { 
      number: "4", 
      label: "Strategic Locations", 
      description: "Branch offices across Zimbabwe",
      icon: MapPin
    },
    { 
      number: "1,000+", 
      label: "Satisfied Customers", 
      description: "From small-scale to multinational operations",
      icon: Users
    }
  ];

  const leadershipTeam = [
    {
      name: "John Mukamuri",
      position: "Chief Executive Officer",
      image: {placeholderImage},
      description: "Leading Mineazy with over 20 years of mining industry experience and a vision for sustainable growth across Zimbabwe.",
      expertise: ["Strategic Leadership", "Mining Operations", "Business Development"],
      contact: { phone: "+263 712 290 046", email: "john.mukamuri@mineazy.co.zw" }
    },
    {
      name: "Sarah Chigumira",
      position: "Operations Director",
      image: {placeholderImage},
      description: "Ensuring operational excellence across all our branch locations with precision, dedication, and a focus on customer satisfaction.",
      expertise: ["Operations Management", "Process Optimization", "Quality Assurance"],
      contact: { phone: "+263 712 290 047", email: "sarah.chigumira@mineazy.co.zw" }
    },
    {
      name: "Michael Tawanda",
      position: "Technical Director",
      image: {placeholderImage},
      description: "Overseeing technical solutions and equipment innovations with deep industry expertise and commitment to excellence.",
      expertise: ["Technical Solutions", "Equipment Innovation", "Engineering"],
      contact: { phone: "+263 712 290 048", email: "michael.tawanda@mineazy.co.zw" }
    },
    {
      name: "Grace Mutindi",
      position: "Customer Relations Manager",
      image: {placeholderImage},
      description: "Dedicated to providing exceptional customer service and building lasting partnerships with our valued clients.",
      expertise: ["Customer Service", "Relationship Management", "Client Solutions"],
      contact: { phone: "+263 712 290 049", email: "grace.mutindi@mineazy.co.zw" }
    }
  ];

  const strategicPillars = [
    {
      icon: Zap,
      title: "Innovation",
      description: "Continuously advancing our technology portfolio and service capabilities to meet evolving industry demands.",
      initiatives: [
        "Digital transformation programs",
        "Advanced equipment sourcing",
        "Technology partnerships",
        "Research & development"
      ],
      color: "bg-primary/20"
    },
    {
      icon: TrendingUp,
      title: "Investment",
      description: "Strategic investments in infrastructure, technology, and human capital to expand our reach and capabilities.",
      initiatives: [
        "Branch network expansion",
        "Staff development programs",
        "Infrastructure upgrades",
        "Technology investments"
      ],
      color: "bg-secondary/20"
    },
    {
      icon: Target,
      title: "Impact",
      description: "Creating measurable value for stakeholders while contributing to Zimbabwe's economic development.",
      initiatives: [
        "Local job creation",
        "Skills development",
        "Community engagement",
        "Economic contribution"
      ],
      color: "bg-green-100"
    }
  ];

  const companyMilestones = [
    {
      year: "2009",
      title: "Company Founded",
      description: "Established with a vision to revolutionize Zimbabwe's mining equipment industry",
      icon: Building
    },
    {
      year: "2012",
      title: "First Branch Expansion",
      description: "Opened our second location in Bulawayo to serve the Matabeleland region",
      icon: MapPin
    },
    {
      year: "2015",
      title: "1000th Customer",
      description: "Reached milestone of serving over 1,000 mining operations across Zimbabwe",
      icon: Users
    },
    {
      year: "2018",
      title: "Digital Transformation",
      description: "Launched online platform and digital customer service capabilities",
      icon: Globe
    },
    {
      year: "2021",
      title: "Expanded Portfolio",
      description: "Reached 5,000+ products from world-renowned manufacturers",
      icon: Award
    },
    {
      year: "2025",
      title: "Industry Leader",
      description: "Recognized as Zimbabwe's premier mining equipment solutions provider",
      icon: Target
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="About Us"
        description="Mineazy is Zimbabwe's leading mining equipment supplier with over 15 years of experience. Learn about our mission, values, and commitment to excellence."
        keywords="about Mineazy, mining equipment company Zimbabwe, mining solutions provider"
        canonicalUrl="https://mineazy.co.zw/about"
      />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${aboutBanner})`
            }}
            onError={(e) => {
              e.target.style.backgroundImage = "url('/api/placeholder/1920/1080')";
            }}
          />
          <div className="absolute inset-0 bg-secondary/75"></div>
        </div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-8 shadow-xl">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-medium mb-8 leading-tight">
              About 
              <span className="block text-primary">
                Mineazy Mining
              </span>
              Solutions
            </h1>
            <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-3xl mx-auto mb-8">
              For over 15 years, we have been Zimbabwe's trusted partner in providing premium mining 
              equipment, safety solutions, and industrial machinery. Our commitment to excellence 
              drives everything we do.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#mission" className="bg-primary hover:bg-primary/90 text-secondary px-8 py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                Our Mission
              </a>
              <a href="#team" className="bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white hover:text-secondary text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
                Meet Our Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium mb-6">
                <Heart className="w-4 h-4" />
                Our Mission
              </div>
              <h2 className="text-4xl font-medium text-gray-900 mb-6 leading-tight">
                Optimizing Value for 
                <span className="block text-secondary">
                  All Stakeholders
                </span>
              </h2>
              <div className="bg-gray-50 rounded-lg p-8 mb-8 border">
                <p className="text-lg text-gray-800 leading-relaxed font-medium italic">
                  "To optimize value for all our stakeholders by delivering innovative mining solutions, 
                  maintaining operational excellence, and fostering sustainable growth in Zimbabwe's 
                  mining industry."
                </p>
              </div>
              
              <div className="space-y-6">
                {[
                  {
                    title: "Operational Excellence",
                    description: "Commitment to operational excellence in everything we do, from sourcing to delivery"
                  },
                  {
                    title: "Transparency & Collaboration", 
                    description: "Open communication and collaborative partnerships with all stakeholders"
                  },
                  {
                    title: "Innovation-Driven Solutions",
                    description: "Innovative solutions for evolving industry needs and emerging challenges"
                  },
                  {
                    title: "Sustainable Growth",
                    description: "Growth that benefits our community and contributes to national development"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-lg shadow-xl">
                <img
                  src={sideImage}
                  alt="Mineazy mining operations"
                  className="w-full h-96 object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/600/400';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-6 border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-medium text-gray-900">Excellence</div>
                    <div className="text-sm text-gray-600">Our Standard</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-6 border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Hand className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-medium text-gray-900">Trust</div>
                    <div className="text-sm text-gray-600">Our Foundation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-gray-900 mb-4">
              Our Core 
              <span className="text-secondary"> Values</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These fundamental principles guide our decisions and shape how we serve our customers every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {coreValues.map((value, index) => (
              <div key={index} className="group bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300 border transform hover:-translate-y-2">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-gray-900 mb-4">
              Our Impact in 
              <span className="text-secondary">Numbers</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These numbers reflect our commitment to excellence and growth in Zimbabwe's mining industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyStats.map((stat, index) => (
              <div key={index} className="group text-center bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-secondary" />
                </div>
                <div className="text-4xl font-medium text-gray-900 mb-2 text-secondary">
                  {stat.number}
                </div>
                <div className="text-lg font-medium text-gray-900 mb-2">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-gray-900 mb-4">
              Our Journey 
              <span className="text-secondary">Through Time</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Building Zimbabwe's mining future, one milestone at a time.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-secondary/20 rounded-full"></div>
            
            <div className="space-y-12">
              {companyMilestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border">
                      <div className="text-2xl font-medium text-secondary mb-2">{milestone.year}</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                    <milestone.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section id="team" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-gray-900 mb-4">
              Leadership 
              <span className="text-secondary">Team</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the experienced professionals driving Mineazy's vision forward with dedication and expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadershipTeam.map((member, index) => (
              <div key={index} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative">
                  <img
                    src={placeholderImage}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/300/300';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-secondary font-medium text-sm mb-3">
                    {member.position}
                  </p>
                  
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {member.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {member.expertise.map((skill, skillIndex) => (
                      <span key={skillIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>

                 
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Pillars */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-gray-900 mb-4">
              Strategic Focus 
              <span className="text-secondary"> Areas</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our three-pillar approach drives sustainable growth and value creation for all stakeholders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {strategicPillars.map((pillar, index) => (
              <div key={index} className="group text-center bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300 border transform hover:-translate-y-2">
                <div className={`w-20 h-20 ${pillar.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <pillar.icon className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-4">{pillar.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {pillar.description}
                </p>
                <div className="space-y-2">
                  {pillar.initiatives.map((initiative, initIndex) => (
                    <div key={initIndex} className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">{initiative}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${miningOperations})`
            }}
            onError={(e) => {
              e.target.style.backgroundImage = "url('/api/placeholder/1920/1080')";
            }}
          />
          <div className="absolute inset-0 bg-secondary/85"></div>
        </div>
        
        <div className="relative container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-medium mb-6 leading-tight">
              Ready to Partner with us
              
            </h2>
            <p className="text-xl lg:text-2xl text-gray-200 mb-12 leading-relaxed max-w-3xl mx-auto">
              Join the hundreds of mining operations across Zimbabwe who trust 
              Mineazy for their equipment and solution needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="/contact" className="bg-primary hover:bg-primary/90 text-secondary text-xl px-10 py-5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                Get in Touch
              </a>
              <a href="/shop" className="bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white hover:text-secondary text-white text-xl px-10 py-5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
                Explore Products
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;