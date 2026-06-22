export default function Settings() {
  return (
    <div style={{ padding: '4rem', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brand-green)' }}>Account Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Manage your notifications, theme, and account preferences here.</p>
      <a href="/" style={{ display: 'inline-block', marginTop: '2rem', padding: '0.8rem 1.5rem', background: 'var(--brand-green)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 800 }}>Back to Community</a>
    </div>
  );
}
