'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [friends, setFriends] = useState(15);
  const [tasks, setTasks] = useState(10);
  const [income, setIncome] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [currentUrl, setCurrentUrl] = useState('https://community.novairasolution.com');
  const [user, setUser] = useState<{ name: string; tier: string } | null>(null);

  const ACCOUNTS_URL = 'https://accounts.novairasolution.com';

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
          setUser({ name: data.user.first_name, tier: data.user.user_type });
        }
      } catch (err) {
        // Fallback for demo
        // setUser({ name: 'Admin', tier: 'Diamond' });
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const total = Math.floor(friends * tasks * 1.5 * 30);
    setIncome(total);
  }, [friends, tasks]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

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

  const loginUrl = `${ACCOUNTS_URL}/?redirect=${encodeURIComponent(currentUrl)}`;
  const registerUrl = `${ACCOUNTS_URL}/?registration=individual&redirect=${encodeURIComponent(currentUrl)}`;
  const logoutUrl = `${ACCOUNTS_URL}/logout.php?redirect=${encodeURIComponent(currentUrl)}`;

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
            <input type="text" placeholder="Search forum" />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle Theme">
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          {user ? (
            <div className={styles.headerAvatar} title={user.name}>{user.name.charAt(0)}</div>
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
              <a href="#" className={`${styles.navItem} ${styles.active}`} onClick={() => setMobileMenuOpen(false)}>
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
              <a href="#" className={styles.navItem} onClick={() => setMobileMenuOpen(false)}>
                <span className={styles.tagDot} style={{background: '#d71921'}}></span> Newsroom
              </a>
              <a href="#" className={styles.navItem} onClick={() => setMobileMenuOpen(false)}>
                <span className={styles.tagDot} style={{background: '#0070f3'}}></span> Gamification Hub
              </a>
              <a href="#" className={styles.navItem} onClick={() => setMobileMenuOpen(false)}>
                <span className={styles.tagDot} style={{background: '#10b981'}}></span> VIP Tiers
              </a>
              <a href="#" className={styles.navItem} onClick={() => setMobileMenuOpen(false)}>
                <span className={styles.tagDot} style={{background: '#f5a623'}}></span> My Squad
              </a>
              <a href="#" className={styles.navItem} onClick={() => setMobileMenuOpen(false)}>
                <span className={styles.tagDot} style={{background: '#666666'}}></span> Everything Else
              </a>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA (Discussions) */}
        <main className={styles.content}>
          <div className={styles.contentHeader}>
            <h1>Gamification Hub</h1>
          </div>

          {/* Gamification Interactive Block styled as a Flarum post/box */}
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
                <div className={styles.monoText} style={{fontSize: '2rem', marginTop: '0.5rem'}}>₹{income.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className={styles.discussionList}>
            {/* Thread 1: Squad Challenge */}
            <div className={styles.discussion}>
              <div className={styles.discussionAvatar}>N</div>
              <div className={styles.discussionBody}>
                <h3 className={styles.discussionTitle}>Weekly Squad Challenge: Earn 20% Multiplier!</h3>
                <div className={styles.discussionMeta}>
                  <span className={styles.tagPill}><span className={styles.tagDotSmall} style={{background: '#f5a623'}}></span> My Squad</span>
                  <span>NovairaAdmin started 2 days ago</span>
                </div>
                <div className={styles.discussionStats}>
                  <span><i className="far fa-comment"></i> 142</span>
                  <span><i className="far fa-eye"></i> 4.2k</span>
                </div>
              </div>
            </div>

            {/* Thread 2: Bronze Tier Info */}
            <div className={styles.discussion}>
              <div className={styles.discussionAvatar} style={{background: '#cd7f32', color: '#fff'}}>B</div>
              <div className={styles.discussionBody}>
                <h3 className={styles.discussionTitle}>Bronze Tier Guide: Standard Payouts (72h) & Benefits</h3>
                <div className={styles.discussionMeta}>
                  <span className={styles.tagPill}><span className={styles.tagDotSmall} style={{background: '#10b981'}}></span> VIP Tiers</span>
                  <span>System started 5 days ago</span>
                </div>
                <div className={styles.discussionStats}>
                  <span><i className="far fa-comment"></i> 89</span>
                  <span><i className="far fa-eye"></i> 1.2k</span>
                </div>
              </div>
            </div>

            {/* Thread 3: Diamond Tier Info */}
            <div className={styles.discussion}>
              <div className={styles.discussionAvatar} style={{background: '#b9f2ff', color: '#000'}}>D</div>
              <div className={styles.discussionBody}>
                <h3 className={styles.discussionTitle}>Diamond Status Requirements: Direct CEO Access</h3>
                <div className={styles.discussionMeta}>
                  <span className={styles.tagPill}><span className={styles.tagDotSmall} style={{background: '#10b981'}}></span> VIP Tiers</span>
                  <span className={styles.tagPill}><span className={styles.tagDotSmall} style={{background: '#d71921'}}></span> Newsroom</span>
                  <span>NovairaAdmin started 1 week ago</span>
                </div>
                <div className={styles.discussionStats}>
                  <span><i className="far fa-comment"></i> 412</span>
                  <span><i className="far fa-eye"></i> 12.8k</span>
                </div>
              </div>
            </div>
            
            {/* Thread 4: Rules */}
            <div className={styles.discussion}>
              <div className={styles.discussionAvatar}><i className="fas fa-bullhorn"></i></div>
              <div className={styles.discussionBody}>
                <h3 className={styles.discussionTitle}>Community Rules & Code of Conduct</h3>
                <div className={styles.discussionMeta}>
                  <span className={styles.tagPill}><span className={styles.tagDotSmall} style={{background: '#d71921'}}></span> Newsroom</span>
                  <span>NovairaAdmin started 1 month ago</span>
                </div>
                <div className={styles.discussionStats}>
                  <span><i className="far fa-comment"></i> 0</span>
                  <span><i className="far fa-eye"></i> 25.1k</span>
                </div>
              </div>
            </div>

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
