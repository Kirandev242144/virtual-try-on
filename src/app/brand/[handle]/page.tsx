"use client";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { MapPin, Link as LinkIcon, ArrowLeft, Shirt, MessageSquare, ShoppingBag, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ALL_POSTS } from '@/lib/data';
import styles from './brand.module.css';
import Navbar from '@/components/Navbar';

export default function BrandProfilePage() {
    const params = useParams();
    const router = useRouter();
    const handle = (params.handle as string) || '';

    const [brand, setBrand] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);

    useEffect(() => {
        if (handle) {
            loadBrandAndProducts();
        }
    }, [handle]);

    const loadBrandAndProducts = async () => {
        setLoading(true);
        try {
            // 1. Fetch brand profile from Supabase
            const { data: dbProfile, error: dbError } = await supabase
                .from('profiles')
                .select('*')
                .eq('store_handle', handle.toLowerCase().trim())
                .single();

            // 2. Fetch products for this brand
            const prodRes = await fetch(`/api/merchant/products?handle=${handle}`);
            const prodData = await prodRes.json();
            let dbProducts = prodData.success ? prodData.products : [];

            if (dbProfile) {
                // Success! Set DB profile and products
                setBrand({
                    id: dbProfile.id,
                    name: dbProfile.store_name || dbProfile.full_name || 'Designer Boutique',
                    handle: dbProfile.store_handle || handle,
                    category: dbProfile.store_category || 'Luxury',
                    bio: dbProfile.store_description || dbProfile.bio || 'Curated premium fashion collection.',
                    location: dbProfile.location || 'New Delhi, India',
                    website: dbProfile.website_url || 'https://voguesocial.com',
                    avatar: dbProfile.avatar_url || '/Shop_images/1/basic2-500x750.jpeg',
                    followers: 1250,
                    following: 340,
                    isMock: false
                });
                setProducts(dbProducts || []);
            } else {
                // Fallback to mock data matching feed authors
                console.log("Brand not in Supabase yet. Loading fallback mock profile...");
                
                // Find a post by an author whose name matches the handle slug
                const matchedPost = ALL_POSTS.find(p => 
                    p.author.toLowerCase().replace(/[^a-z0-9]/g, '') === handle.toLowerCase()
                );

                if (matchedPost) {
                    // Extract all products associated with this vendor's posts
                    const vendorPosts = ALL_POSTS.filter(p => p.author === matchedPost.author);
                    const mockProductsList: any[] = [];
                    const addedProductNames = new Set<string>();

                    vendorPosts.forEach((vp: any) => {
                        // Use tagged products
                        if (vp.taggedProducts) {
                            vp.taggedProducts.forEach((tp: any) => {
                                if (!addedProductNames.has(tp.name)) {
                                    addedProductNames.add(tp.name);
                                    mockProductsList.push({
                                        id: `mock_${tp.id}`,
                                        name: tp.name,
                                        price: parseFloat(tp.price.replace(/[^0-9.]/g, '')) || 45,
                                        category: vp.category || 'Casual',
                                        stock: 12,
                                        sizes: ['S', 'M', 'L'],
                                        desc: vp.description || 'Premium designer apparel collection.',
                                        image_url: tp.image,
                                        isMock: true
                                    });
                                }
                            });
                        }
                        
                        // Add main post product if applicable
                        if (vp.productName && !addedProductNames.has(vp.productName)) {
                            addedProductNames.add(vp.productName);
                            mockProductsList.push({
                                id: `mock_post_${vp.id}`,
                                name: vp.productName,
                                price: parseFloat((vp.price || "$280").replace(/[^0-9.]/g, '')) || 280,
                                category: vp.category || 'one-pieces',
                                stock: 5,
                                sizes: ['XS', 'S', 'M', 'L'],
                                desc: vp.description || 'Limited edition designer piece.',
                                image_url: vp.images?.[0] || vp.image,
                                isMock: true
                            });
                        }
                    });

                    setBrand({
                        id: `mock_brand_${matchedPost.id}`,
                        name: matchedPost.author,
                        handle: handle,
                        category: matchedPost.storyTitle ? matchedPost.storyTitle.split(' ').slice(-1)[0] : 'Exclusive',
                        bio: matchedPost.description || `${matchedPost.author} curates high-end silhouettes with premium styling.`,
                        location: 'Global Boutique',
                        website: 'https://voguesocial.com',
                        avatar: matchedPost.avatar,
                        followers: Math.floor(matchedPost.likes * 1.5) || 3800,
                        following: 180,
                        isMock: true
                    });
                    setProducts(mockProductsList);
                } else {
                    // Generic default brand profile fallback
                    setBrand({
                        name: handle.charAt(0).toUpperCase() + handle.slice(1) + ' Atelier',
                        handle: handle,
                        category: 'Luxury',
                        bio: 'Exploring the intersection of modern shapes and premium fabrics.',
                        location: 'Milan, Italy',
                        website: 'https://voguesocial.com',
                        avatar: '/Shop_images/1/basic2-500x750.jpeg',
                        followers: 820,
                        following: 120,
                        isMock: true
                    });
                    setProducts([]);
                }
            }
        } catch (err) {
            console.error("Error loading brand profile:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main className={styles.loadingScreen}>
                <Navbar />
                <Loader2 size={32} className="animate-spin" style={{ color: '#0f172a' }} />
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Loading Brand Studio...</p>
            </main>
        );
    }

    // Group products by category
    const tops = products.filter(p => ['tops', 'Tops'].includes(p.category || ''));
    const bottoms = products.filter(p => ['bottoms', 'Bottoms'].includes(p.category || ''));
    const dresses = products.filter(p => ['one-pieces', 'One-pieces', 'dresses', 'Dresses'].includes(p.category || ''));
    const others = products.filter(p => !['tops', 'Tops', 'bottoms', 'Bottoms', 'one-pieces', 'One-pieces', 'dresses', 'Dresses'].includes(p.category || ''));

    const renderCategorySection = (title: string, items: any[]) => {
        if (items.length === 0) return null;
        return (
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ 
                    fontSize: '0.85rem', fontWeight: 800, color: '#475569', 
                    textTransform: 'uppercase', letterSpacing: '0.06em', 
                    marginBottom: '1.25rem', paddingBottom: '0.5rem', 
                    borderBottom: '1px solid #e2e8f0', display: 'flex', 
                    alignItems: 'center', gap: '8px' 
                }}>
                    {title} 
                    <span style={{ 
                        background: '#e2e8f0', color: '#475569', 
                        fontSize: '0.68rem', padding: '2px 7px', 
                        borderRadius: 99, fontWeight: 700 
                    }}>{items.length}</span>
                </h3>
                <div className={styles.catalogGrid}>
                    {items.map((p) => {
                        const isApparel = ['tops', 'bottoms', 'one-pieces', 'dresses'].includes(p.category?.toLowerCase() || '');
                        return (
                            <Link
                                href={p.isMock ? `/product/1` : `/product/${p.id}`}
                                key={p.id}
                                className={styles.productCard}
                            >
                                <div className={styles.imageWrapper}>
                                    {p.image_url ? (
                                        <Image
                                            src={p.image_url}
                                            alt={p.name}
                                            fill
                                            className={styles.productImage}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', width: '100%', height: '100%', background: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                                            <ShoppingBag size={32} color="#94a3b8" />
                                        </div>
                                    )}

                                    {isApparel && (
                                        <div className={styles.tryOnIndicator}>
                                            <Shirt size={12} />
                                            <span>TRY-ON</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.productCardContent}>
                                    <span className={styles.productCategory}>{p.category}</span>
                                    <h3 className={styles.productName}>{p.name}</h3>
                                    <div className={styles.productPriceRow}>
                                        <span className={styles.productPrice}>${p.price}</span>
                                        <span className={styles.viewDetailsText}>
                                            View Details
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <main className={styles.main}>
            <Navbar />

            <div className={styles.container}>
                {/* Back Button */}
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>

                {/* 1. Cover Banner */}
                <div className={styles.coverSection}>
                    <div className={styles.coverOverlay} />
                    {brand.avatar && (
                        <Image
                            src={brand.avatar}
                            alt=""
                            fill
                            className={styles.coverImage}
                            priority
                            style={{ filter: 'blur(15px)' }}
                        />
                    )}
                </div>

                {/* 2. Brand Card details */}
                <div className={styles.brandHeaderCard}>
                    <div className={styles.profileRow}>
                        <div className={styles.avatarContainer}>
                            {brand.avatar ? (
                                <Image
                                    src={brand.avatar}
                                    alt={brand.name}
                                    fill
                                    className={styles.avatarImage}
                                />
                            ) : (
                                <div className={styles.avatarFallback}>
                                    {brand.name.substring(0, 2)}
                                </div>
                            )}
                        </div>

                        <div className={styles.brandInfo}>
                            <div className={styles.brandNameRow}>
                                <h1 className={styles.brandTitle}>{brand.name}</h1>
                                <span className={styles.categoryBadge}>{brand.category}</span>
                            </div>
                            <h2 className={styles.brandHandle}>@{brand.handle}</h2>
                            <div className={styles.locationText}>
                                <MapPin size={13} />
                                <span>{brand.location}</span>
                            </div>
                            <p className={styles.bioText}>{brand.bio}</p>
                        </div>
                    </div>

                    <div className={styles.actionsAndMetrics}>
                        {/* Metrics */}
                        <div className={styles.metricsRow}>
                            <div className={styles.metricItem}>
                                <span className={styles.metricValue}>{brand.followers.toLocaleString()}</span>
                                <span className={styles.metricLabel}>Followers</span>
                            </div>
                            <div className={styles.metricItem}>
                                <span className={styles.metricValue}>{brand.following.toLocaleString()}</span>
                                <span className={styles.metricLabel}>Following</span>
                            </div>
                            <div className={styles.metricItem}>
                                <span className={styles.metricValue}>{products.length}</span>
                                <span className={styles.metricLabel}>Products</span>
                            </div>
                        </div>

                        {/* Connection Buttons */}
                        <div className={styles.buttonGroup}>
                            <button
                                onClick={() => setFollowing(!following)}
                                className={`${styles.primaryAction} ${following ? styles.primaryActionFollowing : ''}`}
                            >
                                {following ? 'Following' : 'Follow Brand'}
                            </button>
                            <button
                                onClick={() => alert(`📩 Chat initiated with ${brand.name}`)}
                                className={styles.secondaryAction}
                            >
                                <MessageSquare size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle' }} />
                                Message
                            </button>
                            {brand.website && (
                                <a
                                    href={brand.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.secondaryAction}
                                    style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                                >
                                    <LinkIcon size={14} style={{ marginRight: 6 }} />
                                    Website
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Catalog list grid */}
                <div className={styles.catalogSection}>
                    <h2 className={styles.sectionHeading}>
                        <span>The Collection</span>
                        <span className={styles.catalogBadge}>{products.length}</span>
                    </h2>

                    {products.length === 0 ? (
                        <div className={styles.emptyState}>
                            <ShoppingBag size={40} color="#94a3b8" />
                            <div className={styles.emptyTitle}>Collection is empty</div>
                            <div className={styles.emptyText}>This brand has not published any products to their collection yet.</div>
                        </div>
                    ) : (
                        <div>
                            {renderCategorySection("Tops & Jackets", tops)}
                            {renderCategorySection("Bottoms & Trousers", bottoms)}
                            {renderCategorySection("Dresses & Jumpsuits", dresses)}
                            {renderCategorySection("Lifestyle & Others", others)}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
