"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../merchant.module.css';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, ArrowUpRight, Check, AlertCircle, Package, TrendingUp, CreditCard, History } from 'lucide-react';

const DAILY = [
  {d:'Apr 22',t:42,cost:1.26},{d:'Apr 23',t:67,cost:2.01},{d:'Apr 24',t:51,cost:1.53},
  {d:'Apr 25',t:89,cost:2.67},{d:'Apr 26',t:73,cost:2.19},{d:'Apr 27',t:112,cost:3.36},
  {d:'Apr 28',t:95,cost:2.85},{d:'Apr 29',t:529,cost:15.87},
];

const PRODUCT_USAGE = [
  {name:'Linen Blazer – Ivory',tries:312,converted:67,convRate:'21.5%',credits:312,thumb:'#a78bfa'},
  {name:'Silk Wrap Dress',tries:267,converted:48,convRate:'18.0%',credits:267,thumb:'#60a5fa'},
  {name:'Premium Cotton Kurta',tries:198,converted:34,convRate:'17.2%',credits:198,thumb:'#34d399'},
  {name:'Embroidered Palazzo',tries:143,converted:19,convRate:'13.3%',credits:143,thumb:'#fbbf24'},
  {name:'Floral Midi Dress',tries:89,converted:9,convRate:'10.1%',credits:89,thumb:'#f87171'},
];

const LOG = [
  {id:'VT-9821',product:'Linen Blazer',user:'u_***2af',result:'converted',credits:1,time:'2 min ago'},
  {id:'VT-9820',product:'Silk Wrap Dress',user:'u_***7bc',result:'browsed',credits:1,time:'4 min ago'},
  {id:'VT-9819',product:'Linen Blazer',user:'u_***4de',result:'browsed',credits:1,time:'7 min ago'},
  {id:'VT-9818',product:'Cotton Kurta',user:'u_***1fg',result:'converted',credits:1,time:'12 min ago'},
  {id:'VT-9817',product:'Palazzo Set',user:'u_***9gh',result:'browsed',credits:1,time:'18 min ago'},
  {id:'VT-9816',product:'Silk Wrap Dress',user:'u_***3ij',result:'converted',credits:1,time:'25 min ago'},
];

const PLANS = [
  {name:'Starter',price:'Free',credits:'200',overage:'$0.05',features:['200 try-ons/month','Basic analytics','Email support'],active:false},
  {name:'Growth',price:'$29',credits:'2,000',overage:'$0.03',features:['2,000 try-ons/month','Full analytics','Priority support','Credit rollover'],active:true},
  {name:'Pro',price:'$99',credits:'10,000',overage:'$0.02',features:['10,000 try-ons/month','Advanced analytics','Dedicated support','API access','Custom branding'],active:false},
  {name:'Enterprise',price:'Custom',credits:'Unlimited',overage:'Negotiated',features:['Unlimited try-ons','White-label','SLA guarantee','Custom integration','Account manager'],active:false},
];

const Tip = ({active,payload,label}:any) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:'var(--d-panel)',border:'1px solid var(--d-border)',borderRadius:8,padding:'10px 14px'}}>
      <div style={{fontSize:'0.72rem',color:'var(--d-t4)',marginBottom:4}}>{label}</div>
      {payload.map((p:any,i:number)=>(
        <div key={i} style={{color:p.color||'var(--d-chart)',fontWeight:700,fontSize:'0.85rem'}}>{p.name==='cost'?'$':''}{p.value}{p.name==='t'?' try-ons':p.name==='cost'?' cost':''}</div>
      ))}
    </div>
  );
};

export default function ApiUsagePage() {
  const router = useRouter();
  const [tab,setTab] = useState<'overview'|'products'|'logs'|'plans'>('overview');

  const creditsUsed = 1621; const creditsTotal = 2000;
  const usedPct = Math.round((creditsUsed/creditsTotal)*100);
  const r = 54; const circ = 2*Math.PI*r; const offset = circ*(1-usedPct/100);

  return (
    <>
      <div className={styles.topbar}>
        <div>
          <div className={styles.pageTitle}><Zap size={16} color="var(--d-chart)" style={{display:'inline',marginRight:6}}/>Try-On API Usage</div>
          <div className={styles.pageSubtitle}>Monitor credit consumption, per-product analytics, and billing</div>
        </div>
        <div className={styles.topbarRight}>
          <button className={styles.topupBtn}><Zap size={15}/>Top Up Credits</button>
        </div>
      </div>

      <div className={styles.pageContent}>

        {/* Top KPIs */}
        <div className={styles.kpiGrid} style={{marginBottom:'1rem'}}>
          {[
            {label:'Try-Ons This Month',value:'1,621',sub:'+34% vs last month',up:true,color:'#cbf382',icon:Zap},
            {label:'Credits Remaining',value:'379',sub:`${100-usedPct}% of plan left`,up:false,color:'#f87171',icon:AlertCircle},
            {label:'Conversion Rate',value:'18.4%',sub:'+2.1% vs last month',up:true,color:'#34d399',icon:TrendingUp},
            {label:'API Cost This Month',value:'$29.00',sub:'Flat Growth plan',up:true,color:'#a78bfa',icon:CreditCard},
          ].map(k=>{
            const Icon=k.icon;
            return (
              <div key={k.label} className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <div className={styles.kpiIconWrap} style={{background:`${k.color}15`}}><Icon size={18} color={k.color}/></div>
                  <span className={`${styles.kpiTrend} ${k.up?styles.trendUp:styles.trendDown}`}>
                    {k.up?<ArrowUpRight size={11}/>:null}{k.up?'↑':'↓'}
                  </span>
                </div>
                <div className={styles.kpiLabel}>{k.label}</div>
                <div className={styles.kpiValue}>{k.value}</div>
                <div className={styles.kpiSub}>{k.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className={styles.panel}>
          <div className={styles.tabs}>
            {(['overview','products','logs','plans'] as const).map(t=>(
              <button key={t} className={`${styles.tab} ${tab===t?styles.tabActive:''}`} onClick={()=>setTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {tab==='overview' && (
            <>
              <div className={`${styles.gridRow} ${styles.grid21}`} style={{padding:'1.25rem',gap:'1.25rem',marginBottom:0}}>
                {/* Try-on chart */}
                <div>
                  <div style={{fontSize:'0.78rem',fontWeight:600,color:'var(--d-t4)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'1rem'}}>Daily Try-On Sessions</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={DAILY} margin={{top:0,right:0,left:-15,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--d-border2)" vertical={false}/>
                      <XAxis dataKey="d" tick={{fontSize:10,fill:'var(--d-t4)'}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:'var(--d-t4)'}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<Tip/>}/>
                      <Bar dataKey="t" name="t" fill="var(--d-chart)" opacity={0.8} radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Credit ring */}
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                  <div style={{fontSize:'0.72rem',fontWeight:700,color:'var(--d-t4)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'1rem'}}>Monthly Credit Usage</div>
                  <div className={styles.creditRing}>
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--d-border2)" strokeWidth="10"/>
                      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#rg2)" strokeWidth="10"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round" transform="rotate(-90 70 70)"/>
                      <defs><linearGradient id="rg2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#cbf382"/><stop offset="100%" stopColor="#34d399"/></linearGradient></defs>
                    </svg>
                    <div className={styles.creditRingLabel}>
                      <div className={styles.creditUsed}>{usedPct}%</div>
                      <div className={styles.creditTotal}>{creditsUsed} / {creditsTotal}</div>
                    </div>
                  </div>
                  {usedPct>=80 && (
                    <div style={{marginTop:'1rem',padding:'0.6rem 1rem',background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:8,fontSize:'0.78rem',color:'#fbbf24',textAlign:'center',maxWidth:200}}>
                      ⚠ Running low on credits
                    </div>
                  )}
                </div>
              </div>

              {/* Cost chart */}
              <div style={{padding:'0 1.25rem 1.25rem'}}>
                <div style={{fontSize:'0.78rem',fontWeight:600,color:'var(--d-t4)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'1rem',marginTop:'0.5rem'}}>API Cost Over Time</div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={DAILY} margin={{top:0,right:0,left:-15,bottom:0}}>
                    <defs><linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2}/><stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--d-border2)"/>
                    <XAxis dataKey="d" tick={{fontSize:10,fill:'var(--d-t4)'}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:10,fill:'var(--d-t4)'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
                    <Tooltip content={<Tip/>}/>
                    <Area type="monotone" dataKey="cost" name="cost" stroke="#a78bfa" strokeWidth={2} fill="url(#gc)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* PRODUCTS TAB */}
          {tab==='products' && (
            <div className={styles.usageRow}>
              {PRODUCT_USAGE.map((p,i)=>{
                const maxTries = PRODUCT_USAGE[0].tries;
                return (
                  <div key={p.name} className={styles.usageItem}>
                    <div className={styles.usageTop}>
                      <div className={styles.usageName}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:p.thumb,flexShrink:0}}/>
                        {p.name}
                      </div>
                      <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:'0.7rem',color:'var(--d-t4)',fontWeight:600}}>TRY-ONS</div>
                          <div className={styles.usageCount}>{p.tries}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:'0.7rem',color:'var(--d-t4)',fontWeight:600}}>CONV.</div>
                          <div style={{fontSize:'0.82rem',fontWeight:700,color:'var(--d-chart)'}}>{p.convRate}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:'0.7rem',color:'var(--d-t4)',fontWeight:600}}>CREDITS</div>
                          <div style={{fontSize:'0.82rem',fontWeight:700,color:'var(--d-t2)'}}>{p.credits}</div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.usageBar}><div className={styles.usageBarFill} style={{width:`${Math.round((p.tries/maxTries)*100)}%`,background:`linear-gradient(90deg, ${p.thumb}99, ${p.thumb})`}}/></div>
                    <div className={styles.usageSub}>{p.converted} purchases from try-on · {p.tries} credits consumed</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LOGS TAB */}
          {tab==='logs' && (
            <table className={styles.table}>
              <thead><tr><th>Session ID</th><th>Product</th><th>User</th><th>Outcome</th><th>Credits</th><th>Time</th></tr></thead>
              <tbody>
                {LOG.map(l=>(
                  <tr key={l.id}>
                    <td style={{fontFamily:'monospace',fontSize:'0.78rem',color:'var(--d-t4)'}}>{l.id}</td>
                    <td style={{fontWeight:600,color:'var(--d-t1)'}}>{l.product}</td>
                    <td style={{fontFamily:'monospace',fontSize:'0.78rem',color:'var(--d-t4)'}}>{l.user}</td>
                    <td>
                      <span className={`${styles.badge} ${l.result==='converted'?styles.badgeDelivered:styles.badgeDraft}`}>
                        {l.result==='converted'?<Check size={10}/>:<Package size={10}/>}
                        {l.result==='converted'?'Converted':'Browsed'}
                      </span>
                    </td>
                    <td style={{color:'var(--d-chart)',fontWeight:700}}>1</td>
                    <td style={{color:'var(--d-t4)',fontSize:'0.78rem'}}>{l.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PLANS TAB */}
          {tab==='plans' && (
            <div className={styles.planGrid}>
              {PLANS.map(p=>(
                <div key={p.name} className={`${styles.planCard} ${p.active?styles.planCardActive:''}`}>
                  <div className={styles.planName}>{p.name}</div>
                  <div className={styles.planPrice}>{p.price}</div>
                  <div className={styles.planPriceSub}>{p.price==='Free'?'forever':p.price==='Custom'?'contact us':'/month'}</div>
                  <div className={styles.planCredits}>{p.credits} try-ons/month</div>
                  <div style={{fontSize:'0.73rem',color:'var(--d-t4)',marginBottom:'0.75rem'}}>Overage: {p.overage}/credit</div>
                  {p.features.map(f=>(
                    <div key={f} className={styles.planFeature}><Check size={12} color="#34d399"/>{f}</div>
                  ))}
                  <button className={`${styles.planBtn} ${p.active?styles.planBtnActive:''}`}>
                    {p.active?'Current Plan':p.price==='Custom'?'Contact Sales':'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
