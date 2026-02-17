'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Heart, MessageCircle, Share2, Shirt, ShoppingBag, Star } from 'lucide-react';
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
                                    <div className={styles.avatarMini}>
                                        <Image src={post.avatar} alt={post.author} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                    <div className={styles.vendorInfoMini}>
                                        <span>Designed by</span>
                                        <strong>{post.author}</strong>
                                    </div>
                                    <button
                                        className={`${styles.followBtnSmall} ${following ? styles.following : ''}`}
                                        onClick={() => setFollowing(!following)}
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
                                        <button className={styles.addToCartBtn}>Add to Cart</button>
                                        <button className={styles.buyNowBtn}>Buy It Now</button>
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
