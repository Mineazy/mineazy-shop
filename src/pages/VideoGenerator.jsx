import React, { useState } from 'react';
import { Play, Video, Wand2, Download, Eye, Share2 } from 'lucide-react';

const VideoGeneratorDemo = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [formData, setFormData] = useState({
    script: `Welcome to Mineazy Mining Solutions - your trusted partner for premium mining equipment in Zimbabwe.

With over 15 years of experience, we deliver innovative solutions that optimize value for all our stakeholders.

Our comprehensive product portfolio includes:
- Premium mining equipment from world-renowned manufacturers
- Advanced safety equipment for secure operations  
- Industrial processing machinery
- Essential tools and spare parts

We serve mining operations across Zimbabwe with 4 strategic branch locations, providing:
- Fast nationwide delivery with tracking
- Expert technical support and consultation
- 24/7 maintenance services
- Competitive pricing on quality equipment

From small-scale operations to major multinational corporations, Mineazy has equipped over 1,000 satisfied customers with the tools they need to succeed.

Ready to optimize your mining operations? Contact us today for personalized equipment recommendations and competitive quotes.

Mineazy Mining Solutions - Delivering Innovation, Investment, and Impact.`,
    topic: 'Mining Equipment Solutions',
    vibe: 'professional',
    targetAudience: 'Mining industry professionals and decision makers',
    platform: 'youtube'
  });

  const vibeOptions = [
    { value: 'professional', label: 'Professional', description: 'Corporate and business-focused' },
    { value: 'educational', label: 'Educational', description: 'Informative and instructional' },
    { value: 'entertaining', label: 'Entertaining', description: 'Engaging and fun' },
    { value: 'inspiring', label: 'Inspiring', description: 'Motivational and uplifting' }
  ];

  const platformOptions = [
    { value: 'youtube', label: 'YouTube', aspect: '16:9' },
    { value: 'instagram', label: 'Instagram', aspect: '9:16' },
    { value: 'tiktok', label: 'TikTok', aspect: '9:16' },
    { value: 'facebook', label: 'Facebook', aspect: '16:9' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate video generation (replace with actual InVideo API call)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock generated video data
      const mockVideo = {
        id: 'video_' + Date.now(),
        url: 'https://example.com/generated-video.mp4',
        thumbnail: '/api/placeholder/640/360',
        duration: 120, // seconds
        title: `${formData.topic} - Marketing Video`,
        platform: formData.platform,
        createdAt: new Date().toISOString()
      };
      
      setGeneratedVideo(mockVideo);
    } catch (error) {
      console.error('Video generation failed:', error);
      alert('Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedVideo) {
      // In a real implementation, this would download the actual video
      alert('Video download started! (This is a demo)');
    }
  };

  const handleShare = () => {
    if (generatedVideo) {
      // In a real implementation, this would open sharing options
      alert('Share options would open here! (This is a demo)');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Video className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Video Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create professional marketing videos for Mineazy using AI. 
            Transform your script into engaging video content optimized for any platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Video Configuration Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Wand2 className="w-6 h-6 text-primary" />
              <span>Video Configuration</span>
            </h2>

            <div className="space-y-6">
              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Topic
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Enter the main topic of your video"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Describe your target audience"
                />
              </div>

              {/* Vibe Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Video Vibe
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {vibeOptions.map(vibe => (
                    <label
                      key={vibe.value}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.vibe === vibe.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="vibe"
                        value={vibe.value}
                        checked={formData.vibe === vibe.value}
                        onChange={(e) => handleInputChange('vibe', e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{vibe.label}</h4>
                        <p className="text-xs text-gray-600">{vibe.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Platform
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {platformOptions.map(platform => (
                    <label
                      key={platform.value}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.platform === platform.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="platform"
                        value={platform.value}
                        checked={formData.platform === platform.value}
                        onChange={(e) => handleInputChange('platform', e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{platform.label}</h4>
                        <p className="text-xs text-gray-600">{platform.aspect} aspect ratio</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Script */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Script
                </label>
                <textarea
                  rows="10"
                  value={formData.script}
                  onChange={(e) => handleInputChange('script', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                  placeholder="Enter your video script here..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  Character count: {formData.script.length}
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateVideo}
                disabled={isGenerating || !formData.script.trim()}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {isGenerating ? (
                  <>
                    <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Video...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6" />
                    <span>Generate Video</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Video Preview & Result */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Play className="w-6 h-6 text-primary" />
              <span>Video Preview</span>
            </h2>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Your Video</h3>
                <p className="text-gray-600 text-center max-w-sm">
                  Our AI is creating your professional video. This may take a few minutes...
                </p>
              </div>
            ) : generatedVideo ? (
              <div>
                {/* Video Player Placeholder */}
                <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-6">
                  <img
                    src={generatedVideo.thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-secondary ml-1" />
                    </button>
                  </div>
                </div>

                {/* Video Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {generatedVideo.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Duration: {Math.floor(generatedVideo.duration / 60)}:{(generatedVideo.duration % 60).toString().padStart(2, '0')}</span>
                      <span>Platform: {formData.platform}</span>
                      <span>Vibe: {formData.vibe}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDownload}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>

                    <button
                      onClick={() => window.open(generatedVideo.url, '_blank')}
                      className="flex-1 btn-outline flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex-1 btn-outline flex items-center justify-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Generate Another */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setGeneratedVideo(null)}
                      className="w-full text-primary hover:text-primary/80 font-medium"
                    >
                      Generate Another Video
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Video className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Video Generated Yet</h3>
                <p className="text-gray-600 text-center max-w-sm">
                  Configure your video settings and click "Generate Video" to create your professional marketing video.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            Why Choose AI Video Generation?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Advanced AI technology creates professional videos from your script automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Platform</h3>
              <p className="text-gray-600 text-sm">
                Generate videos optimized for YouTube, Instagram, TikTok, and Facebook.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Quality</h3>
              <p className="text-gray-600 text-sm">
                High-quality visuals, animations, and transitions for professional marketing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGeneratorDemo;