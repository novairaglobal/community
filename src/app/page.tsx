'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

// Centralized mock database for Discussion Threads
const initialThreads = [
  {
    id: 1,
    avatar: { letter: 'N', bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
    title: 'Weekly Squad Challenge: Earn 20% Multiplier!',
    tags: [{ name: 'My Squad', color: '#f5a623' }],
    author: 'NovairaAdmin',
    time: '2 days ago',
    replies: 142,
    views: '4.2k'
  },
  {
    id: 2,
    avatar: { letter: 'B', bg: '#cd7f32', color: '#fff' },
    title: 'Bronze Tier Guide: Standard Payouts (72h) & Benefits',
    tags: [{ name: 'VIP Tiers', color: '#10b981' }],
    author: 'System',
    time: '5 days ago',
    replies: 89,
    views: '1.2k'
  },
  {
    id: 3,
    avatar: { letter: 'D', bg: '#b9f2ff', color: '#000' },
    title: 'Diamond Status Requirements: Direct CEO Access',
    tags: [{ name: 'VIP Tiers', color: '#10b981' }, { name: 'Newsroom', color: '#d71921' }],
    author: 'NovairaAdmin',
    time: '1 week ago',
    replies: 412,
    views: '12.8k'
  },
  {
    id: 4,
    avatar: { icon: 'fas fa-bullhorn', bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
    title: 'Community Rules & Code of Conduct',
    tags: [{ name: 'Newsroom', color: '#d71921' }],
    author: 'NovairaAdmin',
    time: '1 month ago',
    replies: 0,
    views: '25.1k'
  }
];

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [friends, setFriends] = useState(15);
  const [tasks, setTasks] = useState(10);
  const [income, setIncome] = useState(0);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentUrl, setCurrentUrl] = useState('https://community.novairasolution.com');
  const [user, setUser] = useState<{ id: string | number; name: string; tier: string } | null>(null);

  const ACCOUNTS_URL = 'https://accounts.novairasolution.com';
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        }
      } catch (err) {
        // Fallback for demo
        setUser({ id: '100000', name: 'Admin', tier: 'Diamond' }); // Force logged in for demo of dropdown
      }
    };
    checkSession();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const total = Math.floor(friends * tasks * 1.5 * 30);
    setIncome(total);
  }, [friends, tasks]);

  // Sync mobile status bar color with the theme
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

  // Real-time Search Filtering
  const filteredThreads = initialThreads.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    thread.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={styles.app}>
      
      {/* HEADER (Flarum Clone) */}
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
              
              {/* Profile Floating Dropdown Menu */}
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <h4>{user.name}</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>UID: {user.id}</div>
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
        
        {/* Mobile Overlay */}
        <div className={`${styles.sidebarOverlay} ${mobileMenuOpen ? styles.open : ''}`} onClick={() => setMobileMenuOpen(false)}></div>

        {/* SIDEBAR (Flarum Tags Navigation) */}
        <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.open : ''}`}>
          <button className={styles.btnStartDiscussion} onClick={() => setMobileMenuOpen(false)}>
            <i className="fas fa-edit"></i> Start a Discussion
          </button>

          <div className={styles.navGroup}>
            <div className={styles.navMenu}>
              <a href="#" className={`${styles.navItem} ${styles.active}`} onClick={() => { setSearchQuery(''); setMobileMenuOpen(false); }}>
                <i className={`far fa-comments ${styles.navIcon}`}></i> All Discussions
              </a>
              <a href="#" className={styles.navItem} onClick={() => setMobileMenuOpen(false)}>
                <i className={`far fa-star ${styles.navIcon}`}></i> Following
              </a>
            </div>
          </div>

          <div className={styles.navGroup}>
            <div className={styles.navGroupTitle}>Tags</div>
            <div className={styles.navMenu}>
              <a href="#" className={styles.navItem} onClick={() => { setSearchQuery('Newsroom'); setMobileMenuOpen(false); }}>
                <span className={styles.tagDot} style={{background: '#d71921'}}></span> Newsroom
              </a>
              <a href="#" className={styles.navItem} onClick={() => { setSearchQuery('VIP Tiers'); setMobileMenuOpen(false); }}>
                <span className={styles.tagDot} style={{background: '#10b981'}}></span> VIP Tiers
              </a>
              <a href="#" className={styles.navItem} onClick={() => { setSearchQuery('My Squad'); setMobileMenuOpen(false); }}>
                <span className={styles.tagDot} style={{background: '#f5a623'}}></span> My Squad
              </a>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA (Discussions) */}
        <main className={styles.content}>
          <div className={styles.contentHeader}>
            <h1>{searchQuery ? `Search Results for "${searchQuery}"` : 'Gamification Hub'}</h1>
          </div>

          {/* Gamification Interactive Block - Only show if not heavily filtering */}
          {!searchQuery && (
            <div className={styles.feedBox}>
              <h2 className={styles.feedBoxTitle}>Income Simulator</h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 700}}>
                    <span>Active Referrals</span>
                    <span className={styles.monoText}>{friends}</span>
                  </div>
                  <input type="range" min="1" max="100" value={friends} onChange={(e) => setFriends(Number(e.target.value))} className={styles.slider} />
                </div>
                <div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 700}}>
                    <span>Daily Tasks Done</span>
                    <span className={styles.monoText}>{tasks}</span>
                  </div>
                  <input type="range" min="1" max="20" value={tasks} onChange={(e) => setTasks(Number(e.target.value))} className={styles.slider} />
                </div>
                <div style={{marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '4px', textAlign: 'center'}}>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px'}}>Estimated Monthly Payout</div>
                  <div className={styles.monoText} style={{fontSize: '2rem', marginTop: '0.5rem', color: 'var(--brand-red)'}}>₹{income.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.discussionList}>
            {filteredThreads.length > 0 ? (
              filteredThreads.map(thread => (
                <div key={thread.id} className={styles.discussion}>
                  <div className={styles.discussionAvatar} style={{background: thread.avatar.bg, color: thread.avatar.color}}>
                    {thread.avatar.icon ? <i className={thread.avatar.icon}></i> : thread.avatar.letter}
                  </div>
                  <div className={styles.discussionBody}>
                    <h3 className={styles.discussionTitle}>{thread.title}</h3>
                    <div className={styles.discussionMeta}>
                      {thread.tags.map((tag, idx) => (
                        <span key={idx} className={styles.tagPill}>
                          <span className={styles.tagDotSmall} style={{background: tag.color}}></span> {tag.name}
                        </span>
                      ))}
                      <span>{thread.author} started {thread.time}</span>
                    </div>
                    <div className={styles.discussionStats}>
                      <span><i className="far fa-comment"></i> {thread.replies}</span>
                      <span><i className="far fa-eye"></i> {thread.views}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <i className="fas fa-search"></i>
                <h2>No discussions found.</h2>
                <p>Try searching for different keywords or clear your filter.</p>
                <button className={styles.btnStartDiscussion} style={{maxWidth: '200px', margin: '2rem auto 0'}} onClick={() => setSearchQuery('')}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* FOOTER (Flarum Style) */}
      <footer className={styles.footer}>
        <div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="#">Refund Policy</a>
        </div>
        <div style={{marginTop: '1rem'}}>
          &copy; {new Date().getFullYear()} Novaira Global.
        </div>
      </footer>

    </div>
  );
}
