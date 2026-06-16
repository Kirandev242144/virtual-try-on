'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, MessageCircle, Share2, Shirt, ShoppingBag, Star, X, CreditCard, Truck, Lock, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import TryOnModal from '@/components/TryOnModal';
import { ALL_POSTS, Product } from '@/lib/data';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Comment {
    id: number;
    author: string;
    text: string;
    avatar: string; // Initials or URL
}

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [following, setFollowing] = useState(false);
    const [isTryOnOpen, setIsTryOnOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Comment State
    const [comments, setComments] = useState<Comment[]>([
        { id: 1, author: "Jane Doe", text: "Absolutely love the texture of this fabric!", avatar: "JD" },
        { id: 2, author: "Alex Smith", text: "Is this true to size?", avatar: "AS" }
    ]);
    const [newComment, setNewComment] = useState("");

    // Checkout / Escrow States
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [address, setAddress] = useState("456 Vogue St");
    const [city, setCity] = useState("New York");
    const [country, setCountry] = useState("United States");
    const [orderResult, setOrderResult] = useState<any>(null);

    useEffect(() => {
        if (params.id) {
            const foundPost = ALL_POSTS.find(p => p.id === Number(params.id));
            setPost(foundPost);
            // Reset selected image when post changes
            setSelectedImage(null);
        }
    }, [params.id]);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const comment: Comment = {
            id: Date.now(),
            author: "You", // Hardcoded current user
            text: newComment,
            avatar: "ME"
        };
        setComments([comment, ...comments]);
        setNewComment("");
    };

    const handleCheckout = async () => {
        setCheckoutLoading(true);
        // Simulate card authorization delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productName: post.productName || post.triedItem,
                    priceString: post.price || "$280.00",
                    author: post.author,
                    shippingAddress: {
                        address: address,
                        city: city,
                        country: country
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                // Save to local storage mock database for immediate cross-tab sync
                const newOrder = {
                    id: data.order.id,
                    amount: data.order.amount || parseFloat((post.price || "$280.00").replace(/[^0-9.]/g, '')),
                    status: data.order.status || 'pending',
                    escrow_status: data.order.escrow_status || 'held',
                    created_at: data.order.created_at || new Date().toISOString(),
                    customer: { full_name: 'You (Buyer)', email: 'buyer@mail.com' },
                    vendor: { 
                        store_name: post.author === 'Ankita Manot' ? 'Studio Label Co' : 
                                    post.author === 'Urban Chic' ? 'Urban Thread Delhi' : 
                                    post.author === 'Fashion Forward' ? 'Vogue Craft Mumbai' : 'Eco Chic Wear',
                        store_handle: post.author === 'Ankita Manot' ? 'studiolabel' : 
                                      post.author === 'Urban Chic' ? 'urbanthread' : 
                                      post.author === 'Fashion Forward' ? 'voguecraft' : 'ecochic'
                    }
                };
                const existing = localStorage.getItem('vogue_social_orders');
                const ordersList = existing ? JSON.parse(existing) : [];
                ordersList.push(newOrder);
                localStorage.setItem('vogue_social_orders', JSON.stringify(ordersList));

                setOrderResult(data.order);
                setIsCheckoutSuccess(true);
                setIsCheckoutOpen(false);
            } else {
                alert("Payment failed: " + (data.error || "Please try again."));
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to payment gateway.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (!post) {
        return (
            <main>
                <Navbar />
                <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>
            </main>
        );
    }

    // Determine current main image
    const currentImage = selectedImage || post?.images?.[0] || post?.image;

    return (
        <main className={styles.main}>
            <Navbar />

            <TryOnModal
                isOpen={isTryOnOpen}
                onClose={() => setIsTryOnOpen(false)}
                garmentImage={post?.images?.[0] || post?.image}
                category={post?.category || 'tops'}
            />

            {/* Mock Stripe Checkout Modal */}
            {isCheckoutOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setIsCheckoutOpen(false)}>
                    <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '16px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #eee' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000', display: 'flex', gap: 8, alignItems: 'center', margin: 0 }}>
                                <CreditCard size={18} />
                                Pay with Stripe (Escrow)
                            </h2>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }} onClick={() => setIsCheckoutOpen(false)}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '0.75rem 1rem', background: '#fafafa', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <strong style={{ fontSize: '0.88rem', color: '#000', display: 'block' }}>{post.productName || post.triedItem}</strong>
                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Vendor: {post.author}</span>
                                </div>
                                <span style={{ fontWeight: 800, color: '#000', fontSize: '1.05rem' }}>{post.price}</span>
                            </div>

                            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#333', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Shipping Address</label>
                                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', marginBottom: '0.5rem', color: '#000' }} />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" style={{ width: '50%', padding: '0.65rem 0.85rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', color: '#000' }} />
                                    <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" style={{ width: '50%', padding: '0.65rem 0.85rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', color: '#000' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#333', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Card Details (Mocked)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #ccc', borderRadius: '8px', padding: '0.65rem 0.85rem', background: '#fafafa' }}>
                                    <CreditCard size={16} color="#666" />
                                    <input type="text" disabled value="4242 •••• •••• 4242" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.88rem', color: '#333', flex: 1 }} />
                                    <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600 }}>12/28</span>
                                    <Lock size={12} color="#999" />
                                </div>
                            </div>

                            <button 
                                onClick={handleCheckout} 
                                disabled={checkoutLoading}
                                style={{ width: '100%', padding: '0.85rem', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: checkoutLoading ? 'not-allowed' : 'pointer', display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Lock size={14} />
                                {checkoutLoading ? 'Authorizing Payment...' : `Pay ${post.price}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mock Checkout Success / Escrow Details Modal */}
            {isCheckoutSuccess && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setIsCheckoutSuccess(false)}>
                    <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '16px', maxWidth: '460px', width: '100%', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f0fdf4', border: '1px solid #bbf095', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <ShieldCheck size={26} color="#16a34a" />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#000', marginBottom: '0.5rem' }}>Payment Securely Locked</h2>
                            <p style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                                Your payment of <strong>{post.price}</strong> has been successfully authorized and held in **escrow** by VogueSocial.
                            </p>

                            <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', background: '#fafafa', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', fontSize: '0.78rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Order ID:</span><span style={{ fontWeight: 700, color: '#000' }}>{orderResult?.id || 'ORD-9824'}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Split Payout:</span><span style={{ color: '#666' }}>95% Vendor · 5% Platform</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Shipping Carrier:</span><span style={{ fontWeight: 600, color: '#000' }}>Simulated DHL/USPS</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Escrow Status:</span><span style={{ color: '#8b5cf6', fontWeight: 700 }}>HELD IN ESCROW</span></div>
                            </div>

                            <p style={{ fontSize: '0.75rem', color: '#999', lineHeight: 1.4, marginBottom: '1.5rem' }}>
                                *Note: Payout will be auto-released to the vendor connect account once delivery is confirmed via carrier tracking webhook, and the 48-hour dispute window expires.*
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button 
                                    onClick={() => {
                                        const localOrdersStr = localStorage.getItem('vogue_social_orders');
                                        if (localOrdersStr && orderResult) {
                                            try {
                                                const localOrders = JSON.parse(localOrdersStr);
                                                const updated = localOrders.map((o: any) => {
                                                    if (o.id === orderResult.id) {
                                                        return { ...o, escrow_status: 'disputed' };
                                                    }
                                                    return o;
                                                });
                                                localStorage.setItem('vogue_social_orders', JSON.stringify(updated));
                                                alert("⚠️ Simulated Claim Filed: Dispute opened. Escrow funds frozen. Go to Admin Board / disputes to resolve!");
                                                setIsCheckoutSuccess(false);
                                            } catch (e) {}
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    ⚠️ Simulate Dispute (File Claim)
                                </button>
                                <button 
                                    onClick={() => setIsCheckoutSuccess(false)}
                                    style={{ width: '100%', padding: '0.8rem', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.container}>
                {/* Back Link */}
                <button onClick={() => router.back()} className={styles.backLink}>
                    <ArrowLeft size={18} />
                    <span>Back to Feed</span>
                </button>

                <div className={styles.contentGrid}>
                    {/* LEFT: VISUAL (Gallery) */}
                    <div className={styles.visualSection}>
                        {/* User Post remains separate */}
                        {post.type === 'user' ? (
                            <div className={styles.mainVisual}>
                                <Image
                                    src={post.image}
                                    alt="User Try-On"
                                    fill
                                    className={styles.visualMedia}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        ) : (
                            // VENDOR & VIDEO: E-Commerce Gallery Layout
                            <div className={styles.galleryLayout}>
                                {/* Vertical Thumbnails */}
                                <div className={styles.thumbnailsColumn}>
                                    {post.images?.map((img: string, i: number) => (
                                        img ? (
                                            <div
                                                key={i}
                                                className={styles.thumbnailWrapper}
                                                onClick={() => setSelectedImage(img)}
                                                style={{
                                                    borderColor: currentImage === img ? '#000' : 'transparent',
                                                    borderWidth: '2px',
                                                    borderStyle: 'solid'
                                                }}
                                            >
                                                <Image
                                                    src={img}
                                                    alt={`View ${i}`}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                                {/* Main Image OR Video */}
                                <div className={styles.galleryMainImage}>
                                    {post.type === 'video' && post.videoUrl && !selectedImage ? (
                                        <video
                                            src={post.videoUrl}
                                            className={styles.visualMedia}
                                            loop
                                            muted
                                            autoPlay
                                            playsInline
                                            controls
                                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        currentImage ? (
                                            <Image
                                                src={currentImage}
                                                alt={post.productName || "Main Image"}
                                                fill
                                                style={{ objectFit: 'contain' }}
                                            />
                                        ) : null

                                    )}
                                    <div className={styles.tryOnBadge}>
                                        <Shirt size={16} /> Virtual Try-On
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: DETAILS SIDEBAR */}
                    <div className={styles.detailsSidebar}>

                        {/* VENDOR & VIDEO: Product Details */}
                        {post.type === 'vendor' || post.type === 'video' ? (
                            <div className={styles.productDetails}>
                                <div className={styles.productHeader}>
                                    <h1 className={styles.productTitle}>{post.productName}</h1>
                                    <div className={styles.productRating}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} size={16} fill={star <= (post.rating || 5) ? "#000" : "none"} color="#000" />
                                        ))}
                                        <span>({post.comments} reviews)</span>
                                    </div>
                                    <div className={styles.productPriceRow}>
                                        <span className={styles.productPrice}>{post.price}</span>
                                        {/* Optional Sale Badge could go here */}
                                    </div>
                                </div>

                                <p className={styles.productDescription}>
                                    {post.description}
                                </p>

                                {/* Vendor Profile Small */}
                                <div className={styles.vendorMiniProfile}>
                                    <Link href={`/brand/${post.author.toLowerCase().replace(/[^a-z0-9]/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                                        <div className={styles.avatarMini}>
                                            <Image src={post.avatar} alt={post.author} fill style={{ objectFit: 'cover' }} />
                                        </div>
                                        <div className={styles.vendorInfoMini}>
                                            <span>Designed by</span>
                                            <strong>{post.author}</strong>
                                        </div>
                                    </Link>
                                    <button
                                        className={`${styles.followBtnSmall} ${following ? styles.following : ''}`}
                                        onClick={() => setFollowing(!following)}
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        {following ? 'Following' : 'Follow'}
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className={styles.productActions}>
                                    <div className={styles.sizeSelector}>
                                        <span>Size</span>
                                        <div className={styles.sizeOptions}>
                                            {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                                <button key={size} className={styles.sizeBtn}>{size}</button>
                                            ))}
                                            <button className={styles.sizeGuideBtn}>Size Guide</button>
                                        </div>
                                    </div>

                                    <div className={styles.qtyRow}>
                                        <div className={styles.qtySelector}>
                                            <button>-</button>
                                            <span>1</span>
                                            <button>+</button>
                                        </div>
                                    </div>

                                    <div className={styles.ctaButtons}>
                                        <button className={styles.addToCartBtn} onClick={() => alert("✓ Item added to cart!")}>Add to Cart</button>
                                        <button className={styles.buyNowBtn} onClick={() => setIsCheckoutOpen(true)}>Buy It Now</button>
                                    </div>
                                </div>

                                {/* Virtual Try On CTA - Integrated */}
                                <div
                                    className={styles.tryOnInline}
                                    onClick={() => setIsTryOnOpen(true)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Shirt size={20} />
                                    <span>Not sure about the fit? <strong>Try it on virtually</strong></span>
                                </div>

                                {/* Comments Section specific to product */}
                                <div className={styles.commentsSection}>
                                    <h4>Comments ({comments.length})</h4>

                                    {/* Input Area */}
                                    <div className={styles.commentInputArea}>
                                        <input
                                            type="text"
                                            placeholder="Ask a question or share your thoughts..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                            className={styles.commentInput}
                                        />
                                        <button onClick={handleAddComment} className={styles.postCommentBtn} disabled={!newComment.trim()}>
                                            Post
                                        </button>
                                    </div>

                                    {/* Comments List */}
                                    <div className={styles.commentsList}>
                                        {comments.map(comment => (
                                            <div key={comment.id} className={styles.comment}>
                                                <div className={styles.commentAvatar}>{comment.avatar}</div>
                                                <div className={styles.commentContent}>
                                                    <span className={styles.commentAuthor}>{comment.author}</span>
                                                    <p>{comment.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // USER POSTS (Community)
                            <>
                                {/* Vendor Profile */}
                                <div className={styles.profileCard}>
                                    <div className={styles.profileHeader}>
                                        <div className={styles.avatar}>
                                            {post.avatar ? (
                                                <Image
                                                    src={post.avatar}
                                                    alt={post.author}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : null}
                                        </div>
                                        <div className={styles.profileInfo}>
                                            <h3>{post.author}</h3>
                                            <span className={styles.profileLabel}>{post.type === 'user' ? 'Community Member' : 'Creator'}</span>
                                        </div>
                                        <button
                                            className={`${styles.followBtn} ${following ? styles.following : ''}`}
                                            onClick={() => setFollowing(!following)}
                                        >
                                            {following ? 'Following' : 'Follow'}
                                        </button>
                                    </div>
                                    <p className={styles.description}>{post.description}</p>
                                    <div className={styles.stats}>
                                        <div className={styles.statItem}>
                                            <Heart size={18} className={styles.statIcon} />
                                            <span>{post.likes > 1000 ? (post.likes / 1000).toFixed(1) + 'k' : post.likes}</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <MessageCircle size={18} className={styles.statIcon} />
                                            <span>{post.comments}</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <Share2 size={18} className={styles.statIcon} />
                                        </div>
                                    </div>
                                </div>



                                {/* Tagged Products for Non-Vendor posts (like Lookbooks/Videos) */}
                                {post.taggedProducts && post.taggedProducts.length > 0 && (
                                    <div className={styles.productsList}>
                                        <h4>Shop the Look</h4>
                                        {post.taggedProducts.map((prod: Product) => (
                                            <div key={prod.id} className={styles.productItem}>
                                                <div className={styles.productImage}>
                                                    {prod.image ? <Image src={prod.image} alt={prod.name} width={60} height={80} style={{ objectFit: 'cover' }} /> : null}
                                                </div>
                                                <div className={styles.productInfo}>
                                                    <h5>{prod.name}</h5>
                                                    <div className={styles.priceRow}>
                                                        <span className={styles.price}>{prod.price}</span>
                                                        <button className={styles.shopBtn}><ShoppingBag size={14} /> Shop</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Comments Section (Integrated for consistency, or keep simple) */}
                                <div className={styles.commentsSection}>
                                    <h4>Comments ({comments.length})</h4>

                                    {/* Input Area */}
                                    <div className={styles.commentInputArea}>
                                        <input
                                            type="text"
                                            placeholder="Write a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                            className={styles.commentInput}
                                        />
                                        <button onClick={handleAddComment} className={styles.postCommentBtn} disabled={!newComment.trim()}>
                                            Post
                                        </button>
                                    </div>

                                    <div className={styles.commentsList}>
                                        {comments.map(comment => (
                                            <div key={comment.id} className={styles.comment}>
                                                <div className={styles.commentAvatar}>{comment.avatar}</div>
                                                <div className={styles.commentContent}>
                                                    <span className={styles.commentAuthor}>{comment.author}</span>
                                                    <p>{comment.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </main>
    );
}
