'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Shirt, Play } from 'lucide-react';
import styles from './Feed.module.css';
import { ALL_POSTS } from '@/lib/data';

interface FeedProps {
    searchQuery?: string;
}

const Feed = ({ searchQuery = '' }: FeedProps) => {
    const [activeTab, setActiveTab] = useState('foryou');
    // Simple state to track following status by post ID for demo purposes
    const [following, setFollowing] = useState<Record<number, boolean>>({});

    const toggleFollow = (id: number, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation when clicking follow
        e.stopPropagation();
        setFollowing(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const tabs = [
        { id: 'foryou', label: 'For You' },
        { id: 'following', label: 'Following' },
        { id: 'trends', label: 'Trends' },
        { id: 'men', label: 'Men' },
        { id: 'women', label: 'Women' },
    ];

    // Filter Logic
    const filteredPosts = ALL_POSTS.filter(post => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        // Search by author
        if (post.author.toLowerCase().includes(query)) return true;

        // Search by tried item (User posts)
        if ('triedItem' in post && post.triedItem && post.triedItem.toLowerCase().includes(query)) return true;

        // Search by story title (Vendor posts)
        if ('storyTitle' in post && post.storyTitle && post.storyTitle.toLowerCase().includes(query)) return true;

        return false;
    });

    return (
        <div className={styles.feedContainer}>
            <div className={`container`}>
                {/* Tabs */}
                <div className={styles.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {filteredPosts.length > 0 ? (
                    <div className={styles.grid}>
                        {filteredPosts.map((post) => (
                            <Link href={`/product/${post.id}`} key={post.id} className={post.type === 'user' ? styles.userCard : styles.postCard}>
                                {/* Header */}
                                <div className={styles.cardHeader}>
                                    <div className={styles.authorAvatar} style={{ position: 'relative', overflow: 'hidden' }}>
                                        {post.avatar ? (
                                            <Image
                                                src={post.avatar}
                                                alt={post.author}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : null}
                                    </div>
                                    <div className={styles.authorInfo}>
                                        <span className={styles.authorLabel}>{post.type === 'user' ? 'Tried by' : 'By'}</span>
                                        <span className={styles.authorName}>{post.author}</span>
                                    </div>
                                    <button
                                        className={`${styles.followBtn} ${following[post.id] ? styles.following : ''}`}
                                        onClick={(e) => toggleFollow(post.id, e)}
                                    >
                                        {following[post.id] ? 'Following' : 'Follow'}
                                    </button>
                                </div>

                                {/* Content based on Type */}
                                {post.type === 'user' ? (
                                    // USER CARD CONTENT
                                    <div className={styles.userContent}>
                                        <div className={styles.userImageContainer}>
                                            {post.image ? (
                                                <Image
                                                    src={post.image}
                                                    alt={`Tried by ${post.author}`}
                                                    fill
                                                    className={styles.userImage}
                                                />
                                            ) : null}
                                            <div className={styles.triedBadge}>
                                                Tried via VogueSocial
                                            </div>
                                        </div>
                                        <div className={styles.userActions}>
                                            <div className={styles.userMetrics}>
                                                <button className={styles.metricBtn}>
                                                    <Heart size={18} /> {post.likes}
                                                </button>
                                                <button className={styles.metricBtn}>
                                                    <MessageCircle size={18} /> {post.comments}
                                                </button>
                                            </div>
                                            <button className={styles.trySimilarBtn}>Try Similar</button>
                                        </div>
                                    </div>
                                ) : (
                                    // VENDOR CARD CONTENT
                                    <>
                                        <div className={styles.imageGrid}>
                                            {/* Main Image (Left) */}
                                            <div className={styles.mainImageContainer}>
                                                {post.type === 'video' ? (
                                                    <>
                                                        <video
                                                            src={post.videoUrl}
                                                            className={styles.postImage}
                                                            style={{ objectFit: 'cover' }}
                                                            loop
                                                            muted
                                                            playsInline
                                                            autoPlay // Autoplay for demo effect
                                                        />
                                                        <div className={styles.playOverlay}>
                                                            <div className={styles.playButton}>
                                                                <Play size={24} fill="currentColor" />
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    post.images && post.images[0] ? (
                                                        <Image
                                                            src={post.images[0]}
                                                            alt="Main product"
                                                            fill
                                                            className={styles.postImage}
                                                        />
                                                    ) : null
                                                )}
                                                <button className={styles.tryOnBtn}>
                                                    <Shirt size={14} /> Try On
                                                </button>
                                            </div>

                                            {/* Side Images (Right) */}
                                            <div className={styles.sideImagesContainer}>
                                                <div className={styles.sideImageWrapper}>
                                                    {post.images && post.images[1] ? (
                                                        <Image
                                                            src={post.images[1]}
                                                            alt="Product Detail"
                                                            fill
                                                            className={styles.postImage}
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className={styles.sideImageWrapper}>
                                                    {post.images && post.images[2] ? (
                                                        <Image
                                                            src={post.images[2]}
                                                            alt="Product Detail"
                                                            fill
                                                            className={styles.postImage}
                                                        />
                                                    ) : null}
                                                    <div className={styles.moreOverlay}>
                                                        +{post.moreCount}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className={styles.cardFooter}>
                                            <span className={styles.storyLabel}>{post.storyTitle}</span>
                                            <div className={styles.actions}>
                                                <button className={styles.actionBtn}>
                                                    <Heart size={20} />
                                                </button>
                                                <button className={styles.actionBtn}>
                                                    <Share2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
                        <h3>No results found for "{searchQuery}"</h3>
                        <p>Try searching for collections, authors, or items.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
