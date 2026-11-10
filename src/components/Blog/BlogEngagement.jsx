// Likes/dislikes, sharing and reader comments shown under a blog article's tags.
import React, { useCallback, useEffect, useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Mail,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatBlogDate, generateShareUrls, getBlogTitle } from '../../utils/blogUtils';

const MAX_COMMENT_LENGTH = 2000;
const VISITOR_KEY = 'blogVisitorId';

// A random ID per browser so guests get one like/dislike per article.
const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.3 11.3 0 0 0 12.05.7C5.79.7.7 5.79.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.3l5.72-1.5a11.33 11.33 0 0 0 5.73 1.46h.01c6.25 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.02" />
  </svg>
);

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

const BlogEngagement = ({ post }) => {
  const slug = post?.slug;
  const { isAuthenticated, user } = useAuth();

  // Reactions
  const [reactions, setReactions] = useState({ likes: 0, dislikes: 0, myReaction: null });
  const [reacting, setReacting] = useState(false);
  const [reactionError, setReactionError] = useState('');

  // Sharing
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // Comments
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', content: '', website: '' });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text }

  const loadEngagement = useCallback(async () => {
    if (!slug) return;
    const path = `/blog/posts/${encodeURIComponent(slug)}`;

    setCommentsLoading(true);
    const [commentsResult, reactionsResult] = await Promise.allSettled([
      api.get(`${path}/comments`),
      api.get(`${path}/reactions`, { params: { visitorId: getVisitorId() } })
    ]);

    if (commentsResult.status === 'fulfilled') {
      setComments(commentsResult.value.data?.comments || []);
    }
    if (reactionsResult.status === 'fulfilled') {
      setReactions(reactionsResult.value.data);
    }
    setCommentsLoading(false);
  }, [slug]);

  useEffect(() => {
    loadEngagement();
  }, [loadEngagement]);

  const handleReaction = async (type) => {
    if (reacting) return;
    const next = reactions.myReaction === type ? 'none' : type;
    const visitorId = getVisitorId();
    if (!visitorId && !isAuthenticated) {
      setReactionError('Please enable cookies/storage or sign in to react.');
      return;
    }

    setReacting(true);
    setReactionError('');
    try {
      const { data } = await api.post(`/blog/posts/${encodeURIComponent(slug)}/reactions`, {
        type: next,
        visitorId
      });
      setReactions(data);
    } catch (error) {
      setReactionError(errorMessage(error, 'Could not save your reaction. Please try again.'));
    } finally {
      setReacting(false);
    }
  };

  const shareUrl = `${window.location.origin}/blog/${slug}`;
  const shareUrls = generateShareUrls(post);

  const handleShare = async (platform) => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        window.prompt('Copy this link:', shareUrl);
      }
      return;
    }

    if (platform === 'native') {
      try {
        await navigator.share({ title: getBlogTitle(post), url: shareUrl });
      } catch {
        // User closed the share sheet
      }
      return;
    }

    if (platform === 'email') {
      window.location.href = shareUrls.email;
      return;
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const content = form.content.trim();
    if (content.length < 2) {
      setNotice({ type: 'error', text: 'Please write a comment.' });
      return;
    }
    if (!isAuthenticated && (!form.name.trim() || !form.email.trim())) {
      setNotice({ type: 'error', text: 'Please enter your name and email.' });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const payload = isAuthenticated
        ? { content, website: form.website }
        : { name: form.name.trim(), email: form.email.trim(), content, website: form.website };

      const { data } = await api.post(`/blog/posts/${encodeURIComponent(slug)}/comments`, payload);

      if (data.status === 'approved' && data.comment) {
        setComments((prev) => [...prev, data.comment]);
      }
      setNotice({ type: 'success', text: data.message || 'Thanks for your comment!' });
      setForm((prev) => ({ ...prev, content: '' }));
    } catch (error) {
      setNotice({ type: 'error', text: errorMessage(error, 'Could not post your comment. Please try again.') });
    } finally {
      setSubmitting(false);
    }
  };

  if (!slug) return null;

  const reactionButton = (type, Icon, count, label, activeClasses) => {
    const active = reactions.myReaction === type;
    return (
      <button
        type="button"
        onClick={() => handleReaction(type)}
        disabled={reacting}
        aria-pressed={active}
        aria-label={`${label} (${count})`}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors disabled:opacity-60 ${
          active ? activeClasses : 'bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-secondary'
        }`}
      >
        <Icon className={`w-4 h-4 ${active ? 'fill-current' : ''}`} />
        <span>{count}</span>
      </button>
    );
  };

  const shareButtonClass =
    'p-2.5 rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary';

  return (
    <section
      aria-labelledby="blog-engagement-heading"
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8"
    >
      {/* Reactions and sharing */}
      <div className="p-6 lg:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 id="blog-engagement-heading" className="font-semibold text-gray-900 mb-3">
            Was this article helpful?
          </h2>
          <div className="flex items-center gap-3">
            {reactionButton('like', ThumbsUp, reactions.likes, 'Like', 'bg-primary border-primary text-secondary')}
            {reactionButton('dislike', ThumbsDown, reactions.dislikes, 'Dislike', 'bg-secondary border-secondary text-white')}
          </div>
          {reactionError && <p className="text-sm text-red-600 mt-2">{reactionError}</p>}
        </div>

        <div>
          <p className="font-semibold text-gray-900 mb-3">Share this article</p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => handleShare('facebook')} className={`${shareButtonClass} bg-blue-600 hover:bg-blue-700`} aria-label="Share on Facebook" title="Facebook">
              <Facebook className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => handleShare('twitter')} className={`${shareButtonClass} bg-gray-900 hover:bg-black`} aria-label="Share on X (Twitter)" title="X (Twitter)">
              <Twitter className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => handleShare('linkedin')} className={`${shareButtonClass} bg-blue-800 hover:bg-blue-900`} aria-label="Share on LinkedIn" title="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => handleShare('whatsapp')} className={`${shareButtonClass} bg-green-600 hover:bg-green-700`} aria-label="Share on WhatsApp" title="WhatsApp">
              <WhatsAppIcon className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => handleShare('email')} className={`${shareButtonClass} bg-gray-600 hover:bg-gray-700`} aria-label="Share by email" title="Email">
              <Mail className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleShare('copy')}
              className={`${shareButtonClass} ${copied ? 'bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
              aria-label={copied ? 'Link copied' : 'Copy link'}
              title={copied ? 'Copied!' : 'Copy link'}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            {canNativeShare && (
              <button type="button" onClick={() => handleShare('native')} className={`${shareButtonClass} bg-secondary hover:bg-secondary/90`} aria-label="More sharing options" title="More options">
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-bold text-gray-900">
            Comments {comments.length > 0 && <span className="text-gray-500 font-medium">({comments.length})</span>}
          </h2>
        </div>

        {commentsLoading ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-8">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading comments…</span>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 mb-8">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          <ul className="space-y-6 mb-10">
            {comments.map((comment) => (
              <li key={comment._id} className="flex gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
                    comment.isStaff ? 'bg-secondary text-white' : 'bg-primary/20 text-secondary'
                  }`}
                  aria-hidden="true"
                >
                  {initials(comment.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                    <span className="font-semibold text-gray-900">{comment.name}</span>
                    {comment.isStaff && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary text-secondary px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Mineazy
                      </span>
                    )}
                    <span className="text-xs text-gray-500" title={new Date(comment.createdAt).toLocaleString()}>
                      {formatBlogDate(comment.createdAt, 'relative')}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">{comment.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Comment form */}
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-5 lg:p-6" noValidate>
          <h3 className="font-semibold text-gray-900 mb-1">Leave a comment</h3>
          <p className="text-sm text-gray-500 mb-4">
            {isAuthenticated
              ? `Commenting as ${[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'your account'}.`
              : 'Your email address will not be published.'}{' '}
            Comments appear once approved by our team.
          </p>

          {!isAuthenticated && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="comment-name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  id="comment-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="comment-email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  id="comment-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Honeypot: hidden from people, filled in by spam bots */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
            <label htmlFor="comment-website">Website</label>
            <input id="comment-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={handleChange} />
          </div>

          <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
          <textarea
            id="comment-content"
            name="content"
            rows={4}
            maxLength={MAX_COMMENT_LENGTH}
            value={form.content}
            onChange={handleChange}
            required
            placeholder="Share your thoughts or ask a question…"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none resize-y"
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
            <span className="text-xs text-gray-500">{form.content.length}/{MAX_COMMENT_LENGTH}</span>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 bg-primary text-secondary px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{submitting ? 'Posting…' : 'Post Comment'}</span>
            </button>
          </div>

          {notice && (
            <p
              role={notice.type === 'error' ? 'alert' : 'status'}
              className={`mt-4 text-sm rounded-lg px-4 py-3 ${
                notice.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {notice.text}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default BlogEngagement;
