"use client";
import { useState, useEffect } from 'react';
import styles from '../merchant.module.css';
import { Package, Plus, Edit2, Trash2, Search, ImagePlus, RefreshCw, Facebook, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const CATS = ['Casual', 'Formal', 'Ethnic', 'Streetwear', 'Luxury', 'Athleisure', 'Vintage'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BLANK = { name: '', price: '', category: '', stock: '', desc: '', sizes: [] as string[] };

export default function ProductsPage() {
    const [tab, setTab] = useState<'catalog' | 'facebook'>('catalog');
    
    // Catalog states
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState(BLANK);
    const [imgPreview, setImgPreview] = useState<string | null>(null);

    // Facebook states
    const [fbSettings, setFbSettings] = useState({
        connected: false,
        page_name: '',
        catalog_name: '',
        auto_sync: false,
        clothing_only: true,
        logs: [] as any[]
    });
    const [syncLoading, setSyncLoading] = useState(false);

    // Load initial data
    useEffect(() => {
        loadProducts();
        loadFbSettings();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/merchant/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.products || []);
            }
        } catch (err) {
            console.error("Failed to load products:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadFbSettings = async () => {
        try {
            const res = await fetch('/api/merchant/facebook/sync');
            const data = await res.json();
            if (data.success) {
                setFbSettings(data.settings);
            }
        } catch (err) {
            console.error("Failed to load FB settings:", err);
        }
    };

    const saveFbSettings = async (newSettings: any) => {
        try {
            const res = await fetch('/api/merchant/facebook/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save_settings',
                    settings: newSettings
                })
            });
            const data = await res.json();
            if (data.success) {
                setFbSettings(data.settings);
            }
        } catch (err) {
            console.error("Failed to save FB settings:", err);
        }
    };

    const triggerFbSyncSilent = async () => {
        try {
            await fetch('/api/merchant/facebook/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'export' })
            });
            loadFbSettings(); // refresh logs
        } catch (err) {}
    };

    const triggerFbSync = async (actionType: 'export' | 'import') => {
        setSyncLoading(true);
        try {
            const res = await fetch('/api/merchant/facebook/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: actionType })
            });
            const data = await res.json();
            if (data.success) {
                setFbSettings(data.settings);
                if (actionType === 'import') {
                    loadProducts();
                }
            } else {
                alert(`Sync failed: ${data.error}`);
            }
        } catch (err) {
            alert("Sync failed due to connection error.");
        } finally {
            setSyncLoading(false);
        }
    };

    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    const openNew = () => { 
        setEditing(null); 
        setForm(BLANK); 
        setImgPreview(null); 
        setShowModal(true); 
    };

    const openEdit = (p: any) => { 
        setEditing(p); 
        setForm({
            name: p.name,
            price: String(p.price),
            category: p.category,
            stock: String(p.stock),
            desc: p.desc,
            sizes: p.sizes
        }); 
        setImgPreview(p.image_url || null);
        setShowModal(true); 
    };

    const del = async (id: string) => { 
        if (confirm('Delete this product from your store database?')) {
            try {
                const res = await fetch(`/api/merchant/products?id=${id}`, {
                    method: 'DELETE'
                });
                const data = await res.json();
                if (data.success) {
                    loadProducts();
                    if (fbSettings.auto_sync && fbSettings.connected) {
                        triggerFbSyncSilent();
                    }
                } else {
                    alert(`Delete failed: ${data.error}`);
                }
            } catch (err) {
                alert("Delete failed due to network error.");
            }
        }
    };

    const toggleSize = (s: string) => 
        setForm(p => ({
            ...p,
            sizes: p.sizes.includes(s) ? p.sizes.filter(x => x !== s) : [...p.sizes, s]
        }));

    const save = async () => {
        if (!form.name || !form.price) return alert('Name and price required.');
        
        const payload = {
            id: editing?.id || undefined,
            name: form.name,
            price: Number(form.price),
            category: form.category || 'Casual',
            stock: Number(form.stock) || 0,
            sizes: form.sizes,
            desc: form.desc,
            image_url: imgPreview || undefined
        };

        try {
            const res = await fetch('/api/merchant/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                loadProducts();
                setShowModal(false);
                if (fbSettings.auto_sync && fbSettings.connected) {
                    triggerFbSyncSilent();
                }
            } else {
                alert(`Save failed: ${data.error}`);
            }
        } catch (err) {
            alert("Save failed due to network error.");
        }
    };

    const toggleFbConnection = () => {
        const nextState = !fbSettings.connected;
        const updated = {
            ...fbSettings,
            connected: nextState,
            page_name: nextState ? 'VogueSocial Boutique' : '',
            catalog_name: nextState ? 'VS_Apparel_Catalog' : ''
        };
        saveFbSettings(updated);
    };

    return (
        <>
            <div className={styles.topbar}>
                <div>
                    <div className={styles.pageTitle}>Products & Integrations</div>
                    <div className={styles.pageSubtitle}>Manage store products and Meta Catalog sync rules</div>
                </div>
                {tab === 'catalog' && (
                    <div className={styles.topbarRight}>
                        <div className={styles.searchBar}>
                            <Search size={14} color="var(--d-t4)" />
                            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <button className={styles.btnPrimary} onClick={openNew}><Plus size={15} />Add Product</button>
                    </div>
                )}
            </div>

            <div className={styles.pageContent}>
                {/* Custom Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--d-border2)', marginBottom: '1.75rem', gap: '1.5rem' }}>
                    <button
                        onClick={() => setTab('catalog')}
                        style={{
                            padding: '0.75rem 0.25rem', background: 'none', border: 'none', outline: 'none',
                            borderBottom: tab === 'catalog' ? '2.5px solid var(--d-chart)' : '2.5px solid transparent',
                            color: tab === 'catalog' ? 'var(--d-t1)' : 'var(--d-t3)', fontWeight: 700,
                            cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
                        }}
                    >
                        <Package size={15} /> Product Catalog
                    </button>
                    <button
                        onClick={() => setTab('facebook')}
                        style={{
                            padding: '0.75rem 0.25rem', background: 'none', border: 'none', outline: 'none',
                            borderBottom: tab === 'facebook' ? '2.5px solid var(--d-chart)' : '2.5px solid transparent',
                            color: tab === 'facebook' ? 'var(--d-t1)' : 'var(--d-t3)', fontWeight: 700,
                            cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
                        }}
                    >
                        <Facebook size={15} /> Facebook Shop Sync
                    </button>
                </div>

                {/* TAB 1: PRODUCT CATALOG */}
                {tab === 'catalog' && (
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div className={styles.panelTitle}>Store Products <span className={styles.panelBadge}>{filtered.length}</span></div>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: 'var(--d-t3)' }}>
                                <RefreshCw size={24} className="animate-spin" style={{ marginRight: 8 }} /> Loading catalog...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className={styles.empty}>
                                <Package size={40} className={styles.emptyIcon} />
                                <div className={styles.emptyTitle}>No products found</div>
                                <div className={styles.emptyText}>Add products or click Facebook Import to populate clothing items.</div>
                                <button className={styles.btnPrimary} style={{ marginTop: '1rem' }} onClick={openNew}><Plus size={15} />Add Product</button>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Sizes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div className={styles.orderProduct}>
                                                    <div className={styles.orderThumb}>
                                                        {p.image_url ? (
                                                            <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                                                        ) : (
                                                            <Package size={14} color="var(--d-t4)" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className={styles.orderName}>{p.name}</div>
                                                        <div className={styles.orderMeta}>{p.desc ? (p.desc.substring(0, 45) + '…') : 'No description'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ background: 'var(--d-t5)', padding: '2px 9px', borderRadius: 99, fontSize: '0.73rem', fontWeight: 600, color: 'var(--d-t3)' }}>
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--d-t1)' }}>${p.price}</td>
                                            <td>
                                                <span style={{ color: p.stock < 5 ? '#f87171' : 'var(--d-t2)', fontWeight: 600, fontSize: '0.84rem' }}>
                                                    {p.stock} units
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                                    {p.sizes && p.sizes.map((s: string) => (
                                                        <span key={s} style={{ background: 'var(--d-t5)', border: '1px solid var(--d-border)', padding: '1px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, color: 'var(--d-t3)' }}>
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className={styles.iconBtn} onClick={() => openEdit(p)} title="Edit product"><Edit2 size={13} /></button>
                                                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => del(p.id)} title="Delete product"><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB 2: FACEBOOK SHOP SYNC */}
                {tab === 'facebook' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Connection Card */}
                        <div className={styles.panel} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--d-t1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Facebook size={20} color="#1877f2" /> Meta Business Integration
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--d-t3)', marginTop: '0.5rem', maxWidth: '580px', lineHeight: 1.5 }}>
                                        Synchronize your store apparel inventory with Facebook Catalogs. Publish products automatically and sync metadata feeds to run dynamic Instagram & Facebook Catalog Ads.
                                    </p>
                                </div>
                                <button
                                    onClick={toggleFbConnection}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '0.55rem 1.2rem',
                                        borderRadius: '8px', border: '1px solid var(--d-border)', cursor: 'pointer',
                                        background: fbSettings.connected ? 'rgba(239, 68, 68, 0.1)' : 'var(--d-input)',
                                        color: fbSettings.connected ? '#f87171' : 'var(--d-t2)',
                                        fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s'
                                    }}
                                >
                                    {fbSettings.connected ? 'Disconnect Meta Shop' : 'Connect Facebook Shop'}
                                </button>
                            </div>

                            {fbSettings.connected && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border2)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--d-t4)', fontWeight: 600 }}>CONNECTED FACEBOOK PAGE</span>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--d-t1)', marginTop: 4 }}>{fbSettings.page_name}</div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--d-t4)', fontWeight: 600 }}>ACTIVE PRODUCT CATALOG</span>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--d-t1)', marginTop: 4 }}>{fbSettings.catalog_name}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--d-t1)' }}>Auto-Sync Products</div>
                                                <div style={{ fontSize: '0.73rem', color: 'var(--d-t3)' }}>Instantly push new/edited products to Meta Feed</div>
                                            </div>
                                            <button
                                                onClick={() => saveFbSettings({ ...fbSettings, auto_sync: !fbSettings.auto_sync })}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: fbSettings.auto_sync ? 'var(--d-chart)' : 'var(--d-t4)', transition: 'color 0.1s' }}
                                            >
                                                {fbSettings.auto_sync ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--d-t1)' }}>Only Apparel Products</div>
                                                <div style={{ fontSize: '0.73rem', color: 'var(--d-t3)' }}>Restrict sync rules to clothes only (tops, bottoms, dresses)</div>
                                            </div>
                                            <button
                                                onClick={() => saveFbSettings({ ...fbSettings, clothing_only: !fbSettings.clothing_only })}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: fbSettings.clothing_only ? 'var(--d-chart)' : 'var(--d-t4)', transition: 'color 0.1s' }}
                                                disabled
                                            >
                                                {fbSettings.clothing_only ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {fbSettings.connected ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                                {/* Sync Actions */}
                                <div className={styles.panel} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--d-t1)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Sync Triggers</div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <button
                                            className={styles.btnPrimary}
                                            disabled={syncLoading}
                                            style={{ justifyContent: 'center', padding: '0.75rem', width: '100%' }}
                                            onClick={() => triggerFbSync('export')}
                                        >
                                            {syncLoading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={14} />}
                                            Push Catalog to Facebook
                                        </button>
                                        <p style={{ fontSize: '0.73rem', color: 'var(--d-t4)', lineHeight: 1.4, textAlign: 'center' }}>
                                            Publishes your database clothing catalog to Facebook Manager.
                                        </p>
                                    </div>

                                    <div style={{ height: '1px', background: 'var(--d-border2)' }} />

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <button
                                            className={styles.btnGhost}
                                            disabled={syncLoading}
                                            style={{ justifyContent: 'center', padding: '0.75rem', width: '100%' }}
                                            onClick={() => triggerFbSync('import')}
                                        >
                                            {syncLoading ? <Loader2 size={15} className="animate-spin" /> : <Facebook size={14} />}
                                            Import Clothes from Facebook
                                        </button>
                                        <p style={{ fontSize: '0.73rem', color: 'var(--d-t4)', lineHeight: 1.4, textAlign: 'center' }}>
                                            Pulls new clothing items from Facebook Shop and writes them to your active database.
                                        </p>
                                    </div>
                                </div>

                                {/* Graph API Logs Console */}
                                <div className={styles.panel} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--d-t1)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Meta Developer API Console</div>
                                        <span style={{ fontSize: '0.68rem', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>LIVE TERMINAL</span>
                                    </div>

                                    <div style={{
                                        background: '#060812', border: '1px solid var(--d-border)', borderRadius: '8px',
                                        padding: '1rem', fontFamily: 'Courier New, Courier, monospace', fontSize: '0.75rem',
                                        color: '#10b981', maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column',
                                        gap: '6px', flex: 1, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)'
                                    }}>
                                        {fbSettings.logs && fbSettings.logs.map((log: any, index: number) => (
                                            <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: log.type === 'error' ? '#ef4444' : log.type === 'warning' ? '#f59e0b' : log.type === 'success' ? '#34d399' : '#10b981' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>[{log.timestamp.split('T')[1].substring(0, 8)}]</span>
                                                <span style={{ flex: 1, wordBreak: 'break-all' }}>{log.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.empty} style={{ padding: '3rem 2rem' }}>
                                <AlertCircle size={36} color="var(--d-t4)" />
                                <div className={styles.emptyTitle} style={{ fontSize: '0.95rem', marginTop: 12 }}>Facebook Shop Offline</div>
                                <div className={styles.emptyText} style={{ fontSize: '0.8rem' }}>Connect your Facebook merchant store above to start matching your clothing catalog.</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* PRODUCT MODAL */}
            {showModal && (
                <div className={styles.overlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitle}>{editing ? 'Edit Product' : 'Add New Product'}</div>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            {/* Image Upload */}
                            <div className={styles.fGroup}>
                                <label className={styles.fLabel}>Product Image URL</label>
                                <label htmlFor="img-up" style={{ cursor: 'pointer' }}>
                                    <div className={styles.uploadZone}>
                                        {imgPreview ? (
                                            <img src={imgPreview} alt="Preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }} />
                                        ) : (
                                            <>
                                                <ImagePlus size={28} color="var(--d-t4)" />
                                                <div className={styles.uploadText}>Click to upload / Paste URL below</div>
                                            </>
                                        )}
                                    </div>
                                </label>
                                <input
                                    id="img-up" type="file" accept="image/*" style={{ display: 'none' }}
                                    onChange={e => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            const r = new FileReader();
                                            r.onload = () => setImgPreview(r.result as string);
                                            r.readAsDataURL(f);
                                        }
                                    }}
                                />
                                <input
                                    className={styles.fInput} style={{ marginTop: '0.5rem' }}
                                    placeholder="Or paste direct image URL (e.g. /Shop_images/1/basic2-500x750.jpeg)"
                                    value={imgPreview || ''}
                                    onChange={e => setImgPreview(e.target.value)}
                                />
                            </div>

                            <div className={styles.fRow}>
                                <div className={styles.fGroup}>
                                    <label className={styles.fLabel}>Name *</label>
                                    <input className={styles.fInput} placeholder="Product name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div className={styles.fGroup}>
                                    <label className={styles.fLabel}>Price (USD) *</label>
                                    <input className={styles.fInput} type="number" placeholder="49.00" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                                </div>
                            </div>

                            <div className={styles.fRow}>
                                <div className={styles.fGroup}>
                                    <label className={styles.fLabel}>Category</label>
                                    <select className={styles.fSelect} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                                        <option value="">Select Category</option>
                                        <option value="tops">Tops (Apparel)</option>
                                        <option value="bottoms">Bottoms (Apparel)</option>
                                        <option value="one-pieces">One-pieces / Dresses (Apparel)</option>
                                        {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className={styles.fGroup}>
                                    <label className={styles.fLabel}>Stock</label>
                                    <input className={styles.fInput} type="number" placeholder="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
                                </div>
                            </div>

                            <div className={styles.fGroup}>
                                <label className={styles.fLabel}>Sizes</label>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {SIZES.map(s => (
                                        <button
                                            key={s} type="button"
                                            className={`${styles.sizeBtn} ${form.sizes.includes(s) ? styles.sizeBtnActive : ''}`}
                                            onClick={() => toggleSize(s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.fGroup}>
                                <label className={styles.fLabel}>Description</label>
                                <textarea className={styles.fTextarea} placeholder="Describe your product..." value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnGhost} onClick={() => setShowModal(false)}>Cancel</button>
                            <button className={styles.btnPrimary} onClick={save}>{editing ? 'Save Changes' : 'Publish Product'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
