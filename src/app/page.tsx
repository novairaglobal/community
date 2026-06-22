'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface Discussion {
  id: number; user_id: string; first_name: string; user_type: string;
  title: string; content: string; tags: string; post_hash?: string;
  views: number; created_at: string; replies?: number;
}

const INITIAL_NOTIFS = [
  { id: 1, text: 'Welcome to Novaira Community! 🎉', time: 'Just now', read: false },
  { id: 2, text: 'Deep Green Update is now live 🌿', time: '5m ago', read: false },
];

export default function Home() {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('https://community.novairasolution.com');
  const [user, setUser] = useState<{ id: string | number; name: string; tier: string } | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS);

  const API_URL = 'https://accounts.novairasolution.com/api/discussions.php';
  const ACCOUNTS_URL = 'https://accounts.novairasolution.com';
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    setCurrentUrl(window.location.href);
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const checkSession = async () => {
      try {
        const res = await fetch(`${ACCOUNTS_URL}/api/get_user.php`, { credentials: 'include' });
        const data = await res.json();
        if (data?.status === 'success') {
          setUser({ id: data.user.id, name: data.user.first_name, tier: data.user.user_type });
        }
      } catch { }
    };
    checkSession();

    const fetchDiscussions = async () => {
      try {
        const res = await fetch(`${API_URL}?action=fetch`, { credentials: 'include' });
        const data = await res.json();
        if (data?.status === 'success') setDiscussions(data.data);
      } catch { }
      setIsLoading(false);
    };
    fetchDiscussions();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const n = theme === 'dark' ? 'light' : 'dark';
    setTheme(n); document.documentElement.setAttribute('data-theme', n); localStorage.setItem('theme', n);
  };

  const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const loginUrl = `${ACCOUNTS_URL}/?redirect=${encodeURIComponent(currentUrl)}`;
  const registerUrl = `${ACCOUNTS_URL}/?registration=individual&redirect=${encodeURIComponent(currentUrl)}`;
  const logoutUrl = `${ACCOUNTS_URL}/logout.php?redirect=${encodeURIComponent(currentUrl)}`;
  const getTagColor = (tag: string) => ({ Newsroom: '#00b84c', 'VIP Tiers': '#f5a623', 'My Squad': '#0070f3' } as Record<string, string>)[tag] || '#8b5cf6';

  const filteredDiscussions = activeTag ? discussions.filter(d => d.tags.includes(activeTag)) : discussions;

  return (
    <div className={styles.app}>
      {/* ══ HEADER ══ */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(v => !v)}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          <div className={styles.logo} onClick={() => { setActiveTag(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Novaira <span className={styles.logoDot}>Community</span>
          </div>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search discussions..." />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button onClick={toggleTheme} className={styles.themeToggle}>
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          {user ? (
            <>
              {/* Notification Bell */}
              <div className={styles.notificationWrapper} ref={notifRef}>
                <button className={styles.bellIcon} onClick={() => setNotifOpen(v => !v)}>
                  <i className="fas fa-bell"></i>
                </button>
                {unreadCount > 0 && <div className={styles.bellBadge}>{unreadCount}</div>}
                {notifOpen && (
                  <div className={styles.notificationMenu}>
                    <div className={styles.notifHeader}>
                      <span className={styles.notifHeaderTitle}>Notifications</span>
                      <a className={styles.notifHeaderLink} onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>Mark all</a>
                    </div>
                    {notifications.filter(n => !n.read).length === 0
                      ? <div className={styles.notifEmpty}>All caught up! 🎉</div>
                      : notifications.filter(n => !n.read).slice(0, 5).map(n => (
                          <div key={n.id} className={styles.notifItem} onClick={() => markRead(n.id)}>
                            <div className={styles.notifDot}></div>
                            <div className={styles.notifContent}>
                              <div className={styles.notifTitle}>{n.text}</div>
                              <div className={styles.notifTime}>{n.time}</div>
                            </div>
                            <button className={styles.notifMarkRead} onClick={e => { e.stopPropagation(); markRead(n.id); }}><i className="fas fa-times"></i></button>
                          </div>
                        ))
                    }
                    <a href="/notifications" className={styles.notifViewAll}>View all notifications →</a>
                  </div>
                )}
              </div>

              {/* User Pill Dropdown */}
              <div className={styles.userDropdownWrapper} ref={dropdownRef}>
                <div className={`${styles.userPill} ${dropdownOpen ? styles.open : ''}`} onClick={() => setDropdownOpen(v => !v)}>
                  <div className={styles.headerAvatar}>{user.name.charAt(0).toUpperCase()}</div>
                  <div className={styles.userPillName}>{user.name}</div>
                  <i className={`fas fa-chevron-down ${styles.userPillArrow}`}></i>
                </div>
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <h4>{user.name}</h4>
                      <span>UID: {user.id}</span>
                    </div>
                    <a href="/profile" className={styles.dropdownItem}><i className="far fa-user"></i> My Profile</a>
                    <div className={styles.dropdownDivider}></div>
                    <a href={logoutUrl} className={styles.dropdownItem} style={{ color: 'var(--brand-green)' }}><i className="fas fa-sign-out-alt"></i> Log Out</a>
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

      {/* ══ 3-COLUMN MAIN CONTAINER ══ */}
      <div className={styles.container}>

        {/* 1. LEFT SIDEBAR */}
        <div className={`${styles.sidebarOverlay} ${mobileMenuOpen ? styles.open : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
        <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.open : ''}`}>
          <button className={styles.btnStartDiscussion} onClick={() => {
            if (!user) { window.location.href = loginUrl; return; }
            router.push('/create');
          }}>
            <i className="fas fa-edit"></i> Start Discussion
          </button>
          
          <div className={styles.navGroup}>
            <div className={styles.navMenu}>
              <button onClick={() => { setActiveTag(null); setMobileMenuOpen(false); }} className={`${styles.navItem} ${!activeTag ? styles.active : ''}`}>
                <i className={`far fa-comments ${styles.navIcon}`}></i> All Discussions
              </button>
            </div>
          </div>
          
          <div className={styles.navGroup}>
            <div className={styles.navGroupTitle}>Tags</div>
            <div className={styles.navMenu}>
              {['Newsroom', 'VIP Tiers', 'My Squad', 'General'].map(tag => (
                <button key={tag} onClick={() => { setActiveTag(tag); setMobileMenuOpen(false); }} className={`${styles.navItem} ${activeTag === tag ? styles.active : ''}`}>
                  <span className={styles.tagDot} style={{ background: getTagColor(tag) }}></span> {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 2. MIDDLE CONTENT (Feed) */}
        <main className={styles.content}>
          <div className={styles.contentHeader}>
            <h1>{activeTag ? `${activeTag} Discussions` : 'All Discussions'}</h1>
          </div>

          <div className={styles.discussionList}>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonAvatar}></div>
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine}></div>
                    <div className={`${styles.skeletonLine} ${styles.medium}`}></div>
                    <div className={`${styles.skeletonLine} ${styles.short}`}></div>
                  </div>
                </div>
              ))
            ) : filteredDiscussions.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="far fa-folder-open"></i>
                <h2>No discussions found</h2>
                <p>Be the first to start a conversation{activeTag ? ` in ${activeTag}` : ''}!</p>
              </div>
            ) : (
              filteredDiscussions.map((d) => {
                const targetHash = d.post_hash || `post_${d.id}aBcDeFgHiJkLmNo`;
                return (
                  <div key={d.id} className={styles.discussion} onClick={() => router.push(`/d/${targetHash}`)}>
                    <div className={styles.discussionAvatar}>{d.first_name.charAt(0).toUpperCase()}</div>
                    <div className={styles.discussionBody}>
                      <h3 className={styles.discussionTitle}>{d.title}</h3>
                      <div className={styles.discussionMeta}>
                        <span className={styles.tagPill} style={{ color: getTagColor(d.tags), background: `${getTagColor(d.tags)}18` }}>
                          <span className={styles.tagDotSmall} style={{ background: getTagColor(d.tags) }}></span> {d.tags}
                        </span>
                        <span>•</span>
                        <span>{d.first_name}</span>
                        <span>•</span>
                        <span>{new Date(d.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <p className={styles.discussionContentPreview}>{d.content}</p>
                      <div className={styles.discussionStats}>
                        <span><i className="far fa-eye"></i> {d.views} views</span>
                        <span><i className="far fa-comment"></i> {d.replies || 0} replies</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* 3. RIGHT SIDEBAR (Desktop Only Extra Content) */}
        <aside className={styles.rightSidebar}>
          
          {/* Top Contributors Widget */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetTitle}><i className="fas fa-trophy" style={{ color: '#f5a623' }}></i> Top Contributors</div>
            <div className={styles.widgetList}>
              <div className={styles.widgetItem}>
                <div className={`${styles.widgetItemAvatar} ${styles.user}`}>A</div>
                <div className={styles.widgetItemBody}>
                  <div className={styles.widgetItemTitle}>Aarav Sharma</div>
                  <div className={styles.widgetItemSub}>VIP Squad • 234 posts</div>
                </div>
              </div>
              <div className={styles.widgetItem}>
                <div className={`${styles.widgetItemAvatar} ${styles.user}`}>S</div>
                <div className={styles.widgetItemBody}>
                  <div className={styles.widgetItemTitle}>Sarah Khan</div>
                  <div className={styles.widgetItemSub}>Novaira Admin</div>
                </div>
              </div>
              <div className={styles.widgetItem}>
                <div className={`${styles.widgetItemAvatar} ${styles.user}`}>R</div>
                <div className={styles.widgetItemBody}>
                  <div className={styles.widgetItemTitle}>Rahul Dev</div>
                  <div className={styles.widgetItemSub}>General • 89 posts</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Discussions Widget */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetTitle}><i className="fas fa-fire" style={{ color: '#ff4d4f' }}></i> Trending Now</div>
            <div className={styles.widgetList}>
              <div className={styles.widgetItem}>
                <div className={styles.widgetItemAvatar}><i className="fas fa-hashtag"></i></div>
                <div className={styles.widgetItemBody}>
                  <div className={styles.widgetItemTitle}>Novaira Deep Green Update details</div>
                  <div className={styles.widgetItemSub}>1.2k views • Newsroom</div>
                </div>
              </div>
              <div className={styles.widgetItem}>
                <div className={styles.widgetItemAvatar}><i className="fas fa-hashtag"></i></div>
                <div className={styles.widgetItemBody}>
                  <div className={styles.widgetItemTitle}>Best practices for React 19</div>
                  <div className={styles.widgetItemSub}>850 views • My Squad</div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Stats Widget */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetTitle}><i className="fas fa-chart-line" style={{ color: 'var(--brand-green)' }}></i> Community Stats</div>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{discussions.length}</div>
                <div className={styles.statLabel}>Posts</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNum}>1.2k</div>
                <div className={styles.statLabel}>Members</div>
              </div>
              <div className={styles.statBox} style={{ gridColumn: 'span 2' }}>
                <div className={styles.statNum} style={{ color: 'var(--brand-green)' }}>142</div>
                <div className={styles.statLabel}>Online Now</div>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
