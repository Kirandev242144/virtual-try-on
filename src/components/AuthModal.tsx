"use client";

import { X } from 'lucide-react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import styles from './AuthModal.module.css';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>

                <div className={styles.content}>
                    {/* Left Side - Visual */}
                    <div className={styles.visualSide}>
                        <div className={styles.imageContainer}>
                            <Image
                                src="/auth-hero.png"
                                alt="Fashion Model"
                                fill
                                className={styles.heroImage}
                            />
                            <div className={styles.visualOverlay}>
                                <div className={styles.brandTag}>
                                    <span className={styles.brandName}>VogueSocial</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className={styles.formSide}>
                        <div className={styles.header}>
                            <h2>Welcome to VogueSocial</h2>
                            <p>Sign in to unlock your personal wardrobe</p>
                        </div>

                        <div className={styles.authButtons}>
                            <button
                                className={styles.googleBtn}
                                onClick={() => signIn('google')}
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
                                <span>Continue with Google</span>
                            </button>

                            {/* Placeholder for future providers */}
                            <button className={styles.outlineBtn} disabled>
                                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" width={20} height={20} />
                                <span>Continue with Facebook</span>
                            </button>
                        </div>

                        <div className={styles.divider}>
                            <span>or</span>
                        </div>

                        <button className={styles.emailBtn}>
                            Continue with Email
                        </button>

                        <p className={styles.terms}>
                            By proceeding, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
