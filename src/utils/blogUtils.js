// src/utils/blogUtils.js - Updated for new backend structure

/**
 * Normalize blog response from API
 * Handles different response structures from the backend
 */
export const normalizeBlogResponse = (response) => {
  
  let posts = [];
  let pagination = null;
  
  // Handle response structure: { posts: [...], pagination: {...} }
  if (response.posts && Array.isArray(response.posts)) {
    posts = response.posts;
    pagination = response.pagination || null;
  }
  // Handle direct array response
  else if (Array.isArray(response)) {
    posts = response;
  }
  // Handle nested data structure
  else if (response.data) {
    if (response.data.posts) {
      posts = response.data.posts;
      pagination = response.data.pagination;
    } else if (Array.isArray(response.data)) {
      posts = response.data;
    }
  }
  
  return { posts: ensureBlogArray(posts), pagination };
};

/**
 * Ensure blog posts array is valid
 */
export const ensureBlogArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [];
};

/**
 * Get blog post title (handles different field names)
 */
export const getBlogTitle = (post) => {
  return post?.title || post?.name || 'Untitled Post';
};

/**
 * Get blog post content
 */
export const getBlogContent = (post) => {
  return post?.content || post?.body || '';
};

/**
 * Get blog post excerpt with fallback
 */
export const getBlogExcerpt = (post, maxLength = 150) => {
  if (!post) return 'Read this insightful article...';
  
  let excerpt = post.excerpt || post.desc || post.description || '';
  
  if (!excerpt && post.content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.content;
    excerpt = tempDiv.textContent || tempDiv.innerText || '';
  }
  
  if (!excerpt) {
    return 'Read this insightful article about mining industry developments...';
  }
  
  if (excerpt.length > maxLength) {
    excerpt = excerpt.substring(0, maxLength).trim();
    const lastSpaceIndex = excerpt.lastIndexOf(' ');
    if (lastSpaceIndex > maxLength * 0.8) {
      excerpt = excerpt.substring(0, lastSpaceIndex);
    }
    excerpt += '...';
  }
  
  return excerpt;
};

/**
 * Get blog post image URL with fallback
 */
export const getBlogImageUrl = (post, size = 'medium') => {
  if (!post) return getPlaceholderImage(size);
  
  let imageUrl = null;
  
  // Check different possible image field names
  if (post.featuredImage && typeof post.featuredImage === 'string') {
    imageUrl = post.featuredImage;
  } else if (post.image && Array.isArray(post.image) && post.image.length > 0) {
    imageUrl = post.image[0];
  } else if (post.image && typeof post.image === 'string') {
    imageUrl = post.image;
  } else if (post.thumbnail) {
    imageUrl = post.thumbnail;
  }
  
  if (imageUrl) {
    // Handle relative URLs
    if (imageUrl.startsWith('/uploads/')) {
      const baseUrl = 'https://mining-equipment-backend.onrender.com';
      imageUrl = `${baseUrl}${imageUrl}`;
    }
    
    // Handle Cloudinary transformations
    if (imageUrl.includes('cloudinary.com')) {
      const sizeMap = {
        thumbnail: 'w_300,h_200,c_fill',
        medium: 'w_600,h_400,c_fill',
        large: 'w_1200,h_800,c_fill'
      };
      const transformation = sizeMap[size] || sizeMap.medium;
      return imageUrl.replace('/upload/', `/upload/${transformation}/`);
    }
    
    return imageUrl;
  }
  
  return getPlaceholderImage(size);
};

/**
 * Get placeholder image URL
 */
export const getPlaceholderImage = (size = 'medium') => {
  const sizeMap = {
    thumbnail: '300x200',
    medium: '600x400',
    large: '1200x800'
  };
  const dimensions = sizeMap[size] || sizeMap.medium;
  return `/api/placeholder/${dimensions}`;
};

/**
 * Get blog author information
 */
export const getBlogAuthor = (post) => {
  if (!post?.author) return { name: 'Mineazy Team', firstName: 'Mineazy', lastName: 'Team' };
  
  if (typeof post.author === 'string') {
    return { name: post.author, firstName: post.author, lastName: '' };
  }
  
  const firstName = post.author.firstName || '';
  const lastName = post.author.lastName || '';
  const name = `${firstName} ${lastName}`.trim() || post.author.name || 'Unknown Author';
  
  return {
    name,
    firstName,
    lastName,
    email: post.author.email
  };
};

/**
 * Get blog category information
 */
export const getBlogCategory = (post) => {
  if (!post?.category) return null;
  
  if (typeof post.category === 'string') {
    return { name: post.category, slug: post.category.toLowerCase().replace(/\s+/g, '-') };
  }
  
  return {
    _id: post.category._id,
    name: post.category.name || 'Uncategorized',
    slug: post.category.slug || post.category.name?.toLowerCase().replace(/\s+/g, '-')
  };
};

/**
 * Format blog date
 */
export const formatBlogDate = (dateString, format = 'long') => {
  if (!dateString) return 'Recently published';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (format === 'relative') {
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    }
    
    if (format === 'short') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Recently published';
  }
};

/**
 * Calculate reading time
 */
export const calculateReadingTime = (content, wordsPerMinute = 200) => {
  if (!content) return 5;
  
  const textContent = content.replace(/<[^>]*>/g, ' ');
  const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, readingTime);
};

/**
 * Format view count
 */
export const formatViewCount = (count) => {
  if (!count || count === 0) return '0 views';
  if (count === 1) return '1 view';
  if (count < 1000) return `${count} views`;
  if (count < 1000000) {
    const k = Math.floor(count / 100) / 10;
    return `${k}K views`;
  }
  const m = Math.floor(count / 100000) / 10;
  return `${m}M views`;
};

/**
 * Get blog tags
 */
export const getBlogTags = (post) => {
  if (!post?.tags) return [];
  if (Array.isArray(post.tags)) return post.tags;
  if (typeof post.tags === 'string') return post.tags.split(',').map(t => t.trim());
  return [];
};

/**
 * Generate blog slug from title
 */
export const generateSlug = (title) => {
  if (!title) return 'untitled-post';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Get category color class
 */
export const getCategoryColor = (categoryName) => {
  if (!categoryName) return 'bg-gray-100 text-gray-800';
  
  const colorMap = {
    'Technology': 'bg-blue-100 text-blue-800',
    'Equipment': 'bg-green-100 text-green-800',
    'Safety': 'bg-red-100 text-red-800',
    'Processing': 'bg-purple-100 text-purple-800',
    'Industry News': 'bg-yellow-100 text-yellow-800',
    'Maintenance': 'bg-orange-100 text-orange-800',
    'Mining Operations': 'bg-indigo-100 text-indigo-800',
    'Regulations': 'bg-pink-100 text-pink-800'
  };
  
  return colorMap[categoryName] || 'bg-gray-100 text-gray-800';
};

/**
 * Generate social share URLs
 */
export const generateShareUrls = (post, baseUrl = window.location.origin) => {
  if (!post) return {};
  
  const url = `${baseUrl}/blog/${post.slug}`;
  const title = getBlogTitle(post);
  const description = getBlogExcerpt(post, 100);
  
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\nRead more: ${url}`)}`
  };
};

/**
 * Sort blog posts
 */
export const sortBlogPosts = (posts, sortBy = 'publishedAt', order = 'desc') => {
  if (!Array.isArray(posts)) return [];
  
  return [...posts].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'publishedAt':
      case 'createdAt':
      case 'updatedAt':
        valueA = new Date(a[sortBy] || 0);
        valueB = new Date(b[sortBy] || 0);
        break;
      
      case 'title':
      case 'name':
        valueA = getBlogTitle(a).toLowerCase();
        valueB = getBlogTitle(b).toLowerCase();
        break;
      
      case 'viewCount':
        valueA = parseInt(a.viewCount || 0);
        valueB = parseInt(b.viewCount || 0);
        break;
      
      case 'author':
        valueA = getBlogAuthor(a).name.toLowerCase();
        valueB = getBlogAuthor(b).name.toLowerCase();
        break;
      
      default:
        return 0;
    }
    
    if (valueA < valueB) return order === 'asc' ? -1 : 1;
    if (valueA > valueB) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filter blog posts
 */
export const filterBlogPosts = (posts, filters = {}) => {
  if (!Array.isArray(posts)) return [];
  
  return posts.filter(post => {
    if (filters.category) {
      const category = getBlogCategory(post);
      if (!category || category.slug !== filters.category) return false;
    }
    
    if (filters.tag) {
      const tags = getBlogTags(post);
      if (!tags.some(tag => tag.toLowerCase().includes(filters.tag.toLowerCase()))) {
        return false;
      }
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = [
        getBlogTitle(post),
        getBlogExcerpt(post),
        ...getBlogTags(post)
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) return false;
    }
    
    return true;
  });
};