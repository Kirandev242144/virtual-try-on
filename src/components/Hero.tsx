"use client";

import { Sparkles, ScanFace, TrendingUp, ShoppingBag, Clock, ShieldCheck } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './Hero.module.css';
import { useRef } from 'react';

const Hero = () => {
    // Scroll tracking for parallax effects
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    // Parallax Transforms
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -80]);
    const fadeOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    return (
        <section className={styles.hero} ref={targetRef}>
            <div className={styles.glowBackground}></div>

            {/* Floating Parallax Cards (Desktop Only) - Moved OUTSIDE container for full width */}
            <div className={styles.floatingElements}>
                {/* Card 1: Conversion Rate (Top Left) */}
                <motion.div style={{ y: y1, opacity: fadeOpacity }} className={`${styles.floatCard} ${styles.cardTopLeft}`}>
                    <div className={styles.cardHeader}>
                        <TrendingUp size={20} className={styles.cardIcon} />
                        <span>Conversion Rate</span>
                    </div>
                    <div className={styles.cardStat}>+24.7%</div>
                    <div className={styles.cardGraphGreen}></div>
                </motion.div>

                {/* Card 2: Returns (Bottom Left) */}
                <motion.div style={{ y: y2, opacity: fadeOpacity }} transition={{ delay: 0.1 }} className={`${styles.floatCard} ${styles.cardBottomLeft}`}>
                    <div className={styles.cardHeader}>
                        <ShieldCheck size={20} className={styles.cardIcon} />
                        <span>Returns</span>
                    </div>
                    <div className={styles.cardStat} style={{ color: '#ef4444' }}>-15.3%</div>
                    <div className={styles.cardGraphRed}></div>
                </motion.div>

                {/* Card 3: Engagement (Top Right) */}
                <motion.div style={{ y: y3, opacity: fadeOpacity }} className={`${styles.floatCard} ${styles.cardTopRight}`}>
                    <div className={styles.cardHeader}>
                        <Clock size={20} className={styles.cardIcon} />
                        <span>Avg. Session</span>
                    </div>
                    <div className={styles.cardStat}>4m 12s</div>
                    <div className={styles.cardBars}>
                        <div style={{ height: '40%' }}></div>
                        <div style={{ height: '70%' }}></div>
                        <div style={{ height: '50%' }}></div>
                        <div style={{ height: '90%' }}></div>
                        <div style={{ height: '60%' }}></div>
                    </div>
                </motion.div>

                {/* Card 4: Cart Adds (Bottom Right) */}
                <motion.div style={{ y: y3, opacity: fadeOpacity }} transition={{ delay: 0.2 }} className={`${styles.floatCard} ${styles.cardBottomRight}`}>
                    <div className={styles.cardHeader}>
                        <ShoppingBag size={20} className={styles.cardIcon} />
                        <span>Add to Cart</span>
                    </div>
                    <div className={styles.cardStat}>1,284</div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: '78%' }}></div>
                    </div>
                </motion.div>
            </div>

            <div className={`container ${styles.container}`}>

                {/* Main Content Center */}
                <div className={styles.content}>
                    <div className={styles.badge}>
                        <Sparkles size={14} className={styles.badgeIcon} />
                        <span>5k+ brands worldwide onboard</span>
                    </div>

                    <h1 className={styles.heading}>
                        Your Virtual Fitting Room <br />
                        <span className={styles.textHighlight}>Put On Autopilot</span>
                    </h1>

                    <p className={styles.subheading}>
                        Spend less time managing returns, more time improving your product.
                        We handle the rest with top-tier AR and size recommendation technology.
                    </p>

                    <div className={styles.actions}>
                        <button className={styles.primaryButton}>Join Waitlist</button>
                        <button className={styles.secondaryButton}>Learn more</button>
                    </div>
                </div>

                {/* Realistic Phone Mockups Container */}
                <div className={styles.mockupsContainer}>

                    {/* Phone 1 */}
                    <motion.div
                        className={`${styles.phoneMockup} ${styles.phoneLeft}`}
                        animate={{
                            y: [40, 60, 40],
                            rotateY: [15, 12, 15]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <div className={styles.phoneFrameWrapper}>
                            <img src="/phone_frame.png" alt="Phone Frame" className={styles.frameImg} />
                            <div className={styles.screenContent}>
                                <video className={styles.uiVideo} autoPlay muted loop playsInline poster="/ui_dress.png">
                                    <source src="/video_fashion.mp4" type="video/mp4" />
                                </video>
                            </div>
                        </div>
                    </motion.div>

                    {/* Phone 2 */}
                    <div className={`${styles.phoneMockup} ${styles.phoneCenter}`}>
                        <div className={styles.phoneFrameWrapper}>
                            <img src="/phone_frame.png" alt="Phone Frame" className={styles.frameImg} />
                            <div className={styles.screenContent}>
                                <video className={styles.uiVideo} autoPlay muted loop playsInline poster="/ui_hoodie.png">
                                    <source src="/video_fashion.mp4" type="video/mp4" />
                                </video>
                            </div>
                        </div>
                    </div>

                    {/* Phone 3 */}
                    <motion.div
                        className={`${styles.phoneMockup} ${styles.phoneRight}`}
                        animate={{
                            y: [40, 20, 40],
                            rotateY: [-15, -12, -15]
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <div className={styles.phoneFrameWrapper}>
                            <img src="/phone_frame.png" alt="Phone Frame" className={styles.frameImg} />
                            <div className={styles.screenContent}>
                                <video className={styles.uiVideo} autoPlay muted loop playsInline poster="/ui_glasses.png">
                                    <source src="/video_fashion.mp4" type="video/mp4" />
                                </video>
                                <div className={styles.reactionParams}>
                                    <div className={styles.heart}>❤️</div>
                                    <div className={styles.likeCount}>12.4k</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>

            </div>
            <div className={styles.heroFader}></div>
        </section>
    );
};

export default Hero;
