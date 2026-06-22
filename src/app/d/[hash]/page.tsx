'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../page.module.css';

interface Discussion {
  id: number;
  user_id: string;
  first_name: string;
  user_type: string;
  title: string;
  content: string;
  tags: string;
  post_hash?: string;
  views: number;
  created_at: string;
  replies?: number;
}

interface Comment {
  id: number;
  post_hash: string;
  user_id: string;
  first_name: string;
  content: string;
  created_at: string;
}

export default function PostNativePage() {
  const router = useRouter();
  const params = useParams();
  const hash = params.hash as string;
  
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [user, setUser] = useState<{ id: string | number; name: string; tier: string } | null>(null);
  const [post, setPost] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const API_URL = 'https://accounts.novairasolution.com/api/discussions.php';
  const ACCOUNTS_URL = 'https://accounts.novairasolution.com';
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const checkSession = async () => {
      try {
        const res = await fetch(`${ACCOUNTS_URL}/api/get_user.php`, { method: 'GET', credentials: 'include' });
        const data = await res.json();
        if (data && data.status === 'success') {
          setUser({ id: data.user.id, name: data.user.first_name, tier: data.user.user_type });
        }
      } catch (err) { console.error('Session error', err); }
    };
    checkSession();

    const fetchPostData = async () => {
      try {
        // Fetch All Posts to find current
        const res = await fetch(`${API_URL}?action=fetch`, { method: 'GET', credentials: 'include' });
        const data = await res.json();
        if (data && data.status === 'success') {
          const found = data.data.find((d: Discussion) => {
            const dbHash = (d.post_hash || '').trim();
            const fallbackHash = `post_${d.id}aBcDeFgHiJkLmNo`;
            return dbHash === hash || fallbackHash === hash || String(d.id) === hash;
          });
          
          if (found) {
            setPost(found);
            // Increment view
            fetch(`${API_URL}?action=increment_view&hash=${found.post_hash || hash}`, { method: 'GET' }).catch(() => {});
            // Fetch comments
            fetchComments(found.post_hash || hash);
          }
        }
      } catch (err) { console.error(err); }
      setIsLoading(false);
    };
    
    fetchPostData();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hash]);

  const fetchComments = async (postHash: string) => {
    try {
      const res = await fetch(`${API_URL}?action=fetch_comments&post_hash=${postHash}`, { method: 'GET' });
      const data = await res.json();
      if (data && data.status === 'success') {
        setComments(data.data);
      }
    } catch (err) {}
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post || !newComment.trim()) return;
    setIsCommenting(true);
    
    try {
      const targetHash = post.post_hash || hash;
      const res = await fetch(`${API_URL}?action=create_comment`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          post_hash: targetHash,
          user_id: user.id.toString(),
          first_name: user.name,
          content: newComment
        })
      });
      const data = await res.json();
      if (data && data.status === 'success') {
        setNewComment('');
        fetchComments(targetHash);
      }
    } catch (err) { alert("Failed to post comment."); }
    setIsCommenting(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const loginUrl = `${ACCOUNTS_URL}/?redirect=${encodeURIComponent(window.location.origin + `/d/${hash}`)}`;
  const logoutUrl = `${ACCOUNTS_URL}/logout.php?redirect=${encodeURIComponent(window.location.origin)}`;

  const getTagColor = (tagName: string) => {
    if (tagName === 'Newsroom') return '#00b84c';
    if (tagName === 'VIP Tiers') return '#f5a623';
    if (tagName === 'My Squad') return '#0070f3';
    return '#8b5cf6';
  };

  if (isLoading) return <div style={{padding: '5rem', textAlign: 'center', color: 'var(--brand-green)', fontSize: '2rem'}}><i className="fas fa-circle-notch fa-spin"></i></div>;
  if (!post) return <div style={{padding: '5rem', textAlign: 'center', color: 'var(--text-primary)'}}><h1>Post not found.</h1><button onClick={() => router.push('/')} style={{marginTop: '2rem', padding: '1rem 2rem', background: 'var(--brand-green)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800}}>Back to Community</button></div>;

  return (
    <div className={styles.app}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          <div className={styles.logo} onClick={() => router.push('/')} style={{cursor: 'pointer'}}>
            Novaira <span className={styles.logoDot}>Community</span>
          </div>
        </div>
        <div className={styles.headerCenter}>
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search forum..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if(e.key==='Enter') router.push('/'); }} />
          </div>
        </div>
        <div className={styles.headerRight}>
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle Theme">
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          {user ? (
            <>
              <div className={styles.notificationWrapper} ref={notifRef}>
                <i className={`fas fa-bell ${styles.bellIcon}`} onClick={() => setNotifOpen(!notifOpen)}></i>
                <div className={styles.bellBadge}>2</div>
                {notifOpen && (
                  <div className={styles.notificationMenu}>
                    <div className={styles.notifHeader}>System Alerts</div>
                    <div className={styles.notifItem}>
                      <div className={styles.notifTitle}>Welcome to Native App View!</div>
                      <div className={styles.notifTime}>Just now</div>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.userDropdownWrapper} ref={dropdownRef}>
                <div className={`${styles.userPill} ${dropdownOpen ? styles.open : ''}`} onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className={styles.headerAvatar} title={user.name}>{user.name.charAt(0).toUpperCase()}</div>
                  <div className={styles.userPillName}>{user.name}</div>
                  <i className={`fas fa-chevron-down ${styles.userPillArrow}`}></i>
                </div>
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <h4>{user.name}</h4><div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>UID: {user.id}</div><span>{user.tier} Account</span>
                    </div>
                    <a href="/profile" className={styles.dropdownItem}><i className="far fa-user"></i> My Profile</a>
                    <a href="/settings" className={styles.dropdownItem}><i className="fas fa-cog"></i> Settings</a>
                    <div className={styles.dropdownDivider}></div>
                    <a href={logoutUrl} className={styles.dropdownItem} style={{color: 'var(--brand-green)'}}><i className="fas fa-sign-out-alt"></i> Log Out</a>
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
          <button className={styles.btnStartDiscussion} onClick={() => { if(!user) { window.location.href = loginUrl; return; } router.push('/create'); }}>
            <i className="fas fa-edit"></i> Start a Discussion
          </button>
          <div className={styles.navGroup}>
            <div className={styles.navMenu}>
              <a onClick={() => router.push('/')} className={styles.navItem}>
                <i className={`far fa-comments ${styles.navIcon}`}></i> All Discussions
              </a>
            </div>
          </div>
          <div className={styles.navGroup}>
            <div className={styles.navGroupTitle}>Tags</div>
            <div className={styles.navMenu}>
              {['Newsroom', 'VIP Tiers', 'My Squad', 'General'].map(tag => (
                <a key={tag} onClick={() => router.push('/')} className={styles.navItem}>
                  <span className={styles.tagDot} style={{background: getTagColor(tag)}}></span> {tag}
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* CONTENT AREA (NATIVE APP POST VIEW) */}
        <main className={styles.content}>
          <button className={styles.btnBack} onClick={() => router.push('/')} style={{marginBottom: '1rem'}}>
            <i className="fas fa-arrow-left"></i> Back to Feed
          </button>

          <div className={styles.postNativeContainer}>
            <div className={styles.postHeaderArea}>
              <div className={styles.deepAvatar}>{post.first_name.charAt(0).toUpperCase()}</div>
              <div>
                <h1 className={styles.deepTitle}>{post.title}</h1>
                <div className={styles.discussionMeta}>
                  <span className={styles.tagPill}><span className={styles.tagDotSmall} style={{color: getTagColor(post.tags)}}></span> {post.tags}</span>
                  <span>By <strong>{post.first_name}</strong></span>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                  <span><i className="far fa-eye"></i> {post.views + 1} views</span>
                </div>
              </div>
            </div>

            <div className={styles.postContentArea}>{post.content}</div>

            {/* COMMENTS SECTION */}
            <div className={styles.commentsSection}>
              <h3>Comments ({comments.length})</h3>
              
              <div className={styles.commentList} style={{marginBottom: '2rem'}}>
                {comments.length === 0 ? (
                  <p style={{color: 'var(--text-muted)'}}>No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className={styles.comment}>
                      <div className={styles.commentAvatar} style={{background: 'linear-gradient(135deg, #333, #000)'}}>{c.first_name.charAt(0).toUpperCase()}</div>
                      <div className={styles.commentBody}>
                        <h4>{c.first_name} <span style={{fontSize:'0.75rem', color:'var(--text-muted)', marginLeft:'0.5rem'}}>{new Date(c.created_at).toLocaleDateString()}</span></h4>
                        <p>{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* STICKY BOTTOM COMMENT BAR (MOBILE) */}
              <form className={styles.stickyCommentBar} onSubmit={submitComment}>
                {user ? (
                  <div className={styles.commentAvatar} style={{background: 'var(--brand-green)', width: '36px', height: '36px', fontSize: '0.9rem'}}>{user.name.charAt(0).toUpperCase()}</div>
                ) : null}
                <input 
                  type="text" 
                  className={styles.stickyCommentInput} 
                  placeholder={user ? "Write a comment..." : "Log in to comment"} 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  disabled={!user || isCommenting}
                />
                <button type="submit" className={styles.btnSendComment} disabled={!user || isCommenting || !newComment.trim()}>
                  {isCommenting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                </button>
              </form>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
