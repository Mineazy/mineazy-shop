// src/pages/BlogPost.jsx - Updated for new backend API
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, Eye, Tag, ArrowLeft, Facebook, Twitter, Linkedin, Copy, BookOpen, TrendingUp } from 'lucide-react';
import Loading from '../components/Common/Loading';
import { ErrorMessage } from '../components/Common/ErrorBoundary';
import { useBlogPost } from '../hooks/useBlog';
import Seo, { BlogPostJsonLd, BreadcrumbJsonLd } from '../components/Common/Seo';
import {
  getBlogTitle,
  getBlogExcerpt,
  getBlogImageUrl,
  getBlogAuthor,
  getBlogCategory,
  getBlogTags,
  getBlogContent,
  formatBlogDate,
  formatViewCount,
  calculateReadingTime,
  generateShareUrls
} from '../utils/blogUtils';

const BlogPost = () => {
  const { slug } = useParams();
  const { post, relatedPosts, loading, error } = useBlogPost(slug);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleShare = (platform) => {
    if (!post) return;
    
    const shareUrls = generateShareUrls(post);
    
    if (platform === 'copy') {
      const url = `${window.location.origin}/blog/${post.slug}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
      return;
    }
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 lg:pt-40">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <Loading size="lg" text="Loading article..." />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 lg:pt-40">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <ErrorMessage
              title="Article Not Found"
              message={error || 'The requested blog post could not be found'}
            />
            <div className="text-center mt-6">
              <Link to="/blog" className="btn-primary inline-block">
                Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const title = getBlogTitle(post);
  const excerpt = getBlogExcerpt(post);
  const imageUrl = getBlogImageUrl(post, 'large');
  const author = getBlogAuthor(post);
  const category = getBlogCategory(post);
  const tags = getBlogTags(post);
  const content = getBlogContent(post);
  const readingTime = calculateReadingTime(content);

  const seoTitle = post?.metaTitle || post?.title || 'Blog Post';
  const seoDescription = post?.metaDescription || post?.excerpt || post?.content?.substring(0, 160) || '';
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    ...(category ? [{ name: category.name, path: `/blog?category=${category._id}` }] : []),
    { name: title, path: `/blog/${post?.slug}` }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={post?.metaKeywords || (post?.tags?.length > 0 ? post.tags.join(', ') : '')}
        canonicalUrl={`https://mineazy.co.zw/blog/${post?.slug}`}
        ogImage={imageUrl}
        ogType="article"
      />
      <BlogPostJsonLd post={post} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-secondary to-secondary/90 text-white pt-32 lg:pt-40 pb-16 lg:pb-20">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-300 mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              {category && (
                <>
                  <span>/</span>
                  <span className="text-primary font-medium">{category.name}</span>
                </>
              )}
            </nav>

            {/* Back Button */}
            <Link
              to="/blog"
              className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium mb-8 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Articles</span>
            </Link>
            
            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
              {category && (
                <span className="bg-primary text-secondary px-3 py-1 rounded-full text-xs font-semibold">
                  {category.name}
                </span>
              )}
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatBlogDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{author.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViewCount(post.viewCount || 0)}</span>
                </div>
              </div>
            </div>
            
            {/* Article Title */}
            <h1 className="text-3xl lg:text-5xl font-bold leading-tight mb-4">
              {title}
            </h1>
            
            {/* Article Excerpt */}
            {excerpt && (
              <p className="text-xl text-gray-200 leading-relaxed max-w-3xl">
                {excerpt}
              </p>
            )}
          </div>
        </div>
      </section>

      <article className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-8">
            <div className="relative">
              <div className="aspect-video overflow-hidden">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Author and Share Section */}
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Author Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-secondary font-semibold text-lg">
                      {author.firstName?.charAt(0)?.toUpperCase() || author.name?.charAt(0)?.toUpperCase() || 'M'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {author.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Mining Industry Expert • Published {formatBlogDate(post.publishedAt, 'relative')}
                    </p>
                  </div>
                </div>
                
                {/* Share Buttons */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Share:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="p-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="p-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className={`p-2 rounded-lg transition-colors ${
                        copySuccess 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                      aria-label={copySuccess ? 'Link copied!' : 'Copy link'}
                    >
                      {copySuccess ? '✓' : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="p-8 lg:p-12">
              {/* Reading Progress Indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8 pb-4 border-b border-gray-100">
                <BookOpen className="w-4 h-4" />
                <span>Estimated reading time: {readingTime} minutes</span>
              </div>
              
              <div className="prose prose-lg max-w-none">
                {content ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: content }}
                    className="leading-relaxed blog-content"
                  />
                ) : (
                  <div className="text-gray-700 leading-relaxed text-lg">
                    <p>{excerpt}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-gray-700">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Link
                        key={tag}
                        to={`/blog?search=${encodeURIComponent(tag)}`}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-primary hover:text-secondary transition-colors font-medium"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Author Bio */}
          {author && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
              <div className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-secondary font-bold text-2xl">
                      {author.firstName?.charAt(0)?.toUpperCase() || author.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      About {author.name}
                    </h3>
                    {author.email && (
                      <p className="text-primary text-sm font-medium mb-3">
                        {author.email}
                      </p>
                    )}
                    <p className="text-gray-600 leading-relaxed">
                      {author.bio || `${author.name} is a mining industry expert contributing valuable insights and analysis to help professionals stay informed about the latest developments in Zimbabwe's mining sector.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-secondary to-secondary/90 text-white p-8">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Related Articles</h2>
                </div>
                <p className="text-gray-200 mt-2">Continue exploring mining industry insights</p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map(relatedPost => {
                    const relatedTitle = getBlogTitle(relatedPost);
                    const relatedExcerpt = getBlogExcerpt(relatedPost);
                    const relatedImage = getBlogImageUrl(relatedPost);
                    const relatedReadingTime = calculateReadingTime(getBlogContent(relatedPost));
                    
                    return (
                      <Link
                        key={relatedPost._id}
                        to={`/blog/${relatedPost.slug}`}
                        className="group"
                      >
                        <article className="bg-gray-50 rounded-lg overflow-hidden group-hover:shadow-lg transition-all duration-300 border border-gray-200 group-hover:border-primary/30">
                          <div className="relative overflow-hidden">
                            <img
                              src={relatedImage}
                              alt={relatedTitle}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {relatedTitle}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                              {relatedExcerpt}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatBlogDate(relatedPost.publishedAt, 'short')}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{relatedReadingTime}m</span>
                                </div>
                              </div>
                              <span className="text-primary group-hover:text-primary/80 font-medium">
                                Read →
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-secondary to-secondary/90 text-white py-16 mt-12">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Never Miss an Update
            </h2>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Subscribe to our newsletter and get the latest mining industry insights, 
              equipment reviews, and expert analysis delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
              <button className="bg-primary text-secondary px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                Subscribe
              </button>
            </div>
            <p className="text-sm text-gray-300 mt-4">
              Join our community of mining professionals. No spam, unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;