'use client';

import { useState, useEffect, useRef } from 'react';
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
  views: number;
  created_at: string;
  post_hash?: string;
  replies?: number;
}

export default function CreatePostPage() {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState<{ id: string | number; name: string; tier: string } | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('Newsroom');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = 'https://accounts.novairasolution.com/api/discussions.php';
  const ACCOUNTS_URL = 'https://accounts.novairasolution.com';

  useEffect(() => {
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
          // Redirect to login if not logged in
          window.location.href = `${ACCOUNTS_URL}/?redirect=${encodeURIComponent(window.location.origin + '/create')}`;
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };
    checkSession();
  }, []);

  const submitDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    const generateHash = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    const localHash = generateHash();

    try {
      const res = await fetch(`${API_URL}?action=create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          user_id: user.id.toString(),
          first_name: user.name,
          user_type: user.tier,
          title: newTitle,
          tags: newTag,
          content: newContent,
          post_hash: localHash
        })
      });
      const data = await res.json();
      if (data && data.status === 'success') {
        router.push('/');
      } else {
        alert("Failed to post: " + data.message);
      }
    } catch (err) {
      alert("Network error while posting.");
    }
    setIsSubmitting(false);
  };

  if (!user) {
    return <div style={{padding: '5rem', textAlign: 'center', color: 'var(--text-primary)'}}>Checking authentication...</div>;
  }

  return (
    <div className={styles.app} style={{ minHeight: '100vh', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        background: 'var(--bg-primary)', width: '100%', maxWidth: '700px',
        borderRadius: '16px', border: '1px solid rgba(0, 184, 76, 0.2)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 40px rgba(0, 184, 76, 0.1)',
        padding: '3rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Create a Discussion</h1>
          <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={submitDiscussion}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Discussion Title</label>
            <input type="text" style={{ width: '100%', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '1.1rem' }} placeholder="What's on your mind?" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required maxLength={100} />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Tag</label>
            <select style={{ width: '100%', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '1.1rem' }} value={newTag} onChange={(e) => setNewTag(e.target.value)}>
              <option value="Newsroom">Newsroom</option>
              <option value="VIP Tiers">VIP Tiers</option>
              <option value="My Squad">My Squad</option>
              <option value="General">General</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Content</label>
            <textarea style={{ width: '100%', minHeight: '200px', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '1.1rem', resize: 'vertical' }} placeholder="Type your message here..." value={newContent} onChange={(e) => setNewContent(e.target.value)} required></textarea>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={() => router.push('/')} style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ 
              padding: '0.75rem 2.5rem', background: 'linear-gradient(135deg, var(--brand-green), #059669)', color: '#fff', 
              borderRadius: '8px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', border: 'none', 
              boxShadow: '0 10px 20px rgba(0, 184, 76, 0.3)' 
            }}>
              {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Posting...</> : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
