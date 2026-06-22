'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

// TypeScript Interface for Live Discussions
interface Discussion {
  id: number;
  user_id: string;
  first_name: string;
  user_type: string;
  title: string;
  content: string;
  tags: string;
  views: number;
  created_at: string;
  replies?: number; // Placeholder for future reply system
}

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentUrl, setCurrentUrl] = useState('https://community.novairasolution.com');
  const [user, setUser] = useState<{ id: string | number; name: string; tier: string } | null>(null);

  // Live Database States
  const [threads, setThreads] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('Newsroom');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = 'https://accounts.novairasolution.com/api/discussions.php'; // The new PHP endpoint
  const ACCOUNTS_URL = 'https://accounts.novairasolution.com';
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUrl(window.location.href);

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 1. Check Session
    const checkSession = async () => {
      try {
        const res = await fetch(`${ACCOUNTS_URL}/api/get_user.php`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (data && data.status === 'success') {
          setUser({ id: data.user.id, name: data.user.first_name, tier: data.user.user_type });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setUser(null);
      }
    };
    checkSession();

    // 2. Fetch Live Discussions
    fetchDiscussions();

    // Close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch discussions from PHP Backend
  const fetchDiscussions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=fetch`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if (data && data.status === 'success') {
        setThreads(data.data);
      } else {
        console.error("Error fetching discussions:", data.message);
      }
    } catch (err) {
      console.error("Failed to connect to discussions API", err);
    }
    setIsLoading(false);
  };

  // Submit New Discussion
  const submitDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to post.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}?action=create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          user_id: user.id.toString(),
          first_name: user.name,
          user_type: user.tier,
          title: newTitle,
          tags: newTag,
          content: newContent
        })
      });
      const data = await res.json();
      
      if (data && data.status === 'success') {
        // Clear form and close modal
        setNewTitle('');
        setNewContent('');
        setIsModalOpen(false);
        // Refresh feed
        fetchDiscussions();
      } else {
        alert("Failed to post: " + data.message);
      }
    } catch (err) {
      console.error("Post error", err);
      alert("Network error while posting.");
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#161317' : '#ffffff');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const loginUrl = `${ACCOUNTS_URL}/?redirect=${encodeURIComponent(currentUrl)}`;
  const registerUrl = `${ACCOUNTS_URL}/?registration=individual&redirect=${encodeURIComponent(currentUrl)}`;
  const logoutUrl = `${ACCOUNTS_URL}/logout.php?redirect=${encodeURIComponent(currentUrl)}`;

  // Helper to map tags to colors
  const getTagColor = (tagName: string) => {
    if (tagName === 'Newsroom') return '#d71921';
    if (tagName === 'VIP Tiers') return '#10b981';
    if (tagName === 'My Squad') return '#f5a623';
    return '#0070f3';
  };

  // Real-time Search Filtering
  const filteredThreads = threads.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    thread.tags.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.app}>
      
      {/* HEADER (3D Glassmorphism) */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          <div className={styles.logo}>
            Novaira <span className={styles.logoDot}>Community</span>
          </div>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search forum..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle Theme">
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          {user ? (
            <div className={styles.userDropdownWrapper} ref={dropdownRef}>
              <div 
                className={styles.headerAvatar} 
                title={user.name}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.name.charAt(0)}
              </div>
              
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <h4>{user.name}</h4>
                    <div style={{ 
                      fontSize: 'clamp(0.55rem, 4vw, 0.75rem)', 
                      color: 'var(--text-muted)', 
                      marginBottom: '0.25rem',
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.5px'
                    }}>UID: {user.id}</div>
                    <span>{user.tier} Account</span>
                  </div>
                  <a href="#" className={styles.dropdownItem}><i className="far fa-user"></i> My Profile</a>
                  <a href="#" className={styles.dropdownItem}><i className="fas fa-cog"></i> Settings</a>
                  <div className={styles.dropdownDivider}></div>
                  <a href={logoutUrl} className={styles.dropdownItem} style={{color: 'var(--brand-red)'}}>
                    <i className="fas fa-sign-out-alt"></i> Log Out
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href={loginUrl} className={styles.btnLogin}>Log In</a>
              <a href={registerUrl} className={styles.btnSignup}>Sign Up</a>
            </>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className={styles.container}>
        
        <div className={`${styles.sidebarOverlay} ${mobileMenuOpen ? styles.open : ''}`} onClick={() => setMobileMenuOpen(false)}></div>

        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.open : ''}`}>
          <button className={styles.btnStartDiscussion} onClick={() => {
            if (!user) { alert('Please log in to start a discussion.'); window.location.href = loginUrl; return; }
            setIsModalOpen(true); 
            setMobileMenuOpen(false);
          }}>
            <i className="fas fa-edit"></i> Start a Discussion
          </button>

          <div className={styles.navGroup}>
            <div className={styles.navMenu}>
              <a onClick={() => { setSearchQuery(''); setMobileMenuOpen(false); }} className={`${styles.navItem} ${!searchQuery ? styles.active : ''}`}>
                <i className={`far fa-comments ${styles.navIcon}`}></i> All Discussions
              </a>
            </div>
          </div>

          <div className={styles.navGroup}>
            <div className={styles.navGroupTitle}>Tags</div>
            <div className={styles.navMenu}>
              <a onClick={() => { setSearchQuery('Newsroom'); setMobileMenuOpen(false); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#d71921'}}></span> Newsroom
              </a>
              <a onClick={() => { setSearchQuery('VIP Tiers'); setMobileMenuOpen(false); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#10b981'}}></span> VIP Tiers
              </a>
              <a onClick={() => { setSearchQuery('My Squad'); setMobileMenuOpen(false); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#f5a623'}}></span> My Squad
              </a>
              <a onClick={() => { setSearchQuery('General'); setMobileMenuOpen(false); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#0070f3'}}></span> General
              </a>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className={styles.content}>
          <div className={styles.contentHeader}>
            <h1>{searchQuery ? `Search Results for "${searchQuery}"` : 'Live Discussions'}</h1>
            <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}><i className="fas fa-rss"></i> Live Feed</div>
          </div>

          <div className={styles.discussionList}>
            {isLoading ? (
              <div className={styles.loader}>
                <i className="fas fa-circle-notch fa-spin"></i>
              </div>
            ) : filteredThreads.length > 0 ? (
              filteredThreads.map(thread => (
                <div key={thread.id} className={styles.discussion}>
                  <div className={styles.discussionAvatar}>
                    {thread.first_name ? thread.first_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className={styles.discussionBody}>
                    <h3 className={styles.discussionTitle}>{thread.title}</h3>
                    <div className={styles.discussionMeta}>
                      <span className={styles.tagPill}>
                        <span className={styles.tagDotSmall} style={{color: getTagColor(thread.tags)}}></span> {thread.tags}
                      </span>
                      <span>By <strong>{thread.first_name}</strong> ({thread.user_type})</span>
                      <span>• {new Date(thread.created_at).toLocaleDateString()}</span>
                    </div>
                    {/* Excerpt of content */}
                    <div className={styles.discussionContentPreview}>
                      {thread.content}
                    </div>
                    <div className={styles.discussionStats}>
                      <span><i className="far fa-comment"></i> {thread.replies || 0}</span>
                      <span><i className="far fa-eye"></i> {thread.views || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <i className="fas fa-satellite-dish"></i>
                <h2>No discussions found.</h2>
                <p>Be the first to start a discussion in this tag!</p>
                <button className={styles.btnStartDiscussion} style={{maxWidth: '200px', margin: '2rem auto 0'}} onClick={() => {
                   if (!user) { window.location.href = loginUrl; return; }
                   setNewTag(searchQuery || 'General'); 
                   setIsModalOpen(true); 
                }}>
                  Start Discussion
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* START DISCUSSION MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create Discussion</h2>
              <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={submitDiscussion}>
              <div className={styles.modalInputGroup}>
                <label>Discussion Title</label>
                <input 
                  type="text" 
                  className={styles.modalInput} 
                  placeholder="What's on your mind?" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  required 
                  maxLength={100}
                />
              </div>
              <div className={styles.modalInputGroup}>
                <label>Select Tag</label>
                <select className={styles.modalSelect} value={newTag} onChange={(e) => setNewTag(e.target.value)}>
                  <option value="Newsroom">Newsroom</option>
                  <option value="VIP Tiers">VIP Tiers</option>
                  <option value="My Squad">My Squad</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className={styles.modalInputGroup}>
                <label>Content</label>
                <textarea 
                  className={styles.modalTextarea} 
                  placeholder="Type your message here..." 
                  value={newContent} 
                  onChange={(e) => setNewContent(e.target.value)} 
                  required
                ></textarea>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Posting...</> : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="#">Refund Policy</a>
        </div>
        <div style={{marginTop: '1.5rem', opacity: 0.7}}>
          &copy; {new Date().getFullYear()} Novaira Global.
        </div>
      </footer>

    </div>
  );
}
