"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import styles from '../onboarding.module.css';
import { Check, Store, Globe, Target, PenTool, LogIn } from 'lucide-react';

type MerchantStep = 1 | 2 | 3 | 4;
type Category = 'tops' | 'bottoms' | 'one-pieces';

export default function MerchantOnboardingPage() {
    const router = useRouter();
    const { data: session, status, update } = useSession();
    
    // Auth mode states
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    // Onboarding wizard states
    const [step, setStep] = useState<MerchantStep>(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        store_name: '',
        store_handle: '',
        store_category: 'Casual',
        target_audience: [] as string[],
        website_url: '',
        instagram_handle: '',
        twitter_handle: '',
        location: '',
        store_description: ''
    });

    // Auto-redirect if already logged in and onboarding completed
    useEffect(() => {
        // @ts-ignore
        if (status === 'authenticated' && session?.user?.role === 'vendor' && session?.user?.onboardingCompleted) {
            router.push('/merchant/dashboard');
        }
    }, [status, session, router]);

    // Reset wizard when onboarding session resets
    useEffect(() => {
        if (session?.user) {
            // Prepopulate email based brand names if available
            const namePart = session.user?.email?.split('@')[0] || '';
            setFormData(prev => ({
                ...prev,
                store_name: session.user?.name || namePart.charAt(0).toUpperCase() + namePart.slice(1),
                store_handle: namePart.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
            }));
        }
    }, [session]);

    if (status === 'loading') {
        return (
            <div className={styles.container} style={{ justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading session...</p>
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Please fill in all fields.");
            return;
        }
        setAuthLoading(true);
        try {
            const res = await signIn('credentials', {
                email: email.toLowerCase(),
                password,
                redirect: false
            });
            if (res?.error) {
                alert(`Login Failed: ${res.error || 'Invalid credentials'}`);
            } else {
                router.refresh();
            }
        } catch (err) {
            alert("An error occurred during sign in.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        setAuthLoading(true);
        try {
            const signupRes = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    password,
                    storeName: email.split('@')[0], 
                    storeHandle: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
                })
            });
            const data = await signupRes.json();
            if (!signupRes.ok) {
                alert(`Registration Failed: ${data.error || 'Server error'}`);
            } else {
                // Auto-login
                const loginRes = await signIn('credentials', {
                    email: email.toLowerCase(),
                    password,
                    redirect: false
                });
                if (loginRes?.error) {
                    alert(`Created account, but auto-login failed: ${loginRes.error}`);
                } else {
                    router.refresh();
                }
            }
        } catch (err) {
            alert("An error occurred during registration.");
        } finally {
            setAuthLoading(false);
        }
    };

    if (status === 'unauthenticated') {
        return (
            <div className={styles.container}>
                <div className={styles.content} style={{ maxWidth: '460px' }}>
                    
                    {/* Toggle Tab */}
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '2rem', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <button
                            onClick={() => setAuthMode('login')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontSize: '0.9rem', fontWeight: 700,
                                background: authMode === 'login' ? 'var(--primary-text)' : 'transparent',
                                color: authMode === 'login' ? '#fff' : 'var(--text-secondary)',
                                boxShadow: authMode === 'login' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => setAuthMode('register')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontSize: '0.9rem', fontWeight: 700,
                                background: authMode === 'register' ? 'var(--primary-text)' : 'transparent',
                                color: authMode === 'register' ? '#fff' : 'var(--text-secondary)',
                                boxShadow: authMode === 'register' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            Register Brand
                        </button>
                    </div>

                    <h1 className={styles.title} style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {authMode === 'login' ? 'Merchant Sign In' : 'Create Merchant Account'}
                    </h1>
                    <p className={styles.subtitle} style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>
                        {authMode === 'login' ? 'Sign in to access your store dashboard and manage your products.' : 'Set up your credentials to start onboarding your brand.'}
                    </p>

                    <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address</label>
                            <input
                                type="email"
                                className={styles.input}
                                placeholder="name@brand.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password</label>
                            <input
                                type="password"
                                className={styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {authMode === 'register' && (
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Confirm Password</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className={styles.primaryBtn}
                            disabled={authLoading}
                            style={{ marginTop: '1rem' }}
                        >
                            {authLoading ? 'Processing...' : authMode === 'login' ? 'Sign In to Store' : 'Register & Continue'}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: '1.5px', background: 'rgba(0,0,0,0.06)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>OR</span>
                        <div style={{ flex: 1, height: '1.5px', background: 'rgba(0,0,0,0.06)' }} />
                    </div>

                    <button
                        onClick={() => signIn('google')}
                        style={{
                            width: '100%', padding: '1rem', borderRadius: '99px', border: '1.5px solid #cbd5e1',
                            background: '#fff', color: '#334155', fontWeight: 700, fontSize: '0.95rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
                            transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.2-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </div>
        );
    }

    const handleNext = () => {
        if (step < 4) {
            setStep((prev) => (prev + 1) as MerchantStep);
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = async () => {
        setLoading(true);
        try {
            if (!session?.user?.email) {
                console.error('Session or email missing:', session);
                alert('Session Error: You must be logged in to complete onboarding.');
                return;
            }

            const response = await fetch('/api/user/complete-onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: 'vendor',
                    ...formData
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error('API Error Details:', errData);
                throw new Error('Failed to update merchant profile');
            }

            try {
                await update({ onboardingCompleted: true, role: 'vendor' });
            } catch (sessErr) {
                console.warn('Session update warning (non-fatal):', sessErr);
            }

            router.push('/merchant/dashboard');

            // Fallback redirect if router.push hangs
            setTimeout(() => {
                if (window.location.pathname !== '/merchant/dashboard') {
                    window.location.href = '/merchant/dashboard';
                }
            }, 2000);
        } catch (error: any) {
            console.error('Merchant onboarding failed:', error);
            alert(`Onboarding Failed: ${error.message || 'Unknown error'}.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${(step / 4) * 100}%` }}
                />
            </div>

            <div className={styles.content}>
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                    <div className={styles.stepContainer}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary-text)' }}>
                                <Store size={40} />
                            </div>
                        </div>
                        <h1 className={styles.title}>Your <span className="text-highlight">Brand</span> Identity</h1>
                        <p className={styles.subtitle}>Let's set up your public store presence.</p>

                        <div className={styles.formGroup}>
                            <label>Store Name</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="e.g. Urban Chic"
                                value={formData.store_name}
                                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Store Handle</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>@</span>
                                <input
                                    type="text"
                                    className={styles.input}
                                    style={{ paddingLeft: '2.2rem' }}
                                    placeholder="yourbrand"
                                    value={formData.store_handle}
                                    onChange={(e) => setFormData({ ...formData, store_handle: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                                />
                            </div>
                        </div>

                        <button
                            className={styles.primaryBtn}
                            disabled={!formData.store_name || !formData.store_handle}
                            onClick={handleNext}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* STEP 2: NICHE */}
                {step === 2 && (
                    <div className={styles.stepContainer}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary-text)' }}>
                                <Target size={40} />
                            </div>
                        </div>
                        <h1 className={styles.title}>Market & <span className="text-highlight">Style</span></h1>
                        <p className={styles.subtitle}>Who is your brand for?</p>

                        <div className={styles.formGroup}>
                            <label>Primary Category</label>
                            <div className={styles.pillGroup}>
                                {['Luxury', 'Streetwear', 'Casual', 'Ethnic', 'Vintage', 'Athleisure'].map(cat => (
                                    <div
                                        key={cat}
                                        className={`${styles.pill} ${formData.store_category === cat ? styles.activePill : ''}`}
                                        onClick={() => setFormData({ ...formData, store_category: cat })}
                                    >
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Target Audience</label>
                            <div className={styles.pillGroup}>
                                {['Men', 'Women', 'Unisex', 'Kids'].map(aud => (
                                    <div
                                        key={aud}
                                        className={`${styles.pill} ${formData.target_audience.includes(aud) ? styles.activePill : ''}`}
                                        onClick={() => {
                                            const newAud = formData.target_audience.includes(aud)
                                                ? formData.target_audience.filter(a => a !== aud)
                                                : [...formData.target_audience, aud];
                                            setFormData({ ...formData, target_audience: newAud });
                                        }}
                                    >
                                        {aud}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            className={styles.primaryBtn}
                            disabled={!formData.store_category || formData.target_audience.length === 0}
                            onClick={handleNext}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* STEP 3: PRESENCE */}
                {step === 3 && (
                    <div className={styles.stepContainer}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary-text)' }}>
                                <Globe size={40} />
                            </div>
                        </div>
                        <h1 className={styles.title}>Digital <span className="text-highlight">Presence</span></h1>
                        <p className={styles.subtitle}>Where can customers find you?</p>

                        <div className={styles.formGroup}>
                            <label>Website URL (optional)</label>
                            <input
                                type="url"
                                className={styles.input}
                                placeholder="https://yourstore.com"
                                value={formData.website_url}
                                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Instagram Handle</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="@yourbrand"
                                value={formData.instagram_handle}
                                onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Location</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="City, Country"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <button className={styles.primaryBtn} onClick={handleNext}>Continue</button>
                    </div>
                )}

                {/* STEP 4: STORY */}
                {step === 4 && (
                    <div className={styles.stepContainer}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary-text)' }}>
                                <PenTool size={40} />
                            </div>
                        </div>
                        <h1 className={styles.title}>Tell your <span className="text-highlight">Story</span></h1>
                        <p className={styles.subtitle}>Introduce your brand to our community.</p>

                        <div className={styles.formGroup}>
                            <label>Brand Bio</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="What makes your brand unique?"
                                value={formData.store_description}
                                onChange={(e) => setFormData({ ...formData, store_description: e.target.value })}
                            />
                        </div>

                        <button className={styles.primaryBtn} onClick={handleNext}>
                            {loading ? 'Finalizing...' : 'Take me to my Dashboard'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
