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

interface Notification {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFS: Notification[] = [
  { id: 1, text: 'Welcome to Novaira Community! 🎉', time: 'Just now', read: false },
  { id: 2, text: 'Deep Green Update is now live 🌿', time: '5m ago', read: false },
  { id: 3, text: 'Your discussion received a reply', time: '1h ago', read: false },
  { id: 4, text: 'New member joined your squad', time: '3h ago', read: false },
  { id: 5, text: 'Novaira VIP Tier benefits updated', time: 'Yesterday', read: false },
];

export default function Home() {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('https://community.novairasolution.com');
  const [user, setUser] = useState<{ id: string | number; name: string; tier: string } | null>(null);
  const [threads, setThreads] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFS);

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
        if (data?.status === 'success') setUser({ id: data.user.id, name: data.user.first_name, tier: data.user.user_type });
        else setUser(null);
      } catch { setUser(null); }
    };
    checkSession();
    fetchDiscussions();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDiscussions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=fetch`, { credentials: 'include' });
      const data = await res.json();
      if (data?.status === 'success') setThreads(data.data);
    } catch { }
    setTimeout(() => setIsLoading(false), 600);
  };

  const toggleTheme = () => {
    const n = theme === 'dark' ? 'light' : 'dark';
    setTheme(n);
    document.documentElement.setAttribute('data-theme', n);
    localStorage.setItem('theme', n);
  };

  const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const openPost = (thread: Discussion) => {
    const hash = thread.post_hash || `post_${thread.id}aBcDeFgHiJkLmNo`;
    router.push(`/d/${hash}`);
  };

  const loginUrl = `${ACCOUNTS_URL}/?redirect=${encodeURIComponent(currentUrl)}`;
  const registerUrl = `${ACCOUNTS_URL}/?registration=individual&redirect=${encodeURIComponent(currentUrl)}`;
  const logoutUrl = `${ACCOUNTS_URL}/logout.php?redirect=${encodeURIComponent(currentUrl)}`;

  const getTagColor = (tag: string) => ({ Newsroom: '#00b84c', 'VIP Tiers': '#f5a623', 'My Squad': '#0070f3' } as Record<string, string>)[tag] || '#8b5cf6';

  const filteredThreads = threads.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.tags.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={styles.app}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          <div className={styles.logo} onClick={() => router.push('/')}>
            Novaira <span className={styles.logoDot}>Community</span>
          </div>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search discussions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
                <button className={styles.bellIcon} onClick={() => setNotifOpen(!notifOpen)}>
                  <i className="fas fa-bell"></i>
                </button>
                {unreadCount > 0 && <div className={styles.bellBadge}>{unreadCount}</div>}

                {notifOpen && (
                  <div className={styles.notificationMenu}>
                    <div className={styles.notifHeader}>
                      <span className={styles.notifHeaderTitle}>Notifications</span>
                      <a className={styles.notifHeaderLink} onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>Mark all read</a>
                    </div>
                    {notifications.filter(n => !n.read).length === 0 ? (
                      <div className={styles.notifEmpty}><i className="far fa-bell-slash"></i><br />All caught up!</div>
                    ) : (
                      notifications.filter(n => !n.read).slice(0, 5).map(n => (
                        <div key={n.id} className={styles.notifItem} onClick={() => markRead(n.id)}>
                          <div className={styles.notifDot}></div>
                          <div className={styles.notifContent}>
                            <div className={styles.notifTitle}>{n.text}</div>
                            <div className={styles.notifTime}>{n.time}</div>
                          </div>
                          <button className={styles.notifMarkRead} onClick={e => { e.stopPropagation(); markRead(n.id); }} title="Mark as read">
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))
                    )}
                    <a href="/notifications" className={styles.notifViewAll}>View all notifications →</a>
                  </div>
                )}
              </div>

              {/* User Pill */}
              <div className={styles.userDropdownWrapper} ref={dropdownRef}>
                <div className={`${styles.userPill} ${dropdownOpen ? styles.open : ''}`} onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className={styles.headerAvatar}>{user.name.charAt(0).toUpperCase()}</div>
                  <div className={styles.userPillName}>{user.name}</div>
                  <i className={`fas fa-chevron-down ${styles.userPillArrow}`}></i>
                </div>
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <h4>{user.name}</h4>
                      <span>UID: {user.id} · {user.tier}</span>
                    </div>
                    <a href="/profile" className={styles.dropdownItem}><i className="far fa-user"></i> My Profile</a>
                    <a href="/settings" className={styles.dropdownItem}><i className="fas fa-cog"></i> Settings</a>
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

      {/* MAIN */}
      <div className={styles.container}>
        <div className={`${styles.sidebarOverlay} ${mobileMenuOpen ? styles.open : ''}`} onClick={() => setMobileMenuOpen(false)}></div>

        <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.open : ''}`}>
          <button className={styles.btnStartDiscussion} disabled={isCreating} onClick={() => {
            if (!user) { window.location.href = loginUrl; return; }
            setIsCreating(true); router.push('/create');
          }}>
            {isCreating ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : <><i className="fas fa-edit"></i> Start Discussion</>}
          </button>

          <div className={styles.navGroup}>
            <div className={styles.navMenu}>
              <button onClick={() => setSearchQuery('')} className={`${styles.navItem} ${!searchQuery ? styles.active : ''}`}>
                <i className={`far fa-comments ${styles.navIcon}`}></i> All Discussions
              </button>
            </div>
          </div>

          <div className={styles.navGroup}>
            <div className={styles.navGroupTitle}>Tags</div>
            <div className={styles.navMenu}>
              {(['Newsroom', 'VIP Tiers', 'My Squad', 'General'] as const).map(tag => (
                <button key={tag} onClick={() => setSearchQuery(tag)} className={`${styles.navItem} ${searchQuery === tag ? styles.active : ''}`}>
                  <span className={styles.tagDot} style={{ background: getTagColor(tag) }}></span> {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className={styles.content}>
          <div className={styles.contentHeader}>
            <h1>{searchQuery ? `"${searchQuery}"` : 'Live Feed'}</h1>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <i className="fas fa-circle" style={{ color: '#22c55e', fontSize: '0.5rem', marginRight: '0.4rem' }}></i>Online
            </span>
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
            ) : filteredThreads.length > 0 ? (
              filteredThreads.map(thread => (
                <div key={thread.id} className={styles.discussion} onClick={() => openPost(thread)}>
                  <div className={styles.discussionAvatar}>{(thread.first_name || 'U').charAt(0).toUpperCase()}</div>
                  <div className={styles.discussionBody}>
                    <h3 className={styles.discussionTitle}>{thread.title}</h3>
                    <div className={styles.discussionMeta}>
                      <span className={styles.tagPill} style={{ background: `${getTagColor(thread.tags)}18`, color: getTagColor(thread.tags) }}>{thread.tags}</span>
                      <span>by <strong>{thread.first_name}</strong></span>
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
                <h2>No discussions found</h2>
                <p>Be the first to start a discussion!</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className={styles.footer}>
        <div><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Refund</a></div>
        <div style={{ marginTop: '0.75rem' }}>&copy; {new Date().getFullYear()} Novaira Global</div>
      </footer>
    </div>
  );
}
