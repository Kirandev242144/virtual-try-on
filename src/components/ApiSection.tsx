import { Terminal, Code, ArrowRight } from 'lucide-react';
import styles from './ApiSection.module.css';

const ApiSection = () => {
    return (
        <section id="business" className={styles.section}>
            <div className={`container ${styles.container}`}>
                <div className={styles.content}>
                    <div className={styles.badge}>For Developers & Brands</div>
                    <h2 className={styles.title}>Power Your Store with V-Try API.</h2>
                    <p className={styles.description}>
                        Add virtual try-on to any platform. Our SDK supports Shopify, WooCommerce, and custom web apps.
                    </p>
                    <ul className={styles.list}>
                        <li>
                            <div className={styles.check}>✓</div>
                            <span>5-minute integration</span>
                        </li>
                        <li>
                            <div className={styles.check}>✓</div>
                            <span>Real-time physics engine</span>
                        </li>
                        <li>
                            <div className={styles.check}>✓</div>
                            <span>Cross-platform (Web, iOS, Android)</span>
                        </li>
                    </ul>
                    <button className={styles.cta}>
                        Read Documentation <ArrowRight size={18} />
                    </button>
                </div>

                <div className={styles.codeWindow}>
                    <div className={styles.windowHeader}>
                        <div className={styles.windowDot} style={{ background: '#ff5f56' }}></div>
                        <div className={styles.windowDot} style={{ background: '#ffbd2e' }}></div>
                        <div className={styles.windowDot} style={{ background: '#27c93f' }}></div>
                        <span className={styles.fileName}>install.sh</span>
                    </div>
                    <div className={styles.codeContent}>
                        <div className={styles.line}>
                            <span className={styles.prompt}>$</span> npm install @v-try/sdk
                        </div>
                        <div className={styles.line}>
                            <span className={styles.prompt}>$</span> vtry init --key=YOUR_API_KEY
                        </div>
                        <div className={styles.line}>
                            <span className={styles.comment}>// Initializing physics engine...</span>
                        </div>
                        <div className={styles.line}>
                            <span className={styles.success}>✓ Ready to use!</span>
                        </div>
                        <div className={styles.cursor}></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ApiSection;
