"use client";
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import styles from './merchant.module.css';
import { LayoutDashboard, ShoppingBag, Package, BarChart2, Wallet, Settings, Store, LogOut, Zap, Sun, Moon } from 'lucide-react';
import { MerchantThemeProvider, useMerchantTheme } from './ThemeContext';

const NAV = [
  { section: 'OVERVIEW' },
  { label: 'Dashboard', icon: LayoutDashboard, href: '/merchant/dashboard' },
  { label: 'Analytics', icon: BarChart2, href: '/merchant/analytics' },
  { section: 'COMMERCE' },
  { label: 'Orders', icon: ShoppingBag, href: '/merchant/orders' },
  { label: 'Products', icon: Package, href: '/merchant/products' },
  { section: 'AI & BILLING' },
  { label: 'Try-On API', icon: Zap, href: '/merchant/api-usage' },
  { section: 'FINANCE' },
  { label: 'Payouts', icon: Wallet, href: '/merchant/payouts' },
  { section: 'ACCOUNT' },
  { label: 'Settings', icon: Settings, href: '/merchant/settings' },
];

function MerchantShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useMerchantTheme();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/onboarding/merchant');
  }, [status, router]);

  if (status === 'loading') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0b0f19' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#cbf382,#34d399)',margin:'0 auto 1rem',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <Zap size={20} color="#0b0f19" />
        </div>
        <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.85rem' }}>Loading merchant portal...</p>
      </div>
    </div>
  );

  return (
    <div className={`${styles.shell} ${theme === 'light' ? styles.shellLight : ''}`}>
      {/* Sidebar — always dark */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoMark}>
            <div className={styles.logoIcon}><Store size={16} color="#0b0f19" /></div>
            <span className={styles.logoText}>VogueSocial</span>
            <span className={styles.logoBadge}>BIZ</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV.map((item, i) => {
            if ('section' in item) return <div key={i} className={styles.navSection}>{item.section}</div>;
            const Icon = item.icon!;
            const active = pathname === item.href;
            return (
              <button key={item.href} className={`${styles.navItem} ${active ? styles.navItemActive : ''}`} onClick={() => router.push(item.href!)}>
                <Icon size={16} />{item.label}
                {active && <span className={styles.navDot} />}
              </button>
            );
          })}
        </nav>

        {/* Theme toggle + user footer */}
        <div className={styles.sidebarFooter}>
          {/* Theme toggle row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.85rem', padding:'0.5rem 0' }}>
            <span style={{ fontSize:'0.72rem', fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
            <button
              onClick={toggle}
              style={{
                display:'flex', alignItems:'center', gap:6,
                background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(203,243,130,0.15)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(203,243,130,0.3)'}`,
                borderRadius:99, padding:'4px 12px', cursor:'pointer',
                fontSize:'0.72rem', fontWeight:700,
                color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#cbf382',
                transition:'all 0.2s'
              }}
              title="Toggle theme"
            >
              {theme === 'dark'
                ? <><Sun size={13} /><span>Light</span></>
                : <><Moon size={13} /><span>Dark</span></>}
            </button>
          </div>

          {/* User chip */}
          <div className={styles.userRow}>
            {session?.user?.image
              ? <img src={session.user.image} alt="" className={styles.userAvatar} />
              : <div className={styles.userAvatar} style={{ display:'flex',alignItems:'center',justifyContent:'center' }}><Store size={14} color="#cbf382" /></div>}
            <div style={{ flex:1, minWidth:0 }}>
              <div className={styles.userName}>{session?.user?.name || 'Merchant'}</div>
              <div className={styles.userRole}>Store Owner</div>
            </div>
            <button className={styles.signOutBtn} onClick={() => signOut({ callbackUrl:'/' })} title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <MerchantThemeProvider>
      <MerchantShell>{children}</MerchantShell>
    </MerchantThemeProvider>
  );
}
