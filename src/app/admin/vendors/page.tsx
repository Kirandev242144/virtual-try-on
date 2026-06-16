"use client";
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { Users, CheckCircle, ShieldAlert, AlertTriangle, Search, Check, RefreshCw } from 'lucide-react';

interface Vendor {
  id: string;
  full_name: string;
  email: string;
  vendor_status: 'pending_approval' | 'approved' | 'suspended';
  store_name: string;
  store_handle: string;
  store_category: string;
  created_at: string;
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'approved' | 'suspended'>('all');

  const loadVendors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/vendors');
      const data = await response.json();
      if (data.success && data.vendors) {
        setVendors(data.vendors);
      }
    } catch (e) {
      console.error("Failed to load vendors", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleAction = async (vendorId: string, action: 'approve' | 'suspend') => {
    try {
      const response = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, action })
      });
      const data = await response.json();
      if (data.success) {
        // Optimistically update the status locally for instantaneous UI response
        setVendors(prev => prev.map(v => {
          if (v.id === vendorId) {
            return {
              ...v,
              vendor_status: action === 'approve' ? 'approved' : 'suspended'
            };
          }
          return v;
        }));
      }
    } catch (e) {
      console.error("Error updating vendor status", e);
    }
  };

  const filtered = vendors.filter(v => {
    const matchesSearch = v.store_name.toLowerCase().includes(search.toLowerCase()) || 
                          v.email.toLowerCase().includes(search.toLowerCase()) ||
                          v.store_handle.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || v.vendor_status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className={`${styles.badge} ${styles.badgeActive}`}><CheckCircle size={10} /> Active</span>;
      case 'pending_approval':
        return <span className={`${styles.badge} ${styles.badgePending}`}><AlertTriangle size={10} /> Pending Approval</span>;
      case 'suspended':
        return <span className={`${styles.badge} ${styles.badgeSuspended}`}><ShieldAlert size={10} /> Suspended</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={styles.topbar}>
        <div>
          <div className={styles.pageTitle}>Vendor Directory</div>
          <div className={styles.pageSubtitle}>Review merchant store registrations, approvals, and credentials</div>
        </div>
        <div className={styles.topbarRight}>
          <button className={styles.btnGhost} onClick={loadVendors} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      <div className={styles.pageContent}>
        {/* Statistics row */}
        <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Pending Approvals</div>
            <div className={styles.kpiValue} style={{ color: 'var(--color-amber)' }}>
              {vendors.filter(v => v.vendor_status === 'pending_approval').length}
            </div>
            <div className={styles.kpiSub}>Awaiting compliance audit</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Active Storefronts</div>
            <div className={styles.kpiValue} style={{ color: 'var(--color-emerald)' }}>
              {vendors.filter(v => v.vendor_status === 'approved').length}
            </div>
            <div className={styles.kpiSub}>Authorized vendors selling live</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Suspended Accounts</div>
            <div className={styles.kpiValue} style={{ color: 'var(--color-rose)' }}>
              {vendors.filter(v => v.vendor_status === 'suspended').length}
            </div>
            <div className={styles.kpiSub}>Disabled due to rules violation</div>
          </div>
        </div>

        {/* Filters and search panel */}
        <div className={styles.panel} style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className={styles.searchBar}>
              <Search size={14} color="var(--d-t4)" />
              <input 
                placeholder="Search by store, owner, email..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['all', 'pending_approval', 'approved', 'suspended'] as const).map(tab => (
                <button
                  key={tab}
                  className={`${styles.actionBtn} ${filter === tab ? styles.actionBtnPrimary : ''}`}
                  onClick={() => setFilter(tab)}
                >
                  {tab === 'all' ? 'All Vendors' : 
                   tab === 'pending_approval' ? 'Pending' : 
                   tab === 'approved' ? 'Approved' : 'Suspended'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vendors list panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>
              <Users size={16} color="#8b5cf6" />
              Vendor Applications
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--d-t3)' }}>Loading vendor records...</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <Users size={40} className={styles.emptyIcon} style={{ color: 'var(--d-t4)' }} />
              <div className={styles.emptyTitle}>No vendors match criteria</div>
              <div className={styles.emptyText}>Try adjusting filters or checking query parameters.</div>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Store Details</th>
                  <th>Owner</th>
                  <th>Category</th>
                  <th>Date Joined</th>
                  <th>Verification Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--d-t1)' }}>{vendor.store_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--d-t4)' }}>@{vendor.store_handle}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--d-t2)' }}>{vendor.full_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--d-t4)' }}>{vendor.email}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', background: 'var(--d-hover)', border: '1px solid var(--d-border)', padding: '2px 8px', borderRadius: '4px' }}>
                        {vendor.store_category}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--d-t4)' }}>
                      {new Date(vendor.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td>{getStatusBadge(vendor.vendor_status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {vendor.vendor_status !== 'approved' && (
                          <button 
                            className={styles.actionBtnPrimary} 
                            style={{ display: 'flex', gap: 4, alignItems: 'center' }}
                            onClick={() => handleAction(vendor.id, 'approve')}
                          >
                            <Check size={12} />
                            Approve
                          </button>
                        )}
                        {vendor.vendor_status === 'approved' && (
                          <button 
                            className={styles.actionBtnDanger}
                            onClick={() => handleAction(vendor.id, 'suspend')}
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
