"use client";
import styles from '../merchant.module.css';
import { useMerchantTheme } from '../ThemeContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, ShoppingBag, Users, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState } from 'react';

const RANGES = ['7D','30D','90D','1Y'];

const REVENUE = [
  {d:'Apr 22',rev:210,orders:4},{d:'Apr 23',rev:340,orders:7},{d:'Apr 24',rev:280,orders:5},
  {d:'Apr 25',rev:520,orders:10},{d:'Apr 26',rev:390,orders:8},{d:'Apr 27',rev:610,orders:12},
  {d:'Apr 28',rev:480,orders:9},{d:'Apr 29',rev:710,orders:14},
];

const CATEGORY = [
  {name:'Ethnic',value:38},{name:'Casual',value:27},{name:'Formal',value:21},{name:'Luxury',value:14},
];
const PIE_COLORS = ['#cbf382','#34d399','#60a5fa','#a78bfa'];

const FUNNEL = [
  {stage:'Store Visits',count:2840},{stage:'Product Views',count:1230},{stage:'Add to Cart',count:480},
  {stage:'Checkout',count:210},{stage:'Purchased',count:142},
];

const GEO = [
  {country:'India',pct:42,color:'#cbf382'},{country:'UAE',pct:24,color:'#34d399'},
  {country:'UK',pct:18,color:'#60a5fa'},{country:'USA',pct:10,color:'#a78bfa'},
  {country:'Others',pct:6,color:'rgba(255,255,255,0.2)'},
];

const CustomTooltip = ({active,payload,label}:any) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:'#1a2035',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'10px 14px',minWidth:120}}>
      <div style={{color:'rgba(255,255,255,0.4)',fontSize:'0.72rem',marginBottom:6}}>{label}</div>
      {payload.map((p:any,i:number)=>(
        <div key={i} style={{color:p.color,fontWeight:700,fontSize:'0.88rem'}}>{p.name==='rev'?'$':''}{p.value} {p.name==='rev'?'revenue':p.name==='orders'?'orders':''}</div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [range,setRange] = useState('7D');
  const {theme} = useMerchantTheme();
  const isDark = theme === 'dark';
  const c1 = isDark ? '#cbf382' : '#16a34a';
  const c2 = isDark ? '#60a5fa' : '#1d4ed8';
  const axisTick = isDark ? 'rgba(255,255,255,0.3)' : '#6b7280';
  const gridStroke = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const tooltipStyle = {background: isDark?'#1a2035':'#fff', border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e5e7eb'}`, borderRadius:8, fontSize:'0.82rem', color: isDark?'#fff':'#111827'};

  const METRICS = [
    {label:'Total Revenue',value:'$2,831',change:'+18.4%',up:true,icon:TrendingUp,color:'#cbf382'},
    {label:'Total Orders',value:'142',change:'+12.1%',up:true,icon:ShoppingBag,color:'#60a5fa'},
    {label:'Unique Visitors',value:'2,840',change:'+31.5%',up:true,icon:Users,color:'#a78bfa'},
    {label:'Conversion Rate',value:'5.0%',change:'-0.3%',up:false,icon:Eye,color:'#34d399'},
  ];

  return (
    <>
      <div className={styles.topbar}>
        <div>
          <div className={styles.pageTitle}>Analytics</div>
          <div className={styles.pageSubtitle}>Store performance and customer insights</div>
        </div>
        <div className={styles.topbarRight}>
          {RANGES.map(r=>(
            <button key={r} onClick={()=>setRange(r)}
              style={{padding:'0.45rem 0.9rem',borderRadius:7,border:'1px solid',
                borderColor:range===r?'#cbf382':'rgba(255,255,255,0.08)',
                background:range===r?'rgba(203,243,130,0.1)':'transparent',
                color:range===r?'#cbf382':'rgba(255,255,255,0.4)',
                fontWeight:700,fontSize:'0.78rem',cursor:'pointer',transition:'all 0.15s'}}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.pageContent}>
        {/* Metric Cards */}
        <div className={styles.kpiGrid} style={{marginBottom:'1.25rem'}}>
          {METRICS.map(m=>{
            const Icon = m.icon;
            return (
              <div key={m.label} className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <div className={styles.kpiIconWrap} style={{background:`${m.color}15`}}><Icon size={18} color={m.color}/></div>
                  <span className={`${styles.kpiTrend} ${m.up?styles.trendUp:styles.trendDown}`}>
                    {m.up?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>}{m.change}
                  </span>
                </div>
                <div className={styles.kpiLabel}>{m.label}</div>
                <div className={styles.kpiValue}>{m.value}</div>
              </div>
            );
          })}
        </div>

        {/* Revenue + Orders Chart */}
        <div className={styles.panel} style={{marginBottom:'1rem'}}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Revenue & Orders</span>
            <span style={{fontSize:'0.78rem',color:isDark?'rgba(255,255,255,0.3)':'#6b7280'}}>Last {range}</span>
          </div>
          <div style={{padding:'1.25rem'}}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={REVENUE} margin={{top:0,right:0,left:-15,bottom:0}}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c1} stopOpacity={0.2}/><stop offset="95%" stopColor={c1} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c2} stopOpacity={0.15}/><stop offset="95%" stopColor={c2} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
                <XAxis dataKey="d" tick={{fontSize:11,fill:axisTick}} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="left" tick={{fontSize:11,fill:axisTick}} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="right" orientation="right" tick={{fontSize:11,fill:axisTick}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle}/>
                <Area yAxisId="left" type="monotone" dataKey="rev" name="rev" stroke={c1} strokeWidth={2} fill="url(#gRev)"/>
                <Area yAxisId="right" type="monotone" dataKey="orders" name="orders" stroke={c2} strokeWidth={2} fill="url(#gOrd)"/>
              </AreaChart>
            </ResponsiveContainer>
            <div style={{display:'flex',gap:'1.5rem',paddingTop:'0.75rem',borderTop:`1px solid ${isDark?'rgba(255,255,255,0.04)':'#e5e7eb'}`}}>
              {[{color:c1,label:'Revenue'},{color:c2,label:'Orders'}].map(l=>(
                <div key={l.label} style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:l.color}}/>
                  <span style={{fontSize:'0.75rem',color:isDark?'rgba(255,255,255,0.35)':'#6b7280',fontWeight:600}}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3-col row */}
        <div className={`${styles.gridRow} ${styles.grid3}`}>
          {/* Category Breakdown */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}><span className={styles.panelTitle}>Sales by Category</span></div>
            <div style={{padding:'1.25rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={CATEGORY} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {CATEGORY.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]} stroke="none"/>)}
                  </Pie>
                  <Tooltip formatter={(v:any,n:any)=>[`${v}%`,n]}
                    contentStyle={{background:'#1a2035',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:'0.8rem'}}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',width:'100%',marginTop:'0.5rem'}}>
                {CATEGORY.map((c,i)=>(
                  <div key={c.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:PIE_COLORS[i]}}/>
                      <span style={{fontSize:'0.8rem',color:isDark?'rgba(255,255,255,0.6)':'#374151'}}>{c.name}</span>
                    </div>
                    <span style={{fontSize:'0.8rem',fontWeight:700,color:isDark?'#fff':'#111827'}}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}><span className={styles.panelTitle}>Conversion Funnel</span></div>
            <div style={{padding:'1rem 1.25rem',display:'flex',flexDirection:'column',gap:'0.65rem'}}>
              {FUNNEL.map((f,i)=>{
                const pct = Math.round((f.count/FUNNEL[0].count)*100);
                return (
                  <div key={f.stage}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.3rem'}}>
                      <span style={{fontSize:'0.78rem',color:isDark?'rgba(255,255,255,0.5)':'#4b5563',fontWeight:500}}>{f.stage}</span>
                      <span style={{fontSize:'0.78rem',fontWeight:700,color:isDark?'#fff':'#111827'}}>{f.count.toLocaleString()}</span>
                    </div>
                    <div style={{height:5,background:isDark?'rgba(255,255,255,0.05)':'#e5e7eb',borderRadius:99,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg, ${c1}, ${isDark?'#34d399':'#0d9488'})`,borderRadius:99,opacity:1-i*0.12}}/>
                    </div>
                    <div style={{fontSize:'0.7rem',color:isDark?'rgba(255,255,255,0.25)':'#6b7280',marginTop:'0.2rem'}}>{pct}% of visits</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Geo Breakdown */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}><span className={styles.panelTitle}>Top Markets</span></div>
            <div style={{padding:'1rem 1.25rem',display:'flex',flexDirection:'column',gap:'0.85rem'}}>
              {GEO.map((g,i)=>(
                <div key={g.country}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.35rem'}}>
                    <span style={{fontSize:'0.82rem',color:isDark?'rgba(255,255,255,0.65)':'#374151',fontWeight:600}}>{g.country}</span>
                    <span style={{fontSize:'0.82rem',fontWeight:800,color:isDark?'#fff':'#111827'}}>{g.pct}%</span>
                  </div>
                  <div style={{height:5,background:isDark?'rgba(255,255,255,0.05)':'#e5e7eb',borderRadius:99,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${g.pct}%`,background:PIE_COLORS[Math.min(i,PIE_COLORS.length-1)],borderRadius:99}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Orders Bar Chart */}
        <div className={styles.panel} style={{marginTop:'1rem'}}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Orders Per Day</span>
          </div>
          <div style={{padding:'1.25rem'}}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={REVENUE} margin={{top:0,right:0,left:-15,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false}/>
                <XAxis dataKey="d" tick={{fontSize:11,fill:axisTick}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:axisTick}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle}/>
                <Bar dataKey="orders" fill={isDark?'rgba(203,243,130,0.7)':'#16a34a'} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
