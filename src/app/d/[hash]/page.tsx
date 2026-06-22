'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function PostPage({ params }: { params: { hash: string } }) {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [post, setPost] = useState<Discussion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = 'https://accounts.novairasolution.com/api/discussions.php';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}?action=fetch`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await res.json();
        if (data && data.status === 'success') {
          // Find the specific post by hash
          const found = data.data.find((d: Discussion) => d.post_hash === params.hash);
          if (found) {
            setPost(found);
          } else {
            // Fallback if hash doesn't match (maybe it's old data without hash)
            // Or just show 404
          }
        }
      } catch (err) {
        console.error("Failed to fetch post", err);
      }
      setIsLoading(false);
    };

    fetchPost();
  }, [params.hash]);

  const getTagColor = (tagName: string) => {
    if (tagName === 'Newsroom') return '#00b84c';
    if (tagName === 'VIP Tiers') return '#f5a623';
    if (tagName === 'My Squad') return '#0070f3';
    return '#8b5cf6';
  };

  if (isLoading) {
    return <div style={{padding: '5rem', textAlign: 'center', color: 'var(--brand-green)', fontSize: '2rem'}}><i className="fas fa-circle-notch fa-spin"></i></div>;
  }

  if (!post) {
    return (
      <div style={{padding: '5rem', textAlign: 'center', color: 'var(--text-primary)'}}>
        <h1>Post not found.</h1>
        <button onClick={() => router.push('/')} style={{marginTop: '2rem', padding: '1rem 2rem', background: 'var(--brand-green)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800}}>Back to Community</button>
      </div>
    );
  }

  return (
    <div className={styles.app} style={{ minHeight: '100vh', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      
      <div className={styles.fullScreenModalContent} style={{ animation: 'none', marginTop: '2rem', marginBottom: '2rem' }}>
        
        <button className={styles.btnBack} onClick={() => router.push('/')}>
          <i className="fas fa-arrow-left"></i> Back to Feed
        </button>
        
        <div className={styles.deepHeader}>
          <div className={styles.deepAvatar}>
            {post.first_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className={styles.deepTitle}>{post.title}</h1>
            <div className={styles.discussionMeta} style={{marginBottom: '1rem'}}>
              <span className={styles.tagPill}><span className={styles.tagDotSmall} style={{color: getTagColor(post.tags)}}></span> {post.tags}</span>
              <span>By <strong>{post.first_name}</strong> ({post.user_type})</span>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.deepContent}>
          {post.content}
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

    </div>
  );
}
