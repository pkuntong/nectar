import React from 'react';

interface BlogPageProps {
  onClose: () => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onClose }) => {
  const blogPosts = [
    {
      id: 1,
      title: "10 Side Hustles You Can Start This Weekend",
      excerpt: "Discover quick-start opportunities that require minimal investment and can generate income in just days.",
      date: "November 2, 2025",
      category: "Getting Started",
      readTime: "5 min read",
      image: "📱"
    },
    {
      id: 2,
      title: "How AI is Revolutionizing Side Hustles in 2025",
      excerpt: "Learn how artificial intelligence tools are making it easier than ever to automate and scale your side business.",
      date: "October 28, 2025",
      category: "Technology",
      readTime: "7 min read",
      image: "🤖"
    },
    {
      id: 3,
      title: "From $0 to $5K: A Real Success Story",
      excerpt: "Meet Sarah, who turned freelance writing into a thriving business using Nectar Forge's personalized recommendations.",
      date: "October 25, 2025",
      category: "Success Stories",
      readTime: "6 min read",
      image: "💰"
    },
    {
      id: 4,
      title: "Tax Tips for Side Hustlers",
      excerpt: "Essential tax strategies every side hustler should know before filing season.",
      date: "October 20, 2025",
      category: "Finance",
      readTime: "8 min read",
      image: "📊"
    },
    {
      id: 5,
      title: "Building Passive Income Streams That Actually Work",
      excerpt: "Cut through the hype and discover legitimate passive income opportunities backed by real data.",
      date: "October 15, 2025",
      category: "Strategy",
      readTime: "10 min read",
      image: "🌊"
    },
    {
      id: 6,
      title: "The Psychology of Hustle: Staying Motivated",
      excerpt: "Science-backed strategies to maintain momentum and avoid burnout while building your side business.",
      date: "October 10, 2025",
      category: "Mindset",
      readTime: "6 min read",
      image: "🧠"
    }
  ];

  return (
    <div className="fixed inset-0 bg-dark-bg z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-dark-card border-b border-dark-card-border sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-light-text">Nectar Forge Blog</h1>
            <button
              onClick={onClose}
              className="text-medium-text hover:text-light-text transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-b from-brand-orange/10 to-transparent border-b border-dark-card-border">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-bold text-light-text mb-4">
                Insights, Stories & Tips for Modern Hustlers
              </h2>
              <p className="text-xl text-medium-text">
                Learn from real success stories, get expert advice, and discover the latest trends in the side hustle economy.
              </p>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-dark-card border border-dark-card-border rounded-lg overflow-hidden hover:border-brand-orange transition-colors cursor-pointer group"
              >
                <div className="p-6">
                  <div className="text-5xl mb-4">{post.image}</div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-brand-orange uppercase tracking-wide">
                      {post.category}
                    </span>
                    <span className="text-xs text-medium-text">•</span>
                    <span className="text-xs text-medium-text">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-light-text mb-3 group-hover:text-brand-orange transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-medium-text mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-medium-text">
                    <span>{post.date}</span>
                    <span className="text-brand-orange-light group-hover:underline">
                      Read more →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-16 bg-dark-card border border-dark-card-border rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">🚧</div>
            <h3 className="text-2xl font-bold text-light-text mb-3">More Articles Coming Soon!</h3>
            <p className="text-medium-text mb-6 max-w-2xl mx-auto">
              We're working on bringing you more valuable content about side hustles, entrepreneurship, and building multiple income streams. Check back soon for new articles!
            </p>
            <button
              onClick={onClose}
              className="bg-brand-orange text-white font-bold py-3 px-6 rounded-md hover:opacity-90 transition-opacity"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-dark-card border-t border-dark-card-border">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-light-text mb-3">
                Stay Updated
              </h3>
              <p className="text-medium-text mb-6">
                Get the latest side hustle insights, success stories, and opportunities delivered to your inbox weekly.
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                />
                <button className="bg-brand-orange text-white font-bold py-3 px-6 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-medium-text mt-3">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
