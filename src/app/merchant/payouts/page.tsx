"use client";
import styles from '../merchant.module.css';
import { CheckCircle, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';

const HISTORY = [
  { id:'PAY-001', amount:'$127.40', date:'Apr 15, 2026', orders:2 },
  { id:'PAY-002', amount:'$89.00', date:'Apr 08, 2026', orders:1 },
  { id:'PAY-003', amount:'$215.50', date:'Mar 30, 2026', orders:3 },
];

export default function PayoutsPage() {
  return (
    <>
      <div className={styles.topbar}>
        <div>
          <div className={styles.pageTitle}>Payouts</div>
          <div className={styles.pageSubtitle}>Track your earnings and payment schedule</div>
        </div>
      </div>

      <div className={styles.pageContent}>
        {/* Balance Hero */}
        <div className={styles.payoutHero}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2rem'}}>
            <div>
              <div className={styles.payoutLabel}>Pending Balance</div>
              <div className={styles.payoutAmount}>$641.00</div>
              <div className={styles.payoutMeta}>Releases after delivery confirmation</div>
            </div>
            <div>
              <div className={styles.payoutLabel}>Total Earned (All Time)</div>
              <div className={styles.payoutAmount} style={{fontSize:'2.2rem'}}>$2,831</div>
              <div className={styles.payoutMeta}>Since joining VogueSocial</div>
            </div>
            <div>
              <div className={styles.payoutLabel}>Platform Commission</div>
              <div className={styles.payoutAmount} style={{fontSize:'2.2rem',opacity:0.6}}>5%</div>
              <div className={styles.payoutMeta}>Auto-deducted on each payout</div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className={styles.panel} style={{marginBottom:'1rem'}}>
          <div className={styles.panelHeader}><span className={styles.panelTitle}>How Payouts Work</span></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1px',background:'var(--d-border2)'}}>
            {[
              {icon:DollarSign,color:'#cbf382',colorL:'#16a34a',bg:'rgba(203,243,130,0.08)',bgL:'#f0fdf4',n:'01',title:'Customer Pays',desc:'When a user buys your product, payment is held securely by VogueSocial.'},
              {icon:TrendingUp,color:'#60a5fa',colorL:'#1d4ed8',bg:'rgba(96,165,250,0.08)',bgL:'#eff6ff',n:'02',title:'You Ship',desc:'Fulfill the order using your courier and enter the tracking ID in your dashboard.'},
              {icon:CheckCircle,color:'#34d399',colorL:'#059669',bg:'rgba(52,211,153,0.08)',bgL:'#ecfdf5',n:'03',title:'Payout Released',desc:'Once delivery is confirmed, your earnings (minus 5%) are transferred to your bank.'},
            ].map(s=>{
              const Icon = s.icon;
              return (
                <div key={s.n} style={{padding:'1.5rem',background:'var(--d-panel)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem'}}>
                    <div style={{width:36,height:36,borderRadius:8,background:'var(--d-card)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon size={16} color={s.color}/></div>
                    <span style={{fontSize:'0.68rem',fontWeight:800,color:'var(--d-t4)',letterSpacing:'0.1em'}}>STEP {s.n}</span>
                  </div>
                  <div style={{fontWeight:700,fontSize:'0.9rem',color:'var(--d-t1)',marginBottom:'0.35rem'}}>{s.title}</div>
                  <div style={{fontSize:'0.78rem',color:'var(--d-t3)',lineHeight:1.55}}>{s.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payout History */}
        <div className={styles.panel} style={{marginBottom:'1rem'}}>
          <div className={styles.panelHeader}><span className={styles.panelTitle}>Payout History</span></div>
          <table className={styles.table}>
            <thead><tr><th>Payout ID</th><th>Amount</th><th>Orders</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {HISTORY.map(p=>(
                <tr key={p.id}>
                  <td style={{fontFamily:'monospace',fontWeight:600,color:'var(--d-t2)'}}>{p.id}</td>
                  <td style={{fontWeight:700,color:'var(--d-chart)'}}>{p.amount}</td>
                  <td style={{color:'var(--d-t3)'}}>{p.orders} order{p.orders>1?'s':''}</td>
                  <td style={{color:'var(--d-t4)',fontSize:'0.82rem'}}>{p.date}</td>
                  <td><span className={`${styles.badge} ${styles.badgeDelivered}`}><CheckCircle size={10}/>Paid</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stripe Connect */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}><span className={styles.panelTitle}>Bank Account</span></div>
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>Connect your bank to receive payouts</div>
            <div className={styles.emptyText} style={{marginBottom:'1.25rem'}}>We use Stripe Connect to securely send payouts to any bank worldwide.</div>
            <button disabled style={{padding:'0.65rem 1.5rem',borderRadius:8,background:'var(--d-input)',border:'1px solid var(--d-border)',color:'var(--d-t4)',fontWeight:700,fontSize:'0.85rem',cursor:'not-allowed',display:'flex',alignItems:'center',gap:'0.5rem',margin:'0 auto'}}>
              Connect with Stripe <ArrowRight size={15}/> <span style={{fontSize:'0.7rem',opacity:0.6}}>Coming Soon</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
