'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [friends, setFriends] = useState(10);
  const [tasks, setTasks] = useState(5);
  const [income, setIncome] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('https://community.novairasolution.com');
  
  // User Session State
  const [user, setUser] = useState<{ name: string; tier: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Constants
  const ACCOUNTS_URL = 'https://accounts.novairasolution.com';

  useEffect(() => {
    setCurrentUrl(window.location.href);

    // ==========================================
    // FETCH USER SESSION FROM PHP BACKEND
    // ==========================================
    /* 
      This fetch call will automatically send the 'NOVAIRA_SESSION' cookie 
      to your PHP backend because of "credentials: 'include'".
      You will need a small PHP file (e.g., get_user.php) that returns:
      { "status": "success", "user": { "name": "Subha", "tier": "Gold" } }
    */
    
    const checkSession = async () => {
      try {
        const res = await fetch(`${ACCOUNTS_URL}/api/get_user.php`, {
          method: 'GET',
          credentials: 'include', // Important to send the HttpOnly cookie
        });
        const data = await res.json();
        if (data && data.status === 'success') {
          setUser({ name: data.user.first_name, tier: data.user.user_type });
        }
      } catch (err) {
        // Mocking a logged-in user for development testing (Remove this in production)
        // setUser({ name: 'Subhankar', tier: 'Premium Agent' });
      }
    };
    
    checkSession();
  }, []);

  const loginUrl = `${ACCOUNTS_URL}/?redirect=${encodeURIComponent(currentUrl)}`;
  const registerUrl = `${ACCOUNTS_URL}/?registration=individual&redirect=${encodeURIComponent(currentUrl)}`;
  const logoutUrl = `${ACCOUNTS_URL}/logout.php?redirect=${encodeURIComponent(currentUrl)}`;

  useEffect(() => {
    // Simulator calculation
    const total = Math.floor(friends * tasks * 1.5 * 30);
    setIncome(total);
  }, [friends, tasks]);

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>N</div>
          <span>Novaira <span className={styles.dotText}>Community</span></span>
        </div>
        
        <div className={styles.navActions}>
          {user ? (
            // LOGGED IN VIEW: User Dropdown
            <div className={styles.userMenuWrapper}>
              <button 
                className={styles.userBtn} 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className={styles.userAvatar}>{user.name.charAt(0)}</div>
                <span className={styles.userName}>{user.name}</span>
                <span style={{ fontSize: '0.8rem' }}>▼</span>
              </button>
              
              {dropdownOpen && (
                <div className={`${styles.dropdown} ${styles.glassPanel}`}>
                  <div className={styles.dropdownHeader}>
                    <div className="dot-text text-secondary" style={{ fontSize: '0.7rem' }}>Signed in as</div>
                    <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                    <div className={styles.userTier}>{user.tier}</div>
                  </div>
                  <hr className={styles.divider} />
                  <a href={`${ACCOUNTS_URL}/dashboard`} className={styles.dropdownItem}>My Dashboard</a>
                  <a href={`${ACCOUNTS_URL}/settings`} className={styles.dropdownItem}>Settings</a>
                  <hr className={styles.divider} />
                  <a href={logoutUrl} className={`${styles.dropdownItem} ${styles.textRed}`}>Log Out</a>
                </div>
              )}
            </div>
          ) : (
            // LOGGED OUT VIEW: Login & Register Buttons
            <>
              <a href={loginUrl} className={styles.btnLogin}>Login</a>
              <a href={registerUrl} className={styles.btnRegister}>Join the Elite</a>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Maximum Growth.<br />Zero Investment.</h1>
        <p className={styles.heroSubtitle}>
          Join the exclusive Novaira Global Business network. Build your squad, complete tasks, and unlock passive income while you sleep.
        </p>
      </header>

      {/* VIP Tiers */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>[ VIP TIERS ]</h2>
          <span className="dot-text text-secondary">Status System</span>
        </header>
        <div className={styles.tiersGrid}>
          <div className={`${styles.tierCard} ${styles.glassPanel} ${styles.tierBronze}`}>
            <div className={styles.tierBadge}></div>
            <h3 className={styles.tierName}>Bronze</h3>
            <p className={styles.tierDesc}>Start your journey. Basic task access.</p>
            <div className={styles.tierPerk}>Standard Payouts (72h)</div>
          </div>
          <div className={`${styles.tierCard} ${styles.glassPanel} ${styles.tierSilver}`}>
            <div className={styles.tierBadge}></div>
            <h3 className={styles.tierName}>Silver</h3>
            <p className={styles.tierDesc}>5 Active Referrals required.</p>
            <div className={styles.tierPerk}>+10% Task Bonus</div>
          </div>
          <div className={`${styles.tierCard} ${styles.glassPanel} ${styles.tierGold}`}>
            <div className={styles.tierBadge}></div>
            <h3 className={styles.tierName}>Gold</h3>
            <p className={styles.tierDesc}>Unlock high-paying premium tasks.</p>
            <div className={styles.tierPerk}>Priority Payouts (24h)</div>
          </div>
          <div className={`${styles.tierCard} ${styles.glassPanel} ${styles.tierDiamond}`}>
            <div className={styles.tierBadge}></div>
            <h3 className={styles.tierName}>Diamond</h3>
            <p className={styles.tierDesc}>The top 1%. Elite status only.</p>
            <div className={styles.tierPerk}>Direct CEO Access</div>
          </div>
        </div>
      </section>

      {/* Passive Income Simulator */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>[ PASSIVE INCOME ]</h2>
          <span className="dot-text text-secondary">Calculator</span>
        </header>
        <div className={`${styles.calcBox} ${styles.glassPanel}`}>
          <div className={styles.calcControls}>
            <label>If I invite friends:</label>
            <input 
              type="range" 
              min="1" max="100" 
              value={friends} 
              onChange={(e) => setFriends(Number(e.target.value))}
              className={styles.slider} 
            />
            <div style={{ textAlign: 'right', marginBottom: '1rem' }} className="dot-text">{friends} Friends</div>

            <label>And they do daily tasks:</label>
            <input 
              type="range" 
              min="1" max="20" 
              value={tasks} 
              onChange={(e) => setTasks(Number(e.target.value))}
              className={styles.slider} 
            />
            <div style={{ textAlign: 'right' }} className="dot-text">{tasks} Tasks</div>
          </div>
          <div className={styles.calcResult}>
            <p className="dot-text text-secondary">My estimated monthly income</p>
            <div className={styles.resultAmount}>₹ {income.toLocaleString()}</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>while I sleep!</p>
          </div>
        </div>
      </section>

      {/* Squad Challenge */}
      <section className={styles.section}>
        <div className={styles.squadGrid}>
          <div className={`${styles.squadPanel} ${styles.glassPanel}`}>
            <h2 className={styles.squadTitle}>Weekly Squad Challenge</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Team up with your 5 direct referrals. If your squad completes 50 tasks this week, everyone unlocks the "Super Squad" badge and a 20% earnings multiplier!
            </p>
            <div className={styles.squadMembers}>
              {[1,2,3,4,5].map(num => (
                <div key={num} className={styles.squadAvatar}>U{num}</div>
              ))}
            </div>
            <button className={styles.btnRegister} style={{ width: '100%' }}>Create Squad</button>
          </div>
          
          {/* Unlock The Vault */}
          <div className={`${styles.vault} ${styles.glassPanel}`}>
            <div className={styles.vaultLock}>🔒</div>
            <h3 className={styles.vaultTitle}>Unlock The Vault</h3>
            <p className={styles.vaultDesc}>
              Premium tasks and Fast Withdrawals are locked. Refer 3 active friends to gain permanent access to the Vault.
            </p>
            <div className={styles.vaultProgress}>
              <div className={`${styles.progressDot} ${styles.active}`}></div>
              <div className={styles.progressDot}></div>
              <div className={styles.progressDot}></div>
            </div>
            <p className="dot-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1 / 3 REFERRED</p>
          </div>
        </div>
      </section>

      {/* Hall of Fame */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>[ HALL OF FAME ]</h2>
          <span className="dot-text text-secondary">Top Referrers</span>
        </header>
        <div className={styles.fameGrid}>
          <div className={styles.famePodium}>
            <div className={styles.fameAvatar}></div>
            <div className={styles.fameBox}>
              <div>#2</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Silver Agent</div>
            </div>
          </div>
          <div className={styles.famePodium}>
            <div className={styles.fameAvatar} style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', fontSize: '1.5rem' }}>👑</div>
            </div>
            <div className={styles.fameBox}>
              <div style={{ color: 'var(--tier-gold)', fontSize: '1.2rem', fontWeight: 800 }}>#1</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--tier-gold)' }}>Premium Agent</div>
              <div style={{ fontSize: '0.6rem', marginTop: '0.5rem', opacity: 0.8 }}>CEO Session Unlocked</div>
            </div>
          </div>
          <div className={styles.famePodium}>
            <div className={styles.fameAvatar}></div>
            <div className={styles.fameBox}>
              <div>#3</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Bronze Agent</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
