'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Bell, Plus, Menu, ShoppingBag, Heart, Shirt, X } from 'lucide-react';
import styles from './Navbar.module.css';
import { useState } from 'react';

interface NavbarProps {
    onSearch?: (query: string) => void;
}

import { useSession, signIn, signOut } from "next-auth/react";
import AuthModal from './AuthModal';

const Navbar = ({ onSearch }: NavbarProps) => {
    const { data: session } = useSession();
    const [localQuery, setLocalQuery] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setLocalQuery(query);
        if (onSearch) onSearch(query);
    };

    const clearSearch = () => {
        setLocalQuery('');
        if (onSearch) onSearch('');
    };

    return (
        <nav className={styles.navbar}>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            {/* 1. Top Bar */}
            <div className={styles.topBar}>
                Welcome to VogueSocial - The Future of Fashion Discovery
            </div>

            {/* 2. Main Header */}
            <div className={styles.mainHeader}>
                <div className={styles.mainHeaderContainer}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <Image
                            src="/logo.svg"
                            alt="VogueSocial Logo"
                            width={140}
                            height={36}
                            priority
                            style={{ objectFit: 'contain' }}
                        />
                    </Link>

                    {/* Search Bar */}
                    <div className={styles.searchContainer}>
                        <Search className={styles.searchIcon} size={18} />
                        <input
                            type="text"
                            placeholder="Search for styles, brands, or creators..."
                            className={styles.searchInput}
                            value={localQuery}
                            onChange={handleSearch}
                        />
                        {localQuery && (
                            <button onClick={clearSearch} className={styles.clearSearchBtn}>
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className={styles.actions}>
                        <Link href="/shop" className={styles.navItem}>
                            <ShoppingBag size={20} />
                            <span>Shop</span>
                        </Link>

                        <Link href="/wardrobe" className={styles.navItem}>
                            <Shirt size={20} />
                            <span>Wardrobe</span>
                        </Link>

                        <button className={styles.iconBtn}>
                            <Heart size={22} />
                        </button>

                        <button className={styles.iconBtn}>
                            <Bell size={22} />
                            <span className={styles.cartBadge}>2</span>
                        </button>

                        {session ? (
                            <div className={styles.userProfile}>
                                <div
                                    className={styles.avatar}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    {session.user?.image && session.user.image !== "" ? (
                                        <Image
                                            src={session.user.image}
                                            alt="User"
                                            width={32}
                                            height={32}
                                            style={{ borderRadius: '50%' }}
                                        />
                                    ) : (
                                        session.user?.name?.charAt(0) || "U"
                                    )}
                                </div>

                                {isDropdownOpen && (
                                    <div className={styles.dropdown}>
                                        <Link href="/profile" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                                            Profile
                                        </Link>
                                        {/* @ts-ignore */}
                                        {session.user?.role === 'admin' && (
                                            <Link href="/admin/dashboard" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        {/* @ts-ignore */}
                                        {(session.user?.role === 'vendor' || session.user?.role === 'admin') && (
                                            <Link href="/merchant/dashboard" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                                                Merchant Dashboard
                                            </Link>
                                        )}
                                        <button className={styles.dropdownItem} onClick={() => signOut()}>
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className={styles.loginBtn} onClick={() => setIsAuthModalOpen(true)}>
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
