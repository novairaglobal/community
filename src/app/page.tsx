'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  post_hash?: string;
  replies?: number;
}

export default function Home() {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Header States
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation State
  const [isCreating, setIsCreating] = useState(false);
  
  const [currentUrl, setCurrentUrl] = useState('https://community.novairasolution.com');
  const [user, setUser] = useState<{ id: string | number; name: string; tier: string } | null>(null);

  // Live Database States
  const [threads, setThreads] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    setTimeout(() => setIsLoading(false), 800);
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

  const openPost = (thread: Discussion) => {
    const hash = thread.post_hash || `post_${thread.id}aBcDeFgHiJkLmNo`;
    router.push(`/d/${hash}`);
  };

  const loginUrl = `${ACCOUNTS_URL}/?redirect=${encodeURIComponent(currentUrl)}`;
  const registerUrl = `${ACCOUNTS_URL}/?registration=individual&redirect=${encodeURIComponent(currentUrl)}`;
  const logoutUrl = `${ACCOUNTS_URL}/logout.php?redirect=${encodeURIComponent(currentUrl)}`;

  const getTagColor = (tagName: string) => {
    if (tagName === 'Newsroom') return '#00b84c';
    if (tagName === 'VIP Tiers') return '#f5a623';
    if (tagName === 'My Squad') return '#0070f3';
    return '#8b5cf6';
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
          <div className={styles.logo} onClick={() => { setSearchQuery(''); router.push('/'); }} style={{cursor: 'pointer'}}>
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

              {/* User Dropdown Pill (Avatar + Name + Arrow) */}
              <div className={styles.userDropdownWrapper} ref={dropdownRef}>
                <div className={`${styles.userPill} ${dropdownOpen ? styles.open : ''}`} onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className={styles.headerAvatar} title={user.name}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.userPillName}>{user.name}</div>
                  <i className={`fas fa-chevron-down ${styles.userPillArrow}`}></i>
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
                    <a href="/profile" className={styles.dropdownItem}><i className="far fa-user"></i> My Profile</a>
                    <a href="/settings" className={styles.dropdownItem}><i className="fas fa-cog"></i> Settings</a>
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
            setIsCreating(true);
            router.push('/create');
          }} disabled={isCreating}>
            {isCreating ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : <><i className="fas fa-edit"></i> Start a Discussion</>}
          </button>

          <div className={styles.navGroup}>
            <div className={styles.navMenu}>
              <a onClick={() => { setSearchQuery(''); setMobileMenuOpen(false); router.push('/'); }} className={`${styles.navItem} ${!searchQuery ? styles.active : ''}`}>
                <i className={`far fa-comments ${styles.navIcon}`}></i> All Discussions
              </a>
            </div>
          </div>

          <div className={styles.navGroup}>
            <div className={styles.navGroupTitle}>Tags</div>
            <div className={styles.navMenu}>
              <a onClick={() => { setSearchQuery('Newsroom'); setMobileMenuOpen(false); router.push('/'); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#00b84c'}}></span> Newsroom
              </a>
              <a onClick={() => { setSearchQuery('VIP Tiers'); setMobileMenuOpen(false); router.push('/'); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#f5a623'}}></span> VIP Tiers
              </a>
              <a onClick={() => { setSearchQuery('My Squad'); setMobileMenuOpen(false); router.push('/'); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#0070f3'}}></span> My Squad
              </a>
              <a onClick={() => { setSearchQuery('General'); setMobileMenuOpen(false); router.push('/'); }} className={styles.navItem}>
                <span className={styles.tagDot} style={{background: '#8b5cf6'}}></span> General
              </a>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA (LIVE FEED) */}
        <main className={styles.content}>
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
                <div key={thread.id} className={styles.discussion} onClick={() => openPost(thread)}>
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
                   setIsCreating(true);
                   router.push('/create');
                }} disabled={isCreating}>
                  {isCreating ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : 'Start Discussion'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div><a href="#">Privacy Policy</a><a href="#">Terms of Use</a><a href="#">Refund Policy</a></div>
        <div style={{marginTop: '1.5rem', opacity: 0.7}}>&copy; {new Date().getFullYear()} Novaira Global.</div>
      </footer>
    </div>
  );
}
