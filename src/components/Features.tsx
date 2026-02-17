import { BarChart3, Layers, Zap, PenTool } from 'lucide-react';
import styles from './Features.module.css';

const Features = () => {
    return (
        <section id="features" className={styles.section}>
            <div className={`container ${styles.container}`}>

                <div className={styles.header}>
                    <div className={styles.badge}>Features</div>
                    <h2 className={styles.title}>Your marketing department just activated autopilot</h2>
                    <p className={styles.subtitle}>
                        Deploy your campaigns and optimize them with top tier revolutionary AI technology
                    </p>
                </div>

                <div className={styles.grid}>
                    {/* Feature 1 */}
                    <div className={styles.featureRow}>
                        <div className={styles.featureContent}>
                            <h3 className={styles.featureTitle}>Analytics that matter</h3>
                            <p className={styles.featureText}>Deploy your campaigns and optimize them with top tier revolutionary AI technology.</p>
                            <div className={styles.tag}>Revolutionary AI</div>
                        </div>
                        <div className={`${styles.featureVisual} glass-card`}>
                            <div className={styles.chartMockup}>
                                <BarChart3 size={40} className={styles.icon} />
                                <div className={styles.graphLines}></div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: Reversed */}
                    <div className={`${styles.featureRow} ${styles.reversed}`}>
                        <div className={styles.featureContent}>
                            <h3 className={styles.featureTitle}>Seamless Integrations</h3>
                            <p className={styles.featureText}>A solution that integrates to all your marketing channels. No more endless add-ons.</p>
                            <div className={styles.tag}>All-in-one</div>
                        </div>
                        <div className={`${styles.featureVisual} glass-card`}>
                            <div className={styles.integrationGrid}>
                                <div className={styles.logoItem}><Layers size={24} /></div>
                                <div className={styles.logoItem}><Zap size={24} /></div>
                                <div className={styles.logoItem}><PenTool size={24} /></div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className={styles.featureRow}>
                        <div className={styles.featureContent}>
                            <h3 className={styles.featureTitle}>Pixel Perfect Media</h3>
                            <p className={styles.featureText}>Generate engagement with generated user content for every kind of product.</p>
                            <div className={styles.tag}>High Fidelity</div>
                        </div>
                        <div className={`${styles.featureVisual} glass-card`}>
                            <div className={styles.mediaMockup}>
                                <div className={styles.playBtn}>▶</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Features;
