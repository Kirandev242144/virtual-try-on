"use client";
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Truck, 
  RefreshCw, 
  Send, 
  Terminal, 
  ChevronRight, 
  X, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

interface Dispute {
  id: string;
  order_id: string;
  reason: string;
  description: string;
  evidence_url: string;
  status: 'open' | 'under_review' | 'resolved_refunded' | 'resolved_released';
  admin_notes: string;
  created_at: string;
  order?: {
    id: string;
    amount: number;
    customer: { full_name: string; email: string };
    vendor: { store_name: string; store_handle: string };
  }
}

const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'disp-001',
    order_id: 'ORD-8241',
    reason: 'Damaged Item',
    description: 'The Premium Cotton Kurta arrived with a torn sleeve. See attached photos.',
    evidence_url: '/mock-evidence.jpg',
    status: 'open',
    admin_notes: '',
    created_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    order: {
      id: 'ORD-8241',
      amount: 129.00,
      customer: { full_name: 'Aisha Malik', email: 'aisha@mail.com' },
      vendor: { store_name: 'Studio Label Co', store_handle: 'studiolabel' }
    }
  },
  {
    id: 'disp-002',
    order_id: 'ORD-8240',
    reason: 'Item Not Received',
    description: 'Tracking status says shipped but the package has not arrived after 12 days.',
    evidence_url: '',
    status: 'under_review',
    admin_notes: 'Checking tracking status with DHL.',
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    order: {
      id: 'ORD-8240',
      amount: 75.00,
      customer: { full_name: 'Riya Kapoor', email: 'riya@mail.com' },
      vendor: { store_name: 'Urban Thread Delhi', store_handle: 'urbanthread' }
    }
  }
];

interface LogEntry {
  timestamp: string;
  type: 'info' | 'out' | 'in' | 'success' | 'warn' | 'error';
  message: string;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [noteInput, setNoteInput] = useState('');
  
  // Developer Webhook Console states
  const [simOrderId, setSimOrderId] = useState('ORD-8241');
  const [simCarrier, setSimCarrier] = useState('dhl');
  const [simTracking, setSimTracking] = useState('TRK-DHL-82410');
  const [simLoading, setSimLoading] = useState(false);
  const [responsePayload, setResponsePayload] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Initial console logs
    setLogs([
      { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'API Console: Shippo webhook simulator online.' },
      { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Escrow: Platform standard commission fixed at 5%.' },
      { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Stripe: Listening on live Express payouts endpoints.' }
    ]);
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/disputes');
      const data = await response.json();
      let mergedDisputes = data.success && data.disputes ? [...data.disputes] : [...MOCK_DISPUTES];
      
      // Load local storage disputed orders
      const localOrdersStr = localStorage.getItem('vogue_social_orders');
      if (localOrdersStr) {
        try {
          const localOrders = JSON.parse(localOrdersStr);
          localOrders.forEach((o: any) => {
            if (o.escrow_status === 'disputed' || o.escrow_status === 'refunded' || (o.escrow_status === 'released' && o.status === 'delivered')) {
              const exists = mergedDisputes.some((d: any) => d.order_id === o.id || d.id === 'disp_local_' + o.id);
              if (!exists) {
                mergedDisputes.unshift({
                  id: 'disp_local_' + o.id,
                  order_id: o.id,
                  reason: o.escrow_status === 'disputed' ? 'Damaged Product Claim' : 'Compliance Check',
                  description: o.escrow_status === 'disputed' ? 'The item arrived damaged. Customer requests a full refund.' : 'Automatic split payout processed successfully.',
                  evidence_url: '',
                  status: o.escrow_status === 'disputed' ? 'open' : 
                          o.escrow_status === 'refunded' ? 'resolved_refunded' : 'resolved_released',
                  admin_notes: o.admin_notes || '',
                  created_at: o.created_at,
                  order: {
                    id: o.id,
                    amount: o.amount,
                    customer: o.customer || { full_name: 'You (Buyer)', email: 'buyer@mail.com' },
                    vendor: o.vendor || { store_name: 'Studio Label Co', store_handle: 'studiolabel' }
                  }
                });
              }
            }
          });
        } catch (e) {}
      }

      setDisputes(mergedDisputes);
    } catch (e) {
      console.error("Failed to load disputes", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleResolve = async (disputeId: string, action: 'refund' | 'release' | 'review') => {
    try {
      const response = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId, action, notes: noteInput })
      });
      const data = await response.json();
      
      // Also update in local storage for visual sync
      if (selectedDispute) {
        const localOrdersStr = localStorage.getItem('vogue_social_orders');
        if (localOrdersStr) {
          try {
            const localOrders = JSON.parse(localOrdersStr);
            const updated = localOrders.map((o: any) => {
              if (o.id === selectedDispute.order_id) {
                return { 
                  ...o, 
                  status: action === 'refund' ? 'cancelled' : 'delivered',
                  escrow_status: action === 'refund' ? 'refunded' : 'released',
                  admin_notes: noteInput
                };
              }
              return o;
            });
            localStorage.setItem('vogue_social_orders', JSON.stringify(updated));
          } catch (e) {}
        }
      }

      // Add to dev logs
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        type: 'success',
        message: `ESCROW_SETTLE: Action ${action.toUpperCase()} processed on order ${selectedDispute?.order_id}.`
      }]);

      setSelectedDispute(null);
      setNoteInput('');
      loadDisputes();
    } catch (e) {
      console.error("Error resolving dispute", e);
    }
  };

  // Webhook carrier delivery simulation
  const runDeliveryWebhookSimulation = async () => {
    setSimLoading(true);
    setResponsePayload(null);
    setResponseStatus(null);
    setResponseLatency(null);

    const startTime = performance.now();
    const requestTimeStr = new Date().toLocaleTimeString();

    // Log outbound request trigger
    setLogs(prev => [...prev, {
      timestamp: requestTimeStr,
      type: 'out',
      message: `POST /api/webhooks/shipping (carrier=${simCarrier}, orderId=${simOrderId})`
    }]);

    try {
      const response = await fetch('/api/webhooks/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: simOrderId, 
          status: 'delivered',
          carrier: simCarrier,
          tracking_code: simTracking
        })
      });
      const data = await response.json();
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      setResponseStatus(response.status);
      setResponseLatency(latency);
      setResponsePayload(data);

      // Update order in local storage if exists
      const localOrdersStr = localStorage.getItem('vogue_social_orders');
      if (localOrdersStr) {
        try {
          const localOrders = JSON.parse(localOrdersStr);
          const updated = localOrders.map((o: any) => {
            if (o.id === simOrderId) {
              return { ...o, status: 'delivered', escrow_status: 'released' };
            }
            return o;
          });
          localStorage.setItem('vogue_social_orders', JSON.stringify(updated));
        } catch (e) {}
      }

      if (response.ok) {
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          type: 'in',
          message: `HTTP 200 OK (${latency}ms) - Escrow released. Payout scheduled.`
        }]);
        loadDisputes();
      } else {
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          message: `HTTP ${response.status} Failed (${latency}ms) - ${data.error || 'Server error'}`
        }]);
      }
    } catch (e: any) {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      setResponseStatus(500);
      setResponseLatency(latency);
      setResponsePayload({ error: e.message || 'Connection Refused' });
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        message: `HTTP 500 Network Error (${latency}ms) - ${e.message || e}`
      }]);
    } finally {
      setSimLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className={`${styles.badge} ${styles.badgePending}`}>New Dispute</span>;
      case 'under_review':
        return <span className={`${styles.badge} ${styles.badgeEscrowHeld}`}>Under Review</span>;
      case 'resolved_refunded':
        return <span className={`${styles.badge} ${styles.badgeEscrowRefunded}`}>Buyer Refunded</span>;
      case 'resolved_released':
        return <span className={`${styles.badge} ${styles.badgeEscrowReleased}`}>Escrow Released</span>;
      default:
        return null;
    }
  };

  // Safe Syntax Highlighting Renderer for JSON
  function SyntaxHighlightedJSON({ data }: { data: any }) {
    if (!data) return <span className={styles.consoleText}>No response payload received yet. Trigger the webhook above.</span>;
    const jsonString = JSON.stringify(data, null, 2);
    const lines = jsonString.split('\n');
    return (
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {lines.map((line, idx) => {
          const keyMatch = line.match(/^(\s*)"([^"]+)":/);
          if (keyMatch) {
            const indent = keyMatch[1];
            const key = keyMatch[2];
            const rest = line.substring(keyMatch[0].length);
            
            let valueElement: React.ReactNode = rest;
            const stringValMatch = rest.match(/^\s*"([^"]*)"(,?)$/);
            const numBoolMatch = rest.match(/^\s*([0-9.-]+|true|false|null)(,?)$/);
            
            if (stringValMatch) {
              valueElement = (
                <>
                  <span className={styles.consoleText}>"</span>
                  <span className={styles.consoleValue}>{stringValMatch[1]}</span>
                  <span className={styles.consoleText}>"</span>
                  {stringValMatch[2]}
                </>
              );
            } else if (numBoolMatch) {
              valueElement = (
                <>
                  <span className={styles.consoleKeyword}>{numBoolMatch[1]}</span>
                  {numBoolMatch[2]}
                </>
              );
            }
            
            return (
              <div key={idx}>
                <span className={styles.consoleText}>{indent}</span>
                <span className={styles.consoleJson}>"{key}"</span>
                <span className={styles.consoleText}>: </span>
                {valueElement}
              </div>
            );
          }
          return (
            <div key={idx} className={styles.consoleText}>
              {line}
            </div>
          );
        })}
      </pre>
    );
  }

  // Pre-configured Shippo Webhook Payload simulator visual representation
  const requestPayloadObj = {
    event: "tracker.updated",
    carrier: simCarrier,
    tracking_code: simTracking,
    status: "delivered",
    data: {
      orderId: simOrderId,
      recipient_confirmed: true,
      delivered_at: new Date().toISOString()
    }
  };

  return (
    <>
      <div className={styles.topbar}>
        <div>
          <div className={styles.pageTitle}>Escrow & Dispute Resolution</div>
          <div className={styles.pageSubtitle}>Review locked buyer payments, refunds, and shipping compliance claims</div>
        </div>
        <div className={styles.topbarRight}>
          <button className={styles.btnGhost} onClick={loadDisputes} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh Log
          </button>
        </div>
      </div>

      <div className={styles.pageContent}>
        
        {/* KPI Row */}
        <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Active Disputes</div>
            <div className={styles.kpiValue} style={{ color: 'var(--color-rose)' }}>
              {disputes.filter(d => ['open', 'under_review'].includes(d.status)).length}
            </div>
            <div className={styles.kpiSub}>Escrow funds frozen in arbitration</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Total Disputes Settled</div>
            <div className={styles.kpiValue} style={{ color: 'var(--color-emerald)' }}>
              {disputes.filter(d => ['resolved_released', 'resolved_refunded'].includes(d.status)).length}
            </div>
            <div className={styles.kpiSub}>Resolved disputes all-time</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Escrow Protection Policy</div>
            <div className={styles.kpiValue} style={{ fontSize: '1.5rem', color: 'var(--color-indigo)' }}>
              48 Hour Auto-Release
            </div>
            <div className={styles.kpiSub}>Split transfers cleared automatically</div>
          </div>
        </div>

        {/* Console Panel + Main Dispute List split grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Dispute Table list */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>
                <AlertTriangle size={16} color="var(--color-rose)" />
                Escrow Dispute Arbitration Board
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--d-t3)' }}>Loading claims...</div>
            ) : disputes.length === 0 ? (
              <div className={styles.empty}>
                <CheckCircle size={40} style={{ color: 'var(--color-emerald)', opacity: 0.5, margin: '0 auto 1rem', display: 'block' }} />
                <div className={styles.emptyTitle}>All clear! No open disputes</div>
                <div className={styles.emptyText}>All customer order escrows are executing smoothly.</div>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Claimant</th>
                    <th>Reason</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map((dispute) => (
                    <tr key={dispute.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--d-t1)' }}>{dispute.order?.customer?.full_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--d-t4)' }}>{dispute.order?.id}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--d-t2)' }}>{dispute.reason}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--d-t4)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {dispute.description}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--color-indigo)' }}>${dispute.order?.amount.toFixed(2)}</td>
                      <td>{getStatusBadge(dispute.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className={styles.actionBtnPrimary}
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setNoteInput(dispute.admin_notes || '');
                          }}
                        >
                          Review <ChevronRight size={12} style={{ display: 'inline', marginLeft: 2 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Webhook Delivery Simulator Console */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Console Inputs Panel */}
            <div className={styles.panel} style={{ border: '1px solid var(--d-border)' }}>
              <div className={styles.panelHeader} style={{ background: 'var(--d-hover)' }}>
                <span className={styles.panelTitle} style={{ color: 'var(--color-cyan)' }}>
                  <Truck size={16} />
                  Developer API Webhook Console
                </span>
              </div>
              
              <div style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--d-t3)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Inject carrier shipping updates directly to mock production behavior.
                  Simulating a <strong>delivered</strong> event clears the 48h settlement delay, releasing funds to the connected vendor.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className={styles.fGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.fLabel} style={{ color: 'var(--color-cyan)' }}>Order ID / Ref</label>
                    <input 
                      type="text" 
                      className={styles.fInput} 
                      style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                      value={simOrderId} 
                      onChange={e => setSimOrderId(e.target.value)}
                      placeholder="e.g. ORD-8241"
                    />
                  </div>
                  <div className={styles.fGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.fLabel} style={{ color: 'var(--color-cyan)' }}>Carrier</label>
                    <select 
                      className={styles.fSelect}
                      style={{ fontSize: '0.8rem' }}
                      value={simCarrier}
                      onChange={e => {
                        setSimCarrier(e.target.value);
                        setSimTracking(`TRK-${e.target.value.toUpperCase()}-${simOrderId.replace('ORD-', '')}`);
                      }}
                    >
                      <option value="dhl">DHL Express</option>
                      <option value="fedex">FedEx</option>
                      <option value="usps">USPS</option>
                      <option value="delhivery">Delhivery</option>
                    </select>
                  </div>
                </div>

                <div className={styles.fGroup} style={{ marginBottom: '1rem' }}>
                  <label className={styles.fLabel} style={{ color: 'var(--color-cyan)' }}>Tracking Code</label>
                  <input 
                    type="text" 
                    className={styles.fInput} 
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                    value={simTracking} 
                    onChange={e => setSimTracking(e.target.value)}
                  />
                </div>

                <button 
                  onClick={runDeliveryWebhookSimulation} 
                  className={styles.btnPrimary} 
                  style={{ 
                    width: '100%', 
                    background: 'linear-gradient(135deg, var(--color-cyan), #0284c7)', 
                    color: '#fff',
                    justifyContent: 'center',
                    display: 'flex',
                    gap: 6
                  }}
                  disabled={simLoading}
                >
                  <Send size={14} />
                  {simLoading ? 'POSTing Webhook Event...' : 'POST Event Webhook'}
                </button>
              </div>
            </div>

            {/* Developer Live Terminal Console */}
            <div className={styles.panel} style={{ border: '1px solid var(--d-border)' }}>
              <div className={styles.panelHeader} style={{ background: '#090d16', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className={styles.panelTitle} style={{ color: '#38bdf8', fontSize: '0.85rem' }}>
                  <Terminal size={14} style={{ marginRight: 4 }} />
                  HTTP Request Payload (Shippo Inbound Webhook)
                </span>
              </div>
              <div className={styles.codeConsole}>
                <div className={styles.codeHeader}>
                  <span className={styles.terminalDot} style={{ background: '#ef4444' }} />
                  <span className={styles.terminalDot} style={{ background: '#f59e0b' }} />
                  <span className={styles.terminalDot} style={{ background: '#10b981' }} />
                  <span style={{ color: 'var(--d-t4)', fontSize: '0.7rem', marginLeft: '0.5rem' }}>POST /api/webhooks/shipping</span>
                </div>
                <SyntaxHighlightedJSON data={requestPayloadObj} />
              </div>
            </div>

            {/* HTTP Response Panel */}
            <div className={styles.panel} style={{ border: '1px solid var(--d-border)' }}>
              <div className={styles.panelHeader} style={{ background: '#090d16', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className={styles.panelTitle} style={{ color: '#10b981', fontSize: '0.85rem' }}>
                  <Terminal size={14} style={{ marginRight: 4 }} />
                  HTTP Server Response Log
                </span>
                {responseStatus && (
                  <span className={styles.panelBadge} style={{ 
                    background: responseStatus === 200 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                    color: responseStatus === 200 ? 'var(--color-emerald)' : 'var(--color-rose)', 
                    borderColor: responseStatus === 200 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
                  }}>
                    {responseStatus} OK ({responseLatency}ms)
                  </span>
                )}
              </div>
              <div className={styles.codeConsole} style={{ minHeight: '120px' }}>
                <SyntaxHighlightedJSON data={responsePayload} />
              </div>
            </div>

            {/* Event Console Logs */}
            <div className={styles.panel} style={{ border: '1px solid var(--d-border)' }}>
              <div className={styles.panelHeader} style={{ background: 'var(--d-hover)' }}>
                <span className={styles.panelTitle} style={{ fontSize: '0.8rem' }}>
                  System Console Event Logs
                </span>
              </div>
              <div style={{ padding: '0.85rem', background: '#020617', minHeight: '90px', borderRadius: '0 0 16px 16px', overflowY: 'auto', maxHeight: '150px' }}>
                {logs.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>No event logs logged.</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className={styles.consoleLogLine}>
                      <span className={styles.consoleTime}>[{log.timestamp}]</span>
                      <span className={
                        log.type === 'info' ? styles.consoleInfo :
                        log.type === 'out' ? styles.consoleWarn :
                        log.type === 'in' ? styles.consoleInfo :
                        log.type === 'success' ? styles.consoleSuccess :
                        log.type === 'error' ? styles.consoleErr : styles.consoleText
                      }>
                        {log.type.toUpperCase()}:
                      </span>
                      <span style={{ color: '#e2e8f0', wordBreak: 'break-all' }}>{log.message}</span>
                    </div>
                  ))
                )}
                <span className={styles.consoleCursor} />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Side Slide-in Review Drawer */}
      {selectedDispute && (
        <div className={styles.overlayRight} onClick={() => setSelectedDispute(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            
            <div className={styles.drawerHeader}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-indigo)', fontWeight: 800, letterSpacing: '0.05em', display: 'block' }}>Dispute Settlement Panel</span>
                <span className={styles.modalTitle} style={{ fontSize: '1.2rem' }}>Order Record: {selectedDispute.order?.id}</span>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedDispute(null)}>
                <X size={16} />
              </button>
            </div>
            
            <div className={styles.drawerBody}>
              
              {/* Order Overview Split Grid */}
              <div style={{ border: '1px solid var(--d-border)', background: 'var(--d-hover)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--d-t4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer / Claimant</span>
                    <div style={{ fontWeight: 700, color: 'var(--d-t1)', marginTop: 4 }}>{selectedDispute.order?.customer?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-t3)', marginTop: 2 }}>{selectedDispute.order?.customer?.email}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--d-t4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Merchant / Vendor</span>
                    <div style={{ fontWeight: 700, color: 'var(--d-t1)', marginTop: 4 }}>{selectedDispute.order?.vendor?.store_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-t3)', marginTop: 2 }}>@{selectedDispute.order?.vendor?.store_handle}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--d-border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--d-t2)', fontWeight: 700 }}>Total Frozen Escrow Balance:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-indigo)' }}>
                    ${selectedDispute.order?.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Escrow Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                <div style={{ border: '1px solid var(--d-border)', borderRadius: '10px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--d-t4)', fontWeight: 700, textTransform: 'uppercase' }}>Vendor Earnings Split</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--d-t1)', marginTop: 4 }}>
                    ${(selectedDispute.order?.amount ? selectedDispute.order.amount * 0.95 : 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-t4)', marginTop: 2 }}>95% of total order payout</div>
                </div>
                <div style={{ border: '1px solid var(--d-border)', borderRadius: '10px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--d-t4)', fontWeight: 700, textTransform: 'uppercase' }}>Platform Fee (5%)</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-cyan)', marginTop: 4 }}>
                    ${(selectedDispute.order?.amount ? selectedDispute.order.amount * 0.05 : 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-t4)', marginTop: 2 }}>Fixed admin commission</div>
                </div>
              </div>

              {/* Claims Details */}
              <div className={styles.fGroup}>
                <label className={styles.fLabel}>Claim Details & Reason</label>
                <div style={{ fontSize: '0.85rem', color: 'var(--d-t2)', lineHeight: 1.6, background: 'var(--d-hover)', border: '1px solid var(--d-border)', borderRadius: '8px', padding: '1rem' }}>
                  <strong style={{ color: 'var(--d-t1)', display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                    Reason: {selectedDispute.reason}
                  </strong>
                  {selectedDispute.description}
                  {selectedDispute.evidence_url && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: 6 }}>
                      <a 
                        href="#" 
                        onClick={e => { e.preventDefault(); alert("Viewing evidence image attachment in full scale...") }}
                        style={{ fontSize: '0.75rem', color: 'var(--color-indigo)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                      >
                        <ExternalLink size={12} />
                        View Evidence Attachment (Image)
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Form */}
              <div className={styles.fGroup}>
                <label className={styles.fLabel}>Resolution Rationale (Administrative Notes)</label>
                <textarea 
                  className={styles.fTextarea} 
                  rows={4}
                  placeholder="Provide reasoning for the arbitration ruling, e.g. 'Evidence review shows damaged cuffs. Partial store credit was offered but buyer requests refund. Approved full return.'"
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  disabled={['resolved_released', 'resolved_refunded'].includes(selectedDispute.status)}
                />
              </div>

              {/* Status Banner */}
              {['resolved_released', 'resolved_refunded'].includes(selectedDispute.status) && (
                <div style={{ 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  background: 'rgba(5,150,105,0.06)', 
                  border: '1px solid rgba(5,150,105,0.2)', 
                  fontSize: '0.8rem', 
                  color: 'var(--color-emerald)', 
                  display: 'flex', 
                  gap: 8, 
                  alignItems: 'start' 
                }}>
                  <CheckCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: 2 }}>Case Settled Administratively</strong>
                    Notes: {selectedDispute.admin_notes || 'No notes left by system.'}
                  </div>
                </div>
              )}

            </div>

            <div className={styles.drawerFooter}>
              <button className={styles.btnGhost} onClick={() => setSelectedDispute(null)}>Close</button>
              
              {['open', 'under_review'].includes(selectedDispute.status) && (
                <>
                  <button 
                    className={styles.glowBtnRefund} 
                    onClick={() => handleResolve(selectedDispute.id, 'refund')}
                  >
                    Approve Buyer Refund
                  </button>
                  <button 
                    className={styles.glowBtnRelease}
                    onClick={() => handleResolve(selectedDispute.id, 'release')}
                  >
                    Release to Vendor
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
