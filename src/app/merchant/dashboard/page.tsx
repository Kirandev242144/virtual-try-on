"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '../merchant.module.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMerchantTheme } from '../ThemeContext';
import {
  TrendingUp, ShoppingBag, Package, DollarSign,
  ArrowUpRight, ArrowRight, Clock, Truck, CheckCircle,
  AlertCircle, Plus, Zap, Eye, ArrowDownRight
} from 'lucide-react';

const REVENUE_DATA = [
  {d:'Mon',rev:210},{d:'Tue',rev:340},{d:'Wed',rev:280},
  {d:'Thu',rev:520},{d:'Fri',rev:390},{d:'Sat',rev:610},{d:'Sun',rev:480},
];
const VTON_DATA = [
  {d:'Mon',t:42},{d:'Tue',t:67},{d:'Wed',t:51},{d:'Thu',t:89},{d:'Fri',t:73},{d:'Sat',t:112},{d:'Sun',t:95},
];
const ORDERS = [
  {id:'#1841',product:'Premium Cotton Kurta',customer:'Aisha Malik',amount:'$49',status:'pending',date:'Today, 9:14 AM',size:'M'},
  {id:'#1842',product:'Linen Blazer – Ivory',customer:'Priya Sharma',amount:'$129',status:'shipped',tracking:'FX28301948IN',date:'Yesterday, 3:42 PM',size:'L'},
  {id:'#1843',product:'Silk Wrap Dress',customer:'Sara Johnson',amount:'$89',status:'delivered',date:'Apr 27',size:'S'},
  {id:'#1844',product:'Embroidered Palazzo',customer:'Riya Kapoor',amount:'$75',status:'pending',date:'Today, 7:01 AM',size:'XL'},
];
const ACTIVITY = [
  {color:'#34d399',text:<>Virtual try-on for <strong>Linen Blazer</strong> — user converted to purchase</>,time:'2 min ago'},
  {color:'#60a5fa',text:<><strong>Riya Kapoor</strong> placed a new order (#1844)</>,time:'7 min ago'},
  {color:'#cbf382',text:<>67 try-on attempts on <strong>Silk Wrap Dress</strong> today</>,time:'1h ago'},
  {color:'#a78bfa',text:<>Your monthly <strong>credit usage</strong> hit 80% — consider upgrading</>,time:'3h ago'},
  {color:'#f87171',text:<>Order <strong>#1840</strong> marked as delivered, payout queued</>,time:'5h ago'},
];
const SC: Record<string,{label:string;cls:string;icon:any}> = {
  pending:{label:'Pending',cls:styles.badgePending,icon:Clock},
  shipped:{label:'Shipped',cls:styles.badgeShipped,icon:Truck},
  delivered:{label:'Delivered',cls:styles.badgeDelivered,icon:CheckCircle},
  cancelled:{label:'Cancelled',cls:styles.badgeCancelled,icon:AlertCircle},
};
const Tip = ({active,payload}:any) => {
  if(!active||!payload?.length) return null;
  return <div style={{background:'#1a2035',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 12px'}}><div style={{color:'#cbf382',fontWeight:700}}>{payload[0].name==='rev'?'$':''}{payload[0].value}</div></div>;
};

export default function MerchantDashboard() {
  const {data:session} = useSession();
  const router = useRouter();
  const {theme} = useMerchantTheme();
  const isDark = theme === 'dark';
  const chartColor = isDark ? '#cbf382' : '#16a34a';
  const chartFill = isDark ? 'rgba(203,243,130,0.18)' : 'rgba(22,163,74,0.1)';
  const vtonColor = isDark ? '#34d399' : '#0d9488';
  const vtonFill = isDark ? 'rgba(52,211,153,0.18)' : 'rgba(13,148,136,0.1)';
  const [trackingInput,setTrackingInput] = useState<Record<string,string>>({});
  const [trackingMap,setTrackingMap] = useState<Record<string,string>>({});
  const name = session?.user?.name?.split(' ')[0] || 'there';
  const ship = (id:string) => { if(!trackingInput[id]) return; setTrackingMap(p=>({...p,[id]:trackingInput[id]})); };

  // Credit usage (out of 2000)
  const creditsUsed = 1621; const creditsTotal = 2000;
  const usedPct = Math.round((creditsUsed/creditsTotal)*100);
  const r = 54; const circ = 2*Math.PI*r;
  const offset = circ*(1-usedPct/100);

  return (
    <>
      {/* Topbar */}
      <div className={styles.topbar}>
        <div>
          <div className={styles.pageTitle}>Dashboard</div>
          <div className={styles.pageSubtitle}>Your store overview and live activity</div>
        </div>
        <div className={styles.topbarRight}>
          <button className={styles.btnGhost} onClick={()=>router.push('/merchant/analytics')}><TrendingUp size={15}/>Analytics</button>
          <button className={styles.btnPrimary} onClick={()=>router.push('/merchant/products')}><Plus size={15}/>Add Product</button>
        </div>
      </div>

      <div className={styles.pageContent}>

        {/* Hero Banner */}
        <div className={styles.dashBanner}>
          <div>
            <div className={styles.bannerGreet}>Good morning, {name} 👋</div>
            <div className={styles.bannerSub}>Tuesday, Apr 29 · Growth Plan · <span className={styles.vtonBadge}><Zap size={10}/>Virtual Try-On Active</span></div>
          </div>
          <div className={styles.bannerStats}>
            <div className={styles.bannerStat}><div className={styles.bannerStatVal}>$2,831</div><div className={styles.bannerStatLabel}>Month Revenue</div></div>
            <div style={{width:1,background:'rgba(255,255,255,0.07)'}}/>
            <div className={styles.bannerStat}><div className={styles.bannerStatVal}>529</div><div className={styles.bannerStatLabel}>Try-Ons Today</div></div>
            <div style={{width:1,background:'rgba(255,255,255,0.07)'}}/>
            <div className={styles.bannerStat}><div className={styles.bannerStatVal}>18.4%</div><div className={styles.bannerStatLabel}>Conversion</div></div>
          </div>
        </div>

        {/* KPI Row */}
        <div className={styles.kpiGrid} style={{marginBottom:'1rem'}}>
          {[
            {label:'Total Revenue',value:'$2,831',sub:'+18% this month',trend:'up',icon:DollarSign,color:'#cbf382'},
            {label:'Active Orders',value:'12',sub:'4 awaiting shipment',trend:'neutral',icon:ShoppingBag,color:'#60a5fa'},
            {label:'Products Listed',value:'24',sub:'3 low stock',trend:'neutral',icon:Package,color:'#a78bfa'},
            {label:'Try-On Credits Left',value:'379',sub:`${usedPct}% used this month`,trend:usedPct>80?'down':'up',icon:Zap,color:'#34d399'},
          ].map(k=>{
            const Icon=k.icon;
            return (
              <div key={k.label} className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <div className={styles.kpiIconWrap} style={{background:`${k.color}15`}}><Icon size={18} color={k.color}/></div>
                  <span className={`${styles.kpiTrend} ${k.trend==='up'?styles.trendUp:k.trend==='down'?styles.trendDown:styles.trendNeutral}`}>
                    {k.trend==='up'?<ArrowUpRight size={11}/>:k.trend==='down'?<ArrowDownRight size={11}/>:null}
                  </span>
                </div>
                <div className={styles.kpiLabel}>{k.label}</div>
                <div className={styles.kpiValue}>{k.value}</div>
                <div className={styles.kpiSub}>{k.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className={`${styles.gridRow} ${styles.grid21}`} style={{marginBottom:'1rem'}}>
          {/* Revenue chart */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Weekly Revenue</span>
              <span style={{fontSize:'0.78rem',color:'#34d399',fontWeight:700}}>+$1,241 this week <ArrowUpRight size={12} style={{display:'inline'}}/></span>
            </div>
            <div style={{padding:'1.25rem'}}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={REVENUE_DATA} margin={{top:0,right:0,left:-20,bottom:0}}>
                  <defs>
                    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/><stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.05)'}/>
                  <XAxis dataKey="d" tick={{fontSize:11,fill:isDark?'rgba(255,255,255,0.3)':'#6b7280'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:isDark?'rgba(255,255,255,0.3)':'#6b7280'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<Tip/>}/>
                  <Area type="monotone" dataKey="rev" name="rev" stroke={chartColor} strokeWidth={2} fill="url(#gr)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Mini metric strip */}
            <div className={styles.metricRow}>
              {[{l:'Avg Order',v:'$85'},{l:'Orders',v:'34'},{l:'Refunds',v:'2'},{l:'AOV Growth',v:'+4%'}].map(m=>(
                <div key={m.l} className={styles.metricItem}><div className={styles.metricLabel}>{m.l}</div><div className={styles.metricValue}>{m.v}</div></div>
              ))}
            </div>
          </div>

          {/* Virtual Try-On Panel */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}><Zap size={14} color="#cbf382"/>Try-On API</span>
              <button className={styles.panelAction} onClick={()=>router.push('/merchant/api-usage')}>Manage <ArrowRight size={13}/></button>
            </div>

            {/* Credit ring */}
            <div className={styles.creditRingWrap}>
              <div className={styles.creditRing}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                  <circle cx="70" cy="70" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="10"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" transform="rotate(-90 70 70)" style={{transition:'stroke-dashoffset 0.8s ease'}}/>
                  <defs>
                    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#cbf382"/><stop offset="100%" stopColor="#34d399"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className={styles.creditRingLabel}>
                  <div className={styles.creditUsed}>{creditsUsed}</div>
                  <div className={styles.creditTotal}>of {creditsTotal} used</div>
                </div>
              </div>
              <div className={styles.creditStats}>
                {[{l:'Plan',v:'Growth · $29/mo'},{l:'Resets',v:'May 1, 2026'},{l:'Remaining',v:`${creditsTotal-creditsUsed} credits`},{l:'Overage Rate',v:'$0.03/credit'}].map(s=>(
                  <div key={s.l} className={styles.creditStat}><span className={styles.creditStatLabel}>{s.l}</span><span className={styles.creditStatValue}>{s.v}</span></div>
                ))}
              </div>
            </div>
            {usedPct>=80&&<div className={styles.noticeStrip}>⚠ {usedPct}% of credits used — upgrade or add top-up</div>}
          </div>
        </div>

        {/* Try-On activity chart */}
        <div className={`${styles.gridRow} ${styles.grid21}`} style={{marginBottom:'1rem'}}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}><Eye size={14} color="rgba(255,255,255,0.4)"/>Try-On Activity (7 days)</span>
              <span style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.3)'}}>529 sessions this week</span>
            </div>
            <div style={{padding:'1.25rem'}}>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={VTON_DATA} margin={{top:0,right:0,left:-20,bottom:0}}>
                  <defs>
                    <linearGradient id="gt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={vtonColor} stopOpacity={0.2}/><stop offset="95%" stopColor={vtonColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.05)'}/>
                  <XAxis dataKey="d" tick={{fontSize:10,fill:isDark?'rgba(255,255,255,0.3)':'#6b7280'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:isDark?'rgba(255,255,255,0.3)':'#6b7280'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<Tip/>}/>
                  <Area type="monotone" dataKey="t" name="t" stroke={vtonColor} strokeWidth={2} fill="url(#gt)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Live Activity</span>
              <span style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'#34d399',fontWeight:600}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:'#34d399',display:'inline-block',animation:'pulse 2s infinite'}}/>LIVE
              </span>
            </div>
            <div className={styles.activityFeed}>
              {ACTIVITY.map((a,i)=>(
                <div key={i} className={styles.activityItem}>
                  <div className={styles.activityDot} style={{background:a.color}}/>
                  <div>
                    <div className={styles.activityText}>{a.text}</div>
                    <div className={styles.activityTime}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Recent Orders <span className={styles.panelBadge}>4</span></div>
            <button className={styles.panelAction} onClick={()=>router.push('/merchant/orders')}>View all <ArrowRight size={13}/></button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr><th>Product</th><th>Customer</th><th>Amount</th><th>Status</th><th>Tracking</th><th>Date</th></tr>
            </thead>
            <tbody>
              {ORDERS.map(o=>{
                const s=SC[o.status]; const Icon=s.icon;
                const saved=trackingMap[o.id]||o.tracking;
                return (
                  <tr key={o.id}>
                    <td><div className={styles.orderProduct}><div className={styles.orderThumb}><Package size={15} color="rgba(255,255,255,0.2)"/></div><div><div className={styles.orderName}>{o.product}</div><div className={styles.orderMeta}>{o.id} · {o.size}</div></div></div></td>
                    <td style={{color:'rgba(255,255,255,0.7)'}}>{o.customer}</td>
                    <td style={{fontWeight:700,color:'#fff'}}>{o.amount}</td>
                    <td><span className={`${styles.badge} ${s.cls}`}><Icon size={10}/>{s.label}</span></td>
                    <td>
                      {saved?<span className={styles.trackingCode}>{saved}</span>
                      :o.status==='pending'?(
                        <div className={styles.trackingRow}>
                          <input className={styles.trackingInput} placeholder="Tracking ID" value={trackingInput[o.id]||''} onChange={e=>setTrackingInput(p=>({...p,[o.id]:e.target.value}))}/>
                          <button className={styles.shipBtn} onClick={()=>ship(o.id)}>Ship ↗</button>
                        </div>
                      ):<span style={{color:'rgba(255,255,255,0.2)',fontSize:'0.78rem'}}>—</span>}
                    </td>
                    <td style={{color:'rgba(255,255,255,0.3)',fontSize:'0.78rem'}}>{o.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
