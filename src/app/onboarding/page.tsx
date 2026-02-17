"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import styles from './onboarding.module.css';
import { ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';

// Types
type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [step, setStep] = useState<OnboardingStep>(1);
    const [loading, setLoading] = useState(false);

    // State for each step
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [sizes, setSizes] = useState({ top: '', bottom: '', fit: '' });
    const [following, setFollowing] = useState<string[]>([]);
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [goal, setGoal] = useState('');

    useEffect(() => {
        if (session?.user?.name) {
            // Pre-fill username based on name
            setUsername(session.user.name.replace(/\s+/g, '').toLowerCase());
        }
    }, [session]);

    const handleNext = async () => {
        if (step < 6) {
            setStep((prev) => (prev + 1) as OnboardingStep);
        } else {
            await completeOnboarding();
        }
    };

    const completeOnboarding = async () => {
        setLoading(true);
        try {
            if (!session?.user?.email) return;

            // Call server-side API to update profile securely
            const response = await fetch('/api/user/complete-onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    style_preferences: selectedStyles,
                    size_preferences: sizes,
                    username: username,
                    bio: bio,
                    goals: [goal]
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Update session to reflect new onboarding status
            await update({ onboardingCompleted: true });

            router.push('/'); // Redirect to home
        } catch (error) {
            console.error('Onboarding failed:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER STEPS ---

    return (
        <div className={styles.container}>
            {/* Progress Bar */}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${(step / 6) * 100}%` }}
                />
            </div>

            <div className={styles.content}>

                {/* STEP 1: STYLES */}
                {step === 1 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>What inspires your style?</h1>
                        <p className={styles.subtitle}>Select 3 or more to personalize your feed.</p>

                        <div className={styles.grid}>
                            {['Streetwear', 'Minimal', 'Luxury', 'Casual', 'Party', 'Office', 'Ethnic', 'Vintage', 'Athleisure', 'Trendy'].map((style) => (
                                <div
                                    key={style}
                                    className={`${styles.card} ${selectedStyles.includes(style) ? styles.selected : ''}`}
                                    onClick={() => {
                                        if (selectedStyles.includes(style)) {
                                            setSelectedStyles(prev => prev.filter(s => s !== style));
                                        } else {
                                            setSelectedStyles(prev => [...prev, style]);
                                        }
                                    }}
                                >
                                    <div className={styles.cardOverlay} />
                                    {/* Placeholder Image until we have assets, using colors/text for now */}
                                    <div className={styles.cardContent}>
                                        <span>{style}</span>
                                        {selectedStyles.includes(style) && <div className={styles.check}><Check size={14} /></div>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className={styles.primaryBtn}
                            disabled={selectedStyles.length < 3}
                            onClick={handleNext}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* STEP 2: SIZE */}
                {step === 2 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Let's find your perfect fit.</h1>

                        <div className={styles.formGroup}>
                            <label>Top Size</label>
                            <div className={styles.pillGroup}>
                                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                                    <div
                                        key={s}
                                        className={`${styles.pill} ${sizes.top === s ? styles.activePill : ''}`}
                                        onClick={() => setSizes({ ...sizes, top: s })}
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Bottom Size</label>
                            <div className={styles.pillGroup}>
                                {['28', '30', '32', '34', '36', '38'].map(s => (
                                    <div
                                        key={s}
                                        className={`${styles.pill} ${sizes.bottom === s ? styles.activePill : ''}`}
                                        onClick={() => setSizes({ ...sizes, bottom: s })}
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Fit Preference</label>
                            <div className={styles.pillGroup}>
                                {['Slim', 'Regular', 'Relaxed', 'Oversized'].map(s => (
                                    <div
                                        key={s}
                                        className={`${styles.pill} ${sizes.fit === s ? styles.activePill : ''}`}
                                        onClick={() => setSizes({ ...sizes, fit: s })}
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.secondaryBtn} onClick={handleNext}>Skip for now</button>
                            <button className={styles.primaryBtn} onClick={handleNext}>Continue</button>
                        </div>
                    </div>
                )}

                {/* STEP 3: FOLLOW CREATORS */}
                {step === 3 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Follow people who match your vibe.</h1>
                        <p className={styles.subtitle}>Follow at least 3 creators.</p>

                        <div className={styles.creatorList}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={styles.creatorItem}>
                                    <div className={styles.creatorInfo}>
                                        <div className={styles.creatorAvatar} />
                                        <div>
                                            <strong>Creator {i}</strong>
                                            <span>@creator{i}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`${styles.followBtn} ${following.includes(`c${i}`) ? styles.following : ''}`}
                                        onClick={() => {
                                            const id = `c${i}`;
                                            if (following.includes(id)) {
                                                setFollowing(prev => prev.filter(f => f !== id));
                                            } else {
                                                setFollowing(prev => [...prev, id]);
                                            }
                                        }}
                                    >
                                        {following.includes(`c${i}`) ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            className={styles.primaryBtn}
                            disabled={following.length < 3}
                            onClick={handleNext}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* STEP 4: FIRST TRY-ON */}
                {step === 4 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Experience VogueSocial.</h1>
                        <p className={styles.subtitle}>Your WOW moment starts now.</p>

                        <div className={styles.tryOnPreview}>
                            {/* Placeholder for Try-On Component */}
                            <div className={styles.placeholderBox}>
                                <Image src="/auth-hero.png" alt="Try On" width={300} height={400} style={{ objectFit: 'cover', borderRadius: '12px' }} />
                                <div className={styles.overlayText}>
                                    Virtual Try-On Demo
                                </div>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.primaryBtn} onClick={handleNext}>Try it out</button>
                            <button className={styles.secondaryBtn} onClick={handleNext}>Skip</button>
                        </div>
                    </div>
                )}

                {/* STEP 5: PROFILE */}
                {step === 5 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>Create Profile</h1>

                        <div className={styles.formGroup}>
                            <label>Username</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="username"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Bio</label>
                            <textarea
                                className={styles.textarea}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us about your style..."
                            />
                        </div>

                        <button className={styles.primaryBtn} onClick={handleNext}>Continue</button>
                    </div>
                )}

                {/* STEP 6: GOAL */}
                {step === 6 && (
                    <div className={styles.stepContainer}>
                        <h1 className={styles.title}>What do you want from VogueSocial?</h1>

                        <div className={styles.listGroup}>
                            {['Discover trends', 'Shop smarter', 'Improve styling', 'Build my wardrobe'].map(g => (
                                <div
                                    key={g}
                                    className={`${styles.listItem} ${goal === g ? styles.selectedItem : ''}`}
                                    onClick={() => setGoal(g)}
                                >
                                    {g}
                                    {goal === g && <Check size={20} />}
                                </div>
                            ))}
                        </div>

                        <button
                            className={styles.primaryBtn}
                            disabled={!goal}
                            onClick={handleNext}
                        >
                            {loading ? 'Setting up...' : 'Finish'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
