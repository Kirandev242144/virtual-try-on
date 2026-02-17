import { Heart, MessageCircle, Share2 } from 'lucide-react';
import styles from './SocialProof.module.css';

const SocialProof = () => {
    const posts = [
        { id: 1, user: "@sarah_style", img: "bg-blue-500", likes: "1.2k", caption: "Love this virtual fit! Should I buy? #vtry" },
        { id: 2, user: "@mike_drips", img: "bg-purple-500", likes: "892", caption: "The AR quality is insane. Checked it in my room." },
        { id: 3, user: "@fashion_nova", img: "bg-pink-500", likes: "2.5k", caption: "New collection dropping on V-Try tomorrow!" },
    ];

    return (
        <section id="community" className={styles.section}>
            <div className="container">
                <h2 className={styles.heading}>Find Your Vibe. <br />Join the Community.</h2>

                <div className={styles.feed}>
                    {posts.map((post) => (
                        <div key={post.id} className={`${styles.post} glass-card`}>
                            <div className={styles.postHeader}>
                                <div className={styles.avatar}></div>
                                <span className={styles.username}>{post.user}</span>
                            </div>
                            <div className={styles.postImage} style={{ background: `var(--surface-highlight)` }}>
                                {/* Placeholder for image */}
                                <div className={`${styles.overlay}`}>V-TRY</div>
                            </div>
                            <div className={styles.actions}>
                                <Heart size={20} className={styles.actionIcon} />
                                <MessageCircle size={20} className={styles.actionIcon} />
                                <Share2 size={20} className={styles.actionIcon} />
                            </div>
                            <div className={styles.caption}>
                                <strong>{post.user}</strong> {post.caption}
                            </div>
                            <div className={styles.likes}>{post.likes} likes</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
