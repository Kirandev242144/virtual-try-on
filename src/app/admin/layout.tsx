"use client";
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './admin.module.css';
import { LayoutDashboard, Users, AlertTriangle, ShieldAlert, Home, LogOut, Loader2, Cpu } from 'lucide-react';
import Link from 'next/link';

const NAV = [
  { section: 'ADMINISTRATION' },
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Vendors', icon: Users, href: '/admin/vendors' },
  { label: 'Disputes & Escrow', icon: AlertTriangle, href: '/admin/disputes' },
  { label: 'GPU Computing', icon: Cpu, href: '/admin/runpod' },
  { section: 'NAVIGATION' },
  { label: 'Go to Main Store', icon: Home, href: '/' },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [bypass, setBypass] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('vogue_admin_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme as 'light' | 'dark');
    }
  }, []);

  useEffect(() => {
    // For local dev convenience, if bypassing is enabled, allow viewing pages
    if (status === 'unauthenticated' && !bypass) {
      // Just check if we want to auto-redirect
    }
  }, [status, bypass]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080c14' }}>
        <div style={{ textAlign:'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#8b5cf6', margin: '0 auto 1rem' }} />
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem' }}>Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  // @ts-ignore
  const isAdmin = session?.user?.role === 'admin';

  // If not admin and bypass is not checked, show Access Denied
  if (!isAdmin && !bypass && status === 'authenticated') {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080c14', padding: '2rem' }}>
        <div style={{
          maxWidth: '480px', width: '100%', padding: '2.5rem', 
          background: '#0c111e', border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: '16px', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
        }}>
          <div style={{ 
            width: 56, height: 56, borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' 
          }}>
            <ShieldAlert size={28} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Access Denied</h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your account ({session.user?.email}) does not have Super Admin privileges. Please contact the platform developer.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
            <button 
              className={styles.btnPrimary} 
              style={{ justifyContent: 'center', padding: '0.75rem' }}
              onClick={() => router.push('/')}
            >
              Go to Homepage
            </button>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />
            <button 
              onClick={() => setBypass(true)}
              style={{
                background: 'transparent', border: '1px dashed rgba(139, 92, 246, 0.3)', 
                color: '#a78bfa', fontSize: '0.75rem', padding: '0.5rem', cursor: 'pointer', borderRadius: '8px'
              }}
            >
              🛠️ Dev Mode: Bypass Role Check (For Testing)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in and not bypassed, show sign-in prompt
  if (status === 'unauthenticated' && !bypass) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080c14', padding: '2rem' }}>
        <div style={{
          maxWidth: '420px', width: '100%', padding: '2.5rem', 
          background: '#0c111e', border: '1px solid rgba(255,255,255,0.06)', 
          borderRadius: '16px', textAlign: 'center'
        }}>
          <div style={{ 
            width: 56, height: 56, borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' 
          }}>
            <ShieldAlert size={28} color="#8b5cf6" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Super Admin Sign In</h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
            Please sign in to access the platform administrative controls.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
            <button 
              className={styles.btnPrimary} 
              style={{ justifyContent: 'center', padding: '0.75rem' }}
              onClick={() => router.push('/')}
            >
              Sign In / Back to Store
            </button>
            <button 
              onClick={() => setBypass(true)}
              style={{
                background: 'transparent', border: '1px dashed rgba(139, 92, 246, 0.3)', 
                color: '#a78bfa', fontSize: '0.75rem', padding: '0.5rem', cursor: 'pointer', borderRadius: '8px'
              }}
            >
              🛠️ Dev Mode: Bypass Sign In (For Testing)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell} data-theme={theme}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoMark}>
            <div className={styles.logoIcon}>
              <ShieldAlert size={16} color="#fff" />
            </div>
            <span className={styles.logoText}>VogueSocial</span>
            <span className={styles.logoBadge}>ADMIN</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV.map((item, i) => {
            if ('section' in item) {
              return <div key={i} className={styles.navSection}>{item.section}</div>;
            }
            const Icon = item.icon!;
            const active = pathname === item.href;
            return (
              <button 
                key={item.href} 
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`} 
                onClick={() => router.push(item.href!)}
              >
                <Icon size={16} />
                {item.label}
                {active && <span className={styles.navDot} />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          {/* Theme Switcher Segmented Control */}
          {mounted && (
            <div style={{ display: 'flex', background: 'var(--d-hover)', borderRadius: '8px', padding: '2px', marginBottom: '1rem', border: '1px solid var(--d-border)' }}>
              <button 
                onClick={() => { setTheme('light'); localStorage.setItem('vogue_admin_theme', 'light'); }}
                style={{
                  flex: 1, padding: '6px', borderRadius: '6px', border: 'none', fontSize: '0.75rem', fontWeight: 600,
                  background: theme === 'light' ? 'var(--d-panel)' : 'transparent',
                  color: theme === 'light' ? 'var(--d-t1)' : 'var(--d-t4)',
                  boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                ☀️ Light
              </button>
              <button 
                onClick={() => { setTheme('dark'); localStorage.setItem('vogue_admin_theme', 'dark'); }}
                style={{
                  flex: 1, padding: '6px', borderRadius: '6px', border: 'none', fontSize: '0.75rem', fontWeight: 600,
                  background: theme === 'dark' ? 'var(--d-panel)' : 'transparent',
                  color: theme === 'dark' ? 'var(--d-t1)' : 'var(--d-t4)',
                  boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                🌙 Dark
              </button>
            </div>
          )}

          {/* Service Health Indicators */}
          <div className={styles.healthWidget}>
            <div className={styles.healthRow}>
              <span className={styles.healthName}>Stripe Connect</span>
              <span className={styles.healthStatus}>
                <span className={`${styles.pulseDot} ${styles.pulseGreen}`} />
                <span style={{ color: 'var(--color-emerald)' }}>Active</span>
              </span>
            </div>
            <div className={styles.healthMeta}>Separated Charges & Transfers</div>
          </div>

          <div className={styles.healthWidget}>
            <div className={styles.healthRow}>
              <span className={styles.healthName}>Shippo Webhook</span>
              <span className={styles.healthStatus}>
                <span className={`${styles.pulseDot} ${styles.pulseBlue}`} />
                <span style={{ color: 'var(--color-cyan)' }}>Listening</span>
              </span>
            </div>
            <div className={styles.healthMeta}>Poll frequency: real-time</div>
          </div>

          <div className={styles.userRow}>
            {session?.user?.image ? (
              <img src={session.user.image} alt="Admin" className={styles.userAvatar} />
            ) : (
              <div className={styles.userAvatar} style={{ display:'flex',alignItems:'center',justifyContent:'center', background:'#1f2937' }}>
                <ShieldAlert size={14} color="#8b5cf6" />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={styles.userName}>{session?.user?.name || 'Super Admin'}</div>
              <div className={styles.userRole}>Root Administrator</div>
            </div>
            <button className={styles.signOutBtn} onClick={() => signOut({ callbackUrl:'/' })} title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
