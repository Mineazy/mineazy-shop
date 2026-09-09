import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Mineazy';
const BASE_URL = 'https://mineazy.co.zw';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;
const TWITTER_HANDLE = '@mineazy';

const Seo = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  jsonLd,
  noIndex = false,
  children
}) => {
  const siteTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} - Mining Equipment & Solutions Zimbabwe`;
  const siteDescription = description || 'Mineazy is Zimbabwe\'s trusted supplier of mining equipment, safety solutions, and industrial machinery. Premium quality, fast delivery across Zimbabwe.';
  const siteKeywords = keywords || 'mining equipment Zimbabwe, mining supplies, industrial machinery Zimbabwe, Mineazy, safety equipment, mining solutions';
  const url = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : BASE_URL);
  const image = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      {keywords && <meta name="keywords" content={siteKeywords} />}
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_ZW" />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}

      {children}
    </Helmet>
  );
};

export const ProductJsonLd = ({ product }) => {
  if (!product) return null;

  const effectivePrice = product.salePrice && product.salePrice < product.price
    ? product.salePrice
    : product.price;
  const image = product.images?.[0]
    ? (product.images[0].startsWith('http') ? product.images[0] : `${BASE_URL}${product.images[0]}`)
    : DEFAULT_OG_IMAGE;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || product.description?.substring(0, 160),
    sku: product.sku,
    image,
    offers: {
      '@type': 'Offer',
      price: effectivePrice,
      priceCurrency: 'USD',
      availability: product.inStock && product.stockQuantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${BASE_URL}/product/${product.slug || product._id}`
    },
    ...(product.category?.name && { category: product.category.name })
  };

  return <Seo jsonLd={jsonLd} />;
};

export const BlogPostJsonLd = ({ post }) => {
  if (!post) return null;

  const image = post.featuredImage
    ? (post.featuredImage.startsWith('http') ? post.featuredImage : `${BASE_URL}${post.featuredImage}`)
    : DEFAULT_OG_IMAGE;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.content?.substring(0, 160),
    image,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author
        ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'Mineazy'
        : 'Mineazy'
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`
    },
    ...(post.tags?.length > 0 && { keywords: post.tags.join(', ') })
  };

  return <Seo jsonLd={jsonLd} />;
};

export const OrganizationJsonLd = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Mining equipment and solutions provider in Zimbabwe',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+263-XXX-XXXX',
      contactType: 'sales',
      email: 'sales@mineazy.co.zw'
    }
  };

  return <Seo jsonLd={jsonLd} />;
};

export const LocalBusinessJsonLd = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    url: BASE_URL,
    description: 'Mining equipment and solutions provider in Zimbabwe',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZW'
    },
    currencyAccepted: 'USD'
  };

  return <Seo jsonLd={jsonLd} />;
};

export const BreadcrumbJsonLd = ({ items }) => {
  if (!items || items.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url || `${BASE_URL}${item.path}`
    }))
  };

  return <Seo jsonLd={jsonLd} />;
};

export default Seo;
