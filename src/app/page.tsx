'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

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
  replies?: number;
}

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Header States
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentUrl, setCurrentUrl] = useState('https://community.novairasolution.com');
  const [user, setUser] = useState<{ id: string | number; name: string; tier: string } | null>(null);

  // Live Database States
  const [threads, setThreads] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Deep View State
  const [activePost, setActivePost] = useState<Discussion | null>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('Newsroom');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = 'https://accounts.novairasolution.com/api/discussions.php';
  const ACCOUNTS_URL = 'https://accounts.novairasolution.com';
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUrl(window.location.href);

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

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
    fetchDiscussions();

    // Close dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      }
    } catch (err) {
      console.error("Failed to connect to discussions API", err);
    }
    // Artificial delay to show off the skeleton loader
    setTimeout(() => setIsLoading(false), 800);
  };

  const submitDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
        setNewTitle(''); setNewContent(''); setIsModalOpen(false);
        fetchDiscussions();
      } else {
        alert("Failed to post: " + data.message);
      }
    } catch (err) {
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
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#121212' : '#ffffff');
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

  const getTagColor = (tagName: string) => {
    if (tagName === 'Newsroom') return '#00b84c'; // Deep Green
    if (tagName === 'VIP Tiers') return '#f5a623'; // Orange
    if (tagName === 'My Squad') return '#0070f3'; // Blue
    return '#8b5cf6'; // Purple
  };

  const filteredThreads = threads.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    thread.tags.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.app}>
      
      {/* HEADER (Deep Green Theme) */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          <div className={styles.logo} onClick={() => { setActivePost(null); setSearchQuery(''); }} style={{cursor: 'pointer'}}>
            Novaira <span className={styles.logoDot}>Community</span>
          </div>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search forum..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle Theme">
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          
          {user ? (
            <>
              {/* Notification Bell */}
              <div className={styles.notificationWrapper} ref={notifRef}>
                <i className={`fas fa-bell ${styles.bellIcon}`} onClick={() => setNotifOpen(!notifOpen)}></i>
                <div className={styles.bellBadge}>2</div>
                
                {notifOpen && (
                  <div className={styles.notificationMenu}>
                    <div className={styles.notifHeader}>System Alerts</div>
                    <div className={styles.notifItem}>
                      <div className={styles.notifTitle}>Welcome to Novaira Community!</div>
                      <div className={styles.notifTime}>Just now</div>
                    </div>
                    <div className={styles.notifItem}>
                      <div className={styles.notifTitle}>Explore the Deep Green Update 🌿</div>
                      <div className={styles.notifTime}>10 mins ago</div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className={styles.userDropdownWrapper} ref={dropdownRef}>
                <div className={styles.headerAvatar} title={user.name} onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <h4>{user.name}</h4>
                      <div style={{ fontSize: 'clamp(0.55rem, 4vw, 0.75rem)', color: 'var(--text-muted)', marginBottom: '0.25rem', whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
                        UID: {user.id}
                      </div>
                      <span>{user.tier} Account</span>
                    </div>
                    <a href="#" className={styles.dropdownItem}><i className="far fa-user"></i> My Profile</a>
                    <a href="#" className={styles.dropdownItem}><i className="fas fa-cog"></i> Settings</a>
                    <div className={styles.dropdownDivider}></div>
                    <a href={logoutUrl} className={styles.dropdownItem} style={{color: 'var(--brand-green)'}}>
                      <i className="fas fa-sign-out-alt"></i> Log Out
                    </a>
                  </div>
                )}
              </div>
            </>
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
            if (!user) { window.location.href = loginUrl; return; }
            setIsModalOpen(true); setMobileMenuOpen(false);
          }}>
            <i className="fas fa-edit"></i> Start a Discussion
          </button>

          <div className={styles.navGroup}>
            <div className={styles.navMenu}>
              <a onClick={() => { setActivePost(null); setSearchQuery(''); setMobileMenuOpen(false); }} className={`${styles.navItem} ${!searchQuery && !activePost ? styles.active : ''}`}>
                <i className={`far fa-comments ${styles.navIcon}`}></i> All Discussions
              </a>
            </div>
          </div>

          <div className={styles.navGroup}>
            <div className={styles.navGroupTitle}>Tags</div>
            <div className={styles.navMenu}>
              <a onClick={() => { setActivePost(null); setSearchQuery('Newsroom'); setMobileMenuOpen(false); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#00b84c'}}></span> Newsroom
              </a>
              <a onClick={() => { setActivePost(null); setSearchQuery('VIP Tiers'); setMobileMenuOpen(false); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#f5a623'}}></span> VIP Tiers
              </a>
              <a onClick={() => { setActivePost(null); setSearchQuery('My Squad'); setMobileMenuOpen(false); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#0070f3'}}></span> My Squad
              </a>
              <a onClick={() => { setActivePost(null); setSearchQuery('General'); setMobileMenuOpen(false); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#8b5cf6'}}></span> General
              </a>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className={styles.content}>
          {activePost ? (
            
            /* ================= DEEP VIEW (POST DETAILS) ================= */
            <div className={styles.deepViewContainer}>
              <button className={styles.btnBack} onClick={() => setActivePost(null)}>
                <i className="fas fa-arrow-left"></i> Back to Feed
              </button>
              
              <div className={styles.deepHeader}>
                <div className={styles.deepAvatar}>
                  {activePost.first_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className={styles.deepTitle}>{activePost.title}</h1>
                  <div className={styles.discussionMeta} style={{marginBottom: '1rem'}}>
                    <span className={styles.tagPill}><span className={styles.tagDotSmall} style={{color: getTagColor(activePost.tags)}}></span> {activePost.tags}</span>
                    <span>By <strong>{activePost.first_name}</strong> ({activePost.user_type})</span>
                    <span>{new Date(activePost.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.deepContent}>
                {activePost.content}
              </div>
              
              {/* COMMENTS SECTION */}
              <div className={styles.commentsSection}>
                <h3>Discussion (2)</h3>
                
                <form className={styles.commentForm} onSubmit={(e) => { e.preventDefault(); alert("Comment posted successfully!"); }}>
                  <textarea className={styles.commentInput} placeholder="Write a reply..."></textarea>
                  <button type="submit" className={styles.btnComment}>Reply</button>
                </form>
                
                <div className={styles.commentList}>
                  <div className={styles.comment}>
                    <div className={styles.commentAvatar}>A</div>
                    <div className={styles.commentBody}>
                      <h4>Admin <span style={{fontSize:'0.75rem', color:'var(--text-muted)', marginLeft:'0.5rem'}}>1 hr ago</span></h4>
                      <p>Welcome to the Novaira Next-Gen platform. This looks incredible!</p>
                    </div>
                  </div>
                  <div className={styles.comment}>
                    <div className={styles.commentAvatar} style={{background: '#00b84c'}}>S</div>
                    <div className={styles.commentBody}>
                      <h4>System <span style={{fontSize:'0.75rem', color:'var(--text-muted)', marginLeft:'0.5rem'}}>30 mins ago</span></h4>
                      <p>All database connections are secure and live fetching is fully operational.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            
            /* ================= LIVE FEED ================= */
            <>
              <div className={styles.contentHeader}>
                <h1>{searchQuery ? `Results for "${searchQuery}"` : 'Live Feed'}</h1>
                <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}><i className="fas fa-broadcast-tower" style={{color: 'var(--brand-green)'}}></i> Online</div>
              </div>

              <div className={styles.discussionList}>
                {isLoading ? (
                  // SKELETON LOADERS
                  <>
                    {[1, 2, 3].map(i => (
                      <div key={i} className={styles.skeletonCard}>
                        <div className={styles.skeletonAvatar}></div>
                        <div className={styles.skeletonBody}>
                          <div className={styles.skeletonLine}></div>
                          <div className={`${styles.skeletonLine} ${styles.medium}`}></div>
                          <div className={`${styles.skeletonLine} ${styles.short}`}></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : filteredThreads.length > 0 ? (
                  filteredThreads.map(thread => (
                    <div key={thread.id} className={styles.discussion} onClick={() => setActivePost(thread)}>
                      <div className={styles.discussionAvatar}>
                        {thread.first_name ? thread.first_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className={styles.discussionBody}>
                        <h3 className={styles.discussionTitle}>{thread.title}</h3>
                        <div className={styles.discussionMeta}>
                          <span className={styles.tagPill}>
                            <span className={styles.tagDotSmall} style={{color: getTagColor(thread.tags)}}></span> {thread.tags}
                          </span>
                          <span>By <strong>{thread.first_name}</strong></span>
                          <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className={styles.discussionContentPreview}>{thread.content}</div>
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
            </>
          )}
        </main>
      </div>

      {/* START DISCUSSION MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create Post</h2>
              <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={submitDiscussion}>
              <div className={styles.modalInputGroup}>
                <label>Discussion Title</label>
                <input type="text" className={styles.modalInput} placeholder="What's on your mind?" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required maxLength={100} />
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
                <textarea className={styles.modalTextarea} placeholder="Type your message here..." value={newContent} onChange={(e) => setNewContent(e.target.value)} required></textarea>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Posting...</> : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div><a href="#">Privacy Policy</a><a href="#">Terms of Use</a><a href="#">Refund Policy</a></div>
        <div style={{marginTop: '1.5rem', opacity: 0.7}}>&copy; {new Date().getFullYear()} Novaira Global.</div>
      </footer>
    </div>
  );
}
