'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [friends, setFriends] = useState(15);
  const [tasks, setTasks] = useState(10);
  const [income, setIncome] = useState(0);
  
  // Loading State for Skeleton
  const [loading, setLoading] = useState(true);
  
  const [currentUrl, setCurrentUrl] = useState('https://community.novairasolution.com');
  const [user, setUser] = useState<{ name: string; tier: string } | null>(null);

  const ACCOUNTS_URL = 'https://accounts.novairasolution.com';

  useEffect(() => {
    setCurrentUrl(window.location.href);

    // Initial theme check
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set background RGB variables for glassmorphism
    if (savedTheme === 'dark') {
      document.documentElement.style.setProperty('--bg-primary-rgb', '5, 5, 5');
    } else {
      document.documentElement.style.setProperty('--bg-primary-rgb', '248, 250, 252');
    }

    // Check user session
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
      } finally {
        // Add a slight delay to demonstrate the super premium skeleton loader
        setTimeout(() => setLoading(false), 800);
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
    
    if (newTheme === 'dark') {
      document.documentElement.style.setProperty('--bg-primary-rgb', '5, 5, 5');
    } else {
      document.documentElement.style.setProperty('--bg-primary-rgb', '248, 250, 252');
    }
  };

  const loginUrl = `${ACCOUNTS_URL}/?redirect=${encodeURIComponent(currentUrl)}`;
  const registerUrl = `${ACCOUNTS_URL}/?registration=individual&redirect=${encodeURIComponent(currentUrl)}`;
  const logoutUrl = `${ACCOUNTS_URL}/logout.php?redirect=${encodeURIComponent(currentUrl)}`;

  return (
    <div className={styles.appContainer}>
      
      {/* 1. Global Glass Header */}
      <header className={styles.appHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>N</div>
            <span>Novaira <span className="dot-text text-secondary">Global</span></span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button onClick={toggleTheme} className={`${styles.themeToggle} hidden sm:flex`} aria-label="Toggle Theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {!loading && !user && (
            <>
              <a href={loginUrl} className={styles.btnLogin}>Login</a>
              <a href={registerUrl} className={styles.btnRegister}>Join the Elite</a>
            </>
          )}
        </div>
      </header>

      {/* 2. Strict Grid Main Layout */}
      <div className={styles.mainLayout}>
        
        {/* Desktop Sidebar */}
        <aside className={styles.sidebar}>
          
          {loading ? (
            <div className={styles.sidebarUserCard}>
              <div className={`${styles.skeleton} ${styles.skAvatar}`}></div>
              <div className={`${styles.skeleton} ${styles.skText}`}></div>
              <div className={`${styles.skeleton} ${styles.skTextShort}`}></div>
            </div>
          ) : user ? (
            <div className={styles.sidebarUserCard}>
              <div className={styles.sidebarAvatar}>{user.name.charAt(0)}</div>
              <div className={styles.sidebarUserName}>{user.name}</div>
              <div className={styles.sidebarUserTier}>{user.tier}</div>
              <a href={logoutUrl} className={styles.sidebarLogout}>Log Out</a>
            </div>
          ) : (
            <div className={styles.sidebarUserCard} style={{padding: '2rem 1rem'}}>
              <div style={{fontFamily: 'var(--font-dot)', marginBottom: '1rem'}}>Not Authenticated</div>
              <a href={loginUrl} className={styles.btnRegister} style={{width: '100%', display: 'block'}}>Login</a>
            </div>
          )}

          <div className={styles.sidebarLabel}>Platform</div>
          <nav style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <a href="#" className={`${styles.menuItem} ${styles.active}`}><i className={`fas fa-home ${styles.menuIcon}`}></i> Hub</a>
            <a href="#" className={styles.menuItem}><i className={`fas fa-tasks ${styles.menuIcon}`}></i> Tasks</a>
            <a href="#" className={styles.menuItem}><i className={`fas fa-users ${styles.menuIcon}`}></i> Squad</a>
            <a href="#" className={styles.menuItem}><i className={`fas fa-trophy ${styles.menuIcon}`}></i> Ranks</a>
          </nav>

          <div className={styles.sidebarLabel}>Resources</div>
          <nav style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <a href="https://novairasolution.com" className={styles.menuItem}><i className={`fas fa-globe ${styles.menuIcon}`}></i> Website</a>
            <a href="mailto:support@novairasolution.com" className={styles.menuItem}><i className={`fas fa-headset ${styles.menuIcon}`}></i> Support</a>
          </nav>
        </aside>

        {/* 3. Main Content Area */}
        <main className={styles.contentArea}>
          
          <header className={styles.hero}>
            <div className={styles.heroBadge}>
              <span className={styles.liveIndicator}></span> SEASON 1 IS LIVE
            </div>
            <h1 className={styles.heroTitle}>
              Maximum Growth.<br /><span>Zero Investment.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Welcome to the ultimate Novaira Global performance network. We've completely revolutionized affiliate growth by combining highly engaging daily tasks, squad-based gamification, and a transparent VIP tier system. Build your elite team today, dominate the weekly leaderboards, and unlock compounding passive income while you sleep.
            </p>
            
            <div className={styles.heroStats}>
              <div className={styles.statBox}>
                <div className={styles.statValue}>10K+</div>
                <div className={styles.statLabel}>Active Agents</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>₹50L+</div>
                <div className={styles.statLabel}>Total Payouts</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>24/7</div>
                <div className={styles.statLabel}>Support Access</div>
              </div>
            </div>

            <div className={styles.heroActions}>
              <button className={styles.btnPrimary}>Start Earning Now</button>
              <button className={styles.btnSecondary}>Read The Rules</button>
            </div>
          </header>

          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>VIP Tiers</h2>
            </header>
            
            <div className={styles.tiersGrid}>
              {loading ? (
                <>
                  <div className={`${styles.skeleton} ${styles.skCard}`}></div>
                  <div className={`${styles.skeleton} ${styles.skCard}`}></div>
                  <div className={`${styles.skeleton} ${styles.skCard}`}></div>
                </>
              ) : (
                <>
                  <div className={styles.tierCard}>
                    <h3 className={styles.tierName}>Bronze</h3>
                    <p className={styles.tierDesc}>Start your journey. Basic task access and standard community benefits.</p>
                    <div className="dot-text text-secondary">Standard Payouts</div>
                  </div>
                  <div className={styles.tierCard}>
                    <h3 className={styles.tierName}>Silver</h3>
                    <p className={styles.tierDesc}>Requires 5 Active Referrals. Unlock better tasks and exclusive support.</p>
                    <div className="dot-text text-secondary" style={{color: 'var(--tier-silver)'}}>+10% Task Bonus</div>
                  </div>
                  <div className={styles.tierCard}>
                    <h3 className={styles.tierName}>Gold</h3>
                    <p className={styles.tierDesc}>High-paying premium tasks. Requires 20 Active Referrals.</p>
                    <div className="dot-text text-secondary" style={{color: 'var(--tier-gold)'}}>Priority Payouts</div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Income Simulator</h2>
            </header>
            <div className={styles.calcBox}>
              <div>
                <label style={{display: 'block', fontWeight: 600, fontSize: '1.2rem'}}>Active Referrals</label>
                <input type="range" min="1" max="100" value={friends} onChange={(e) => setFriends(Number(e.target.value))} className={styles.slider} />
                <div className="dot-text" style={{fontSize: '1.5rem', marginBottom: '3rem'}}>{friends} Friends</div>

                <label style={{display: 'block', fontWeight: 600, fontSize: '1.2rem'}}>Daily Tasks Done</label>
                <input type="range" min="1" max="20" value={tasks} onChange={(e) => setTasks(Number(e.target.value))} className={styles.slider} />
                <div className="dot-text" style={{fontSize: '1.5rem'}}>{tasks} Tasks</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p className="dot-text text-secondary">Monthly Passive Income</p>
                <div className={styles.resultAmount}>₹{income.toLocaleString()}</div>
                <button className={styles.btnRegister} style={{marginTop: '2rem'}}>Start Earning</button>
              </div>
            </div>
          </section>

          {/* Premium Footer */}
          <footer className={styles.footer}>
            <div className={styles.footerGrid}>
              <div className={styles.footerCol}>
                <div className={styles.logo} style={{ marginBottom: '1.5rem' }}>
                  <div className={styles.logoIcon}>N</div>
                  <span>Novaira <span className="dot-text text-secondary">Global</span></span>
                </div>
                <p style={{color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '400px'}}>
                  A premier performance marketing agency scaling mobile apps from 0 to 1M+ users. Specializing in robust User Acquisition and profitable growth systems.
                </p>
              </div>
              <div className={styles.footerCol}>
                <h4>Platform</h4>
                <ul className={styles.footerLinks}>
                  <li><a href="#">Gamification Hub</a></li>
                  <li><a href="#">VIP Tiers</a></li>
                  <li><a href="#">Income Simulator</a></li>
                </ul>
              </div>
              <div className={styles.footerCol}>
                <h4>Contact</h4>
                <ul className={styles.footerLinks}>
                  <li><a href="mailto:support@novairasolution.com">support@novairasolution.com</a></li>
                  <li><a href="https://wa.me/919093815689">WhatsApp Support</a></li>
                </ul>
              </div>
            </div>
            <div className={styles.legalLinks}>
              <a href="#">Terms & Conditions</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Refund Policy</a>
              <span>&copy; {new Date().getFullYear()} Novaira Global. All rights reserved.</span>
            </div>
          </footer>

        </main>
      </div>

      {/* 4. Native Mobile Bottom Navigation (Visible only on mobile) */}
      <nav className={styles.bottomNav}>
        <a href="#" className={`${styles.bottomNavItem} ${styles.active}`}><i className="fas fa-home"></i><span>Hub</span></a>
        <a href="#" className={styles.bottomNavItem}><i className="fas fa-tasks"></i><span>Tasks</span></a>
        <a href="#" className={styles.bottomNavItem}><i className="fas fa-users"></i><span>Squad</span></a>
        <a href="#" className={styles.bottomNavItem} onClick={toggleTheme}>
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i><span>Theme</span>
        </a>
      </nav>

    </div>
  );
}
