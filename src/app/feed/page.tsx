import Navbar from '@/components/Navbar';

export default function FeedPage() {
    return (
        <main>
            <Navbar />
            <div style={{ paddingTop: '100px', textAlign: 'center' }}>
                <h1>Your Personalized Feed</h1>
                <p>Welcome to VogueSocial! Your style journey begins here.</p>

                {/* Placeholder for future feed content */}
                <div style={{
                    marginTop: '2rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1rem',
                    padding: '2rem'
                }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} style={{ height: '400px', background: '#f0f0f0', borderRadius: '12px' }}></div>
                    ))}
                </div>
            </div>
        </main>
    );
}
