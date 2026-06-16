"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../merchant.module.css';
import { Clock, Truck, CheckCircle, AlertCircle, Package, Search } from 'lucide-react';

const ALL_ORDERS = [
  { id:'#ORD-1841', product:'Premium Cotton Kurta', customer:'Aisha Malik', email:'aisha@mail.com', amount:'$49.00', status:'pending', date:'Apr 29, 2026', size:'M', qty:1, address:'14 Green St, Dubai, UAE' },
  { id:'#ORD-1842', product:'Linen Blazer – Ivory', customer:'Priya Sharma', email:'priya@mail.com', amount:'$129.00', status:'shipped', trackingId:'FX28301948IN', date:'Apr 28, 2026', size:'L', qty:1, address:'22 MG Road, Bangalore, India' },
  { id:'#ORD-1843', product:'Silk Wrap Dress', customer:'Sara Johnson', email:'sara@mail.com', amount:'$89.00', status:'delivered', date:'Apr 27, 2026', size:'S', qty:2, address:'5 Oak Ave, London, UK' },
  { id:'#ORD-1844', product:'Embroidered Palazzo Set', customer:'Riya Kapoor', email:'riya@mail.com', amount:'$75.00', status:'pending', date:'Apr 29, 2026', size:'XL', qty:1, address:'9 Park Lane, Mumbai, India' },
  { id:'#ORD-1845', product:'Floral Midi Dress', customer:'Fatima Al-Rashid', email:'fatima@mail.com', amount:'$95.00', status:'cancelled', date:'Apr 26, 2026', size:'M', qty:1, address:'Riyadh, Saudi Arabia' },
];

const SC: Record<string, {label:string;cls:string;icon:any}> = {
  pending:{label:'Pending',cls:styles.badgePending,icon:Clock},
  shipped:{label:'Shipped',cls:styles.badgeShipped,icon:Truck},
  delivered:{label:'Delivered',cls:styles.badgeDelivered,icon:CheckCircle},
  cancelled:{label:'Cancelled',cls:styles.badgeCancelled,icon:AlertCircle},
};

const TABS = ['All','Pending','Shipped','Delivered','Cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<typeof ALL_ORDERS>(ALL_ORDERS);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [trackingInput, setTrackingInput] = useState<Record<string,string>>({});
  const [trackingMap, setTrackingMap] = useState<Record<string,string>>({});
  const [selected, setSelected] = useState<(typeof ALL_ORDERS)[0]|null>(null);

  useEffect(() => {
    // Load from local storage if present
    const localOrdersStr = localStorage.getItem('vogue_social_orders');
    if (localOrdersStr) {
      try {
        const localOrders = JSON.parse(localOrdersStr);
        const formatted = localOrders.map((o: any) => ({
          id: o.id.startsWith('#') ? o.id : '#' + o.id,
          product: o.productName || 'Structured Wool Blazer',
          customer: o.customer?.full_name || 'Buyer',
          email: o.customer?.email || 'buyer@mail.com',
          amount: '$' + parseFloat(o.amount).toFixed(2),
          status: o.status || 'pending',
          trackingId: o.tracking_number || '',
          date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          size: 'M',
          qty: 1,
          address: o.shipping_address?.address || '123 Test St'
        }));
        
        // Merge them
        setOrders([...formatted, ...ALL_ORDERS]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const filtered = orders.filter(o => {
    const mt = activeTab==='All' || o.status===activeTab.toLowerCase();
    const ms = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()) || o.product.toLowerCase().includes(search.toLowerCase());
    return mt && ms;
  });

  const ship = (id:string) => {
    if (!trackingInput[id]) return;
    const cleanId = id.replace('#', '');
    setTrackingMap(p=>({...p,[id]:trackingInput[id]}));
    
    // Update local storage status
    const localOrdersStr = localStorage.getItem('vogue_social_orders');
    if (localOrdersStr) {
      try {
        const localOrders = JSON.parse(localOrdersStr);
        const updated = localOrders.map((o: any) => {
          if (o.id === cleanId) {
            return { ...o, status: 'shipped', tracking_number: trackingInput[id], courier: 'DHL' };
          }
          return o;
        });
        localStorage.setItem('vogue_social_orders', JSON.stringify(updated));
      } catch (e) {}
    }
    
    // Update state status
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return { ...o, status: 'shipped', trackingId: trackingInput[id] };
      }
      return o;
    }));

    alert(`✓ Tracking saved for ${id}`);
  };

  return (
    <>
      <div className={styles.topbar}>
        <div>
          <div className={styles.pageTitle}>Orders</div>
          <div className={styles.pageSubtitle}>Manage and fulfill customer orders</div>
        </div>
        <div className={styles.topbarRight}>
          <div className={styles.searchBar}>
            <Search size={14} color="var(--d-t4)"/>
            <input placeholder="Search orders..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.panel}>
          <div className={styles.tabs}>
            {TABS.map(t=>(
              <button key={t} className={`${styles.tab} ${activeTab===t?styles.tabActive:''}`} onClick={()=>setActiveTab(t)}>
                {t}
                <span className={`${styles.tabCount} ${activeTab===t?styles.tabCountActive:''}`}>
                  {ALL_ORDERS.filter(o=>t==='All'?true:o.status===t.toLowerCase()).length}
                </span>
              </button>
            ))}
          </div>
          <table className={styles.table}>
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Tracking / Action</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={7}><div className={styles.empty}><Package size={36} className={styles.emptyIcon}/><div className={styles.emptyTitle}>No orders found</div></div></td></tr>
              ) : filtered.map(o=>{
                const s=SC[o.status]; const Icon=s.icon;
                const saved = trackingMap[o.id]||o.trackingId;
                return (
                  <tr key={o.id}>
                    <td>
                      <div className={styles.orderProduct}>
                        <div className={styles.orderThumb}><Package size={14} color="var(--d-t4)"/></div>
                        <div><div className={styles.orderName}>{o.product}</div><div className={styles.orderMeta}>{o.id} · {o.qty}× · {o.size}</div></div>
                      </div>
                    </td>
                    <td><div style={{fontWeight:600,fontSize:'0.84rem',color:'var(--d-t2)'}}>{o.customer}</div><div style={{fontSize:'0.73rem',color:'var(--d-t4)'}}>{o.email}</div></td>
                    <td style={{fontWeight:700,color:'var(--d-t1)'}}>{o.amount}</td>
                    <td><span className={`${styles.badge} ${s.cls}`}><Icon size={10}/>{s.label}</span></td>
                    <td>
                      {saved ? <span className={styles.trackingCode}>{saved}</span>
                      : o.status==='pending' ? (
                        <div className={styles.trackingRow}>
                          <input className={styles.trackingInput} placeholder="Paste tracking ID..." value={trackingInput[o.id]||''} onChange={e=>setTrackingInput(p=>({...p,[o.id]:e.target.value}))}/>
                          <button className={styles.shipBtn} onClick={()=>ship(o.id)}>Ship ↗</button>
                        </div>
                      ) : <span style={{color:'var(--d-t4)',fontSize:'0.78rem'}}>—</span>}
                    </td>
                    <td style={{color:'var(--d-t4)',fontSize:'0.78rem'}}>{o.date}</td>
                    <td><button className={styles.actionBtn} onClick={()=>setSelected(o)}>Details</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className={styles.overlay} onClick={()=>setSelected(null)}>
          <div className={styles.modal} onClick={e=>e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Order {selected.id}</div>
              <button className={styles.closeBtn} onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {[['Product',selected.product],['Customer',selected.customer],['Email',selected.email],['Ship To',selected.address],['Size',selected.size],['Quantity',`${selected.qty}`],['Amount',selected.amount],['Date',selected.date],['Tracking',trackingMap[selected.id]||selected.trackingId||'Not assigned']].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'0.6rem 0',borderBottom:'1px solid var(--d-border2)'}}>
                  <span style={{fontSize:'0.78rem',color:'var(--d-t4)',fontWeight:600}}>{l}</span>
                  <span style={{fontSize:'0.84rem',fontWeight:600,color:'var(--d-t2)',textAlign:'right',maxWidth:'60%'}}>{v}</span>
                </div>
              ))}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnGhost} onClick={()=>setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
