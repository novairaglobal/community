'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../page.module.css';

interface Discussion {
  id: number; user_id: string; first_name: string; user_type: string;
  title: string; content: string; tags: string; post_hash?: string;
  views: number; created_at: string; replies?: number;
}
interface Comment {
  id: number; post_hash: string; user_id: string; first_name: string;
  content: string; created_at: string; parent_id?: number | null;
}
interface Reaction { emoji: string; count: number; active: boolean; }

const DEFAULT_EMOJIS = ['👍', '❤️', '😂', '😮', '🔥'];
const MORE_EMOJIS = ['😢', '😡', '🎉', '🙏', '💯', '👏', '🤔', '😍', '💪', '🚀', '⭐', '💚'];
const INITIAL_NOTIFS: any[] = [];

export default function PostNativePage() {
  const router = useRouter();
  const params = useParams();
  const hash = params.hash as string;

  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('https://community.novairasolution.com');
  const [user, setUser] = useState<{ id: string | number; name: string; tier: string } | null>(null);
  const [post, setPost] = useState<Discussion | null>(null);
  const [allDiscussions, setAllDiscussions] = useState<Discussion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>(DEFAULT_EMOJIS.map(e => ({ emoji: e, count: 0, active: false })));
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS);

  const API_URL = 'https://accounts.novairasolution.com/api/discussions.php';
  const ACCOUNTS_URL = 'https://accounts.novairasolution.com';
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const commentInputRefMobile = useRef<HTMLInputElement>(null);
  const commentInputRefDesktop = useRef<HTMLTextAreaElement>(null);
  const emojiPanelRef = useRef<HTMLDivElement>(null);

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
      } catch { }
    };
    checkSession();

    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}?action=fetch`, { credentials: 'include' });
        const data = await res.json();
        if (data?.status === 'success') {
          setAllDiscussions(data.data);
          const found = data.data.find((d: Discussion) => {
            const dbHash = (d.post_hash || '').trim();
            return dbHash === hash || `post_${d.id}aBcDeFgHiJkLmNo` === hash;
          });
          if (found) {
            setPost(found);
            fetch(`${API_URL}?action=increment_view&hash=${found.post_hash || hash}`, { credentials: 'include' }).catch(() => { });
            fetchComments(found.post_hash || hash);
          }
        }
      } catch { }
      setIsLoading(false);
    };
    fetchPost();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (emojiPanelRef.current && !emojiPanelRef.current.contains(e.target as Node)) setShowEmojiPanel(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hash]);

  const fetchComments = async (postHash: string) => {
    try {
      const res = await fetch(`${API_URL}?action=fetch_comments&post_hash=${postHash}`, { credentials: 'include' });
      const data = await res.json();
      if (data?.status === 'success') setComments(data.data);
    } catch { }
  };

  const submitComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !post || !newComment.trim()) return;
    setIsCommenting(true);
    try {
      const targetHash = post.post_hash || hash;
      const res = await fetch(`${API_URL}?action=create_comment`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          post_hash: targetHash, user_id: user.id.toString(),
          first_name: user.name, content: newComment,
          parent_id: replyingTo ? replyingTo.id.toString() : ''
        })
      });
      const data = await res.json();
      if (data?.status === 'success') { setNewComment(''); setReplyingTo(null); fetchComments(targetHash); }
    } catch { alert('Failed to post comment.'); }
    setIsCommenting(false);
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    setNewComment('');
    // Focus whichever input is visible based on screen size (basic logic)
    setTimeout(() => {
      if (window.innerWidth > 900) {
        commentInputRefDesktop.current?.focus();
        commentInputRefDesktop.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        commentInputRefMobile.current?.focus();
      }
    }, 50);
  };

  const cancelReply = () => { setReplyingTo(null); setNewComment(''); };

  const toggleReaction = (emoji: string) => {
    setReactions(prev => prev.map(r => r.emoji === emoji
      ? { ...r, count: r.active ? r.count - 1 : r.count + 1, active: !r.active } : r));
  };

  const addNewReaction = (emoji: string) => {
    setShowEmojiPanel(false);
    if (reactions.find(r => r.emoji === emoji)) { toggleReaction(emoji); return; }
    setReactions(prev => [...prev, { emoji, count: 1, active: true }]);
  };

  const toggleTheme = () => {
    const n = theme === 'dark' ? 'light' : 'dark';
    setTheme(n); document.documentElement.setAttribute('data-theme', n); localStorage.setItem('theme', n);
  };

  const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const loginUrl = `${ACCOUNTS_URL}/?redirect=${encodeURIComponent(currentUrl)}`;
  const registerUrl = `${ACCOUNTS_URL}/?registration=individual&redirect=${encodeURIComponent(currentUrl)}`;
  const logoutUrl = `${ACCOUNTS_URL}/logout.php?redirect=${encodeURIComponent(currentUrl)}`;
  const getTagColor = (tag: string) => ({ Newsroom: '#00b84c', 'VIP Tiers': '#f5a623', 'My Squad': '#0070f3' } as Record<string, string>)[tag] || '#8b5cf6';

  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: number) => comments.filter(c => c.parent_id === parentId);

  // --- REAL DATA FOR WIDGETS ---
  const trendingDiscussions = [...allDiscussions].sort((a, b) => b.views - a.views).slice(0, 3);


  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--brand-green)', fontSize: '2rem' }}>
      <i className="fas fa-circle-notch fa-spin"></i>
    </div>
  );
  if (!post) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem', color: 'var(--text-primary)' }}>
      <i className="fas fa-ghost" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
      <h1 style={{ fontSize: '1.2rem' }}>Post not found.</h1>
      <button onClick={() => router.push('/')} style={{ padding: '0.6rem 1.5rem', background: 'var(--brand-green)', color: '#fff', border: 'none', borderRadius: '100px', cursor: 'pointer', fontWeight: 700 }}>← Back</button>
    </div>
  );

  return (
    <div className={styles.app}>

      {/* ══ HEADER ══ */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(v => !v)}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            Novaira <span className={styles.logoDot}>Community</span>
          </div>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search discussions..." onKeyDown={e => { if (e.key === 'Enter') router.push('/'); }} />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button onClick={toggleTheme} className={styles.themeToggle}>
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          {user ? (
            <>
              {/* Bell */}
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

              {/* User pill */}
              <div className={styles.userDropdownWrapper} ref={dropdownRef}>
                <div className={`${styles.userPill} ${dropdownOpen ? styles.open : ''}`} onClick={() => setDropdownOpen(v => !v)}>
                  <div className={styles.headerAvatar}>{user.name.charAt(0).toUpperCase()}</div>
                  <div className={styles.userPillName}>{user.name}</div>
                  <i className={`fas fa-chevron-down ${styles.userPillArrow}`}></i>
                </div>
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}><h4>{user.name}</h4><span>UID: {user.id}</span></div>
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
              <button onClick={() => router.push('/')} className={styles.navItem}>
                <i className={`far fa-comments ${styles.navIcon}`}></i> All Discussions
              </button>
            </div>
          </div>
          
          <div className={styles.navGroup}>
            <div className={styles.navGroupTitle}>Tags</div>
            <div className={styles.navMenu}>
              {['Newsroom', 'VIP Tiers', 'My Squad', 'General'].map(tag => (
                <button key={tag} onClick={() => router.push(`/?tag=${tag}`)} className={styles.navItem}>
                  <span className={styles.tagDot} style={{ background: getTagColor(tag) }}></span> {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 2. MIDDLE CONTENT (Post) */}
        <main className={styles.content}>
          <button className={styles.btnBack} onClick={() => router.back()}>
            <i className="fas fa-arrow-left" style={{ color: 'var(--brand-green)' }}></i> Back
          </button>

          <div className={styles.postNativeContainer}>
            {/* Author */}
            <div className={styles.postHeaderArea}>
              <div className={styles.deepAvatar}>{post.first_name.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{post.first_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleString()}</div>
              </div>
              <span style={{
                background: `${getTagColor(post.tags)}18`, color: getTagColor(post.tags),
                border: `1px solid ${getTagColor(post.tags)}40`, borderRadius: '100px',
                padding: '0.25rem 0.85rem', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0
              }}>{post.tags}</span>
            </div>

            <h1 className={styles.deepTitle}>{post.title}</h1>
            <div className={styles.postContentArea}>{post.content}</div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem', fontWeight: 600 }}>
              <span><i className="far fa-eye" style={{ marginRight: '0.4rem' }}></i>{post.views} views</span>
              <span><i className="far fa-comment" style={{ marginRight: '0.4rem' }}></i>{comments.length} comments</span>
            </div>

            {/* Reactions */}
            <div className={styles.reactionsBar}>
              {reactions.map(r => (
                <button key={r.emoji} className={`${styles.reactionBtn} ${r.active ? styles.active : ''}`} onClick={() => toggleReaction(r.emoji)}>
                  <span>{r.emoji}</span>
                  {r.count > 0 && <span className={styles.reactionCount}>{r.count}</span>}
                </button>
              ))}
              <div style={{ position: 'relative' }} ref={emojiPanelRef}>
                <button className={styles.reactionMore} onClick={() => setShowEmojiPanel(v => !v)} title="More reactions">
                  <i className="fas fa-plus"></i>
                </button>
                {showEmojiPanel && (
                  <div className={styles.emojiPanel}>
                    {MORE_EMOJIS.map(e => (
                      <button key={e} className={styles.emojiPanelBtn} onClick={() => addNewReaction(e)}>{e}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ====== DESKTOP COMMENT BOX (Hides on Mobile) ====== */}
            <div className={styles.desktopCommentBox}>
              <div className={styles.desktopCommentHeader}>
                <i className="far fa-comment-dots" style={{ color: 'var(--brand-green)', fontSize: '1.2rem' }}></i>
                {replyingTo ? `Replying to ${replyingTo.first_name}` : 'Leave a comment'}
              </div>
              
              {replyingTo && (
                <div className={styles.desktopReplyHint}>
                  <span>Replying to <strong>{replyingTo.first_name}</strong></span>
                  <button onClick={cancelReply} title="Cancel reply"><i className="fas fa-times"></i></button>
                </div>
              )}

              <textarea
                ref={commentInputRefDesktop}
                className={styles.desktopCommentInput}
                placeholder={user ? "Share your thoughts..." : "Log in to join the discussion..."}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                disabled={!user || isCommenting}
              />
              <div className={styles.desktopCommentActions}>
                {user && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                    <div className={styles.headerAvatar} style={{ width: 28, height: 28, fontSize: '0.8rem' }}>{user.name.charAt(0).toUpperCase()}</div>
                    {user.name}
                  </div>
                )}
                <button className={styles.btnDesktopComment} onClick={() => submitComment()} disabled={!user || isCommenting || !newComment.trim()}>
                  {isCommenting ? <><i className="fas fa-spinner fa-spin"></i> Posting...</> : 'Post Comment'}
                </button>
              </div>
            </div>

            {/* Comments heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Comments</h3>
              <span style={{ background: 'var(--brand-green)', color: '#fff', borderRadius: '100px', padding: '0.1rem 0.65rem', fontSize: '0.8rem', fontWeight: 800 }}>{comments.length}</span>
            </div>

            {/* Comment list */}
            <div className={styles.commentList}>
              {topLevelComments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <i className="far fa-comment-dots" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.6rem', opacity: 0.35 }}></i>
                  No comments yet — be the first!
                </div>
              ) : topLevelComments.map(c => (
                <div key={c.id}>
                  <div className={styles.comment}>
                    <div className={styles.commentAvatar}>{c.first_name.charAt(0).toUpperCase()}</div>
                    <div className={styles.commentBubble}>
                      <div>
                        <span className={styles.commentAuthor}>{c.first_name}</span>
                        <span className={styles.commentTime}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className={styles.commentText}>{c.content}</p>
                      {user && (
                        <div className={styles.commentActions}>
                          <button className={styles.btnReply} onClick={() => handleReply(c)}>↩ Reply</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Nested replies */}
                  {getReplies(c.id).length > 0 && (
                    <div className={styles.replyThread}>
                      {getReplies(c.id).map(r => (
                        <div key={r.id} className={styles.comment}>
                          <div className={styles.commentAvatar}>{r.first_name.charAt(0).toUpperCase()}</div>
                          <div className={styles.commentBubble}>
                            <div>
                              <span className={styles.commentAuthor}>{r.first_name}</span>
                              <span className={styles.commentTime}>{new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className={styles.commentText}>{r.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ height: '0.5rem' }}></div>
          </div>
        </main>

        {/* 3. RIGHT SIDEBAR (Extra Content - Visible only on Desktop) */}
        <aside className={styles.rightSidebar}>
          <div className={styles.widgetCard}>
            <div className={styles.widgetTitle}><i className="fas fa-fire" style={{ color: '#ff4d4f' }}></i> Trending Now</div>
            <div className={styles.widgetList}>
              {trendingDiscussions.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No trending posts.</div>
              ) : trendingDiscussions.map((d) => {
                const targetHash = d.post_hash || `post_${d.id}aBcDeFgHiJkLmNo`;
                return (
                  <div key={d.id} className={styles.widgetItem} onClick={() => router.push(`/d/${targetHash}`)}>
                    <div className={styles.widgetItemAvatar}><i className="fas fa-hashtag"></i></div>
                    <div className={styles.widgetItemBody}>
                      <div className={styles.widgetItemTitle}>{d.title}</div>
                      <div className={styles.widgetItemSub}>{d.views} views • {d.tags}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

      </div>

      {/* ====== MOBILE ONLY: STICKY COMMENT BAR (Hides on Desktop) ====== */}
      {replyingTo && (
        <div className={`${styles.replyHintMobile} ${styles.stickyCommentBar}`} style={{ bottom: 'calc(60px + env(safe-area-inset-bottom))', display: 'flex', borderTop: 'none', background: 'var(--bg-secondary)', padding: '0.35rem 1rem' }}>
          <span style={{ color: 'var(--brand-green)', fontWeight: 700, fontSize: '0.85rem' }}><i className="fas fa-reply" style={{ marginRight: '0.4rem' }}></i>Replying to <strong>{replyingTo.first_name}</strong></span>
          <button onClick={cancelReply} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1rem' }}><i className="fas fa-times"></i></button>
        </div>
      )}
      
      <form className={styles.stickyCommentBar} onSubmit={submitComment}>
        {user ? (
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', background: 'var(--brand-green)',
            color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', flexShrink: 0
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        ) : null}
        <input
          ref={commentInputRefMobile}
          type="text"
          className={styles.stickyCommentInput}
          placeholder={
            !user ? 'Log in to comment' :
            replyingTo ? `Reply to ${replyingTo.first_name}...` :
            'Write a comment...'
          }
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          disabled={!user || isCommenting}
        />
        <button type="submit" className={styles.btnSendComment} disabled={!user || isCommenting || !newComment.trim()}>
          {isCommenting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
        </button>
      </form>

    </div>
  );
}
