import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map frontend authors to our vendor profiles
const VENDOR_MAPPING: Record<string, string> = {
    'Ankita Manot': 'c1',
    'Style Diva': 'c1',
    'Sarah Jen': 'c1',
    'Urban Chic': 'c2',
    'Trends Today': 'c2',
    'Fashion Forward': 'c3',
    'Mens Edit': 'c3',
    'Denim Cult': 'c3',
    'Sleeve Story': 'c4',
    'SummerVibes': 'c4',
    'ChicEssentials': 'c4',
    'Chemistry': 'c4',
};

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const customerEmail = session?.user?.email || 'guest@mail.com';

    try {
        const body = await req.json();
        const { productName, priceString, author, shippingAddress } = body;

        // Parse price (e.g. "$280.00" -> 280.00)
        const parsedPrice = parseFloat(priceString.replace(/[^0-9.]/g, '')) || 99.00;
        const commission = parseFloat((parsedPrice * 0.05).toFixed(2));
        const earnings = parseFloat((parsedPrice * 0.95).toFixed(2));

        // Determine vendor ID based on author mapping
        const vendorId = VENDOR_MAPPING[author] || 'c1';

        // 1. Get customer profile id
        let customerId = 'guest_user';
        if (session?.user?.email) {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('email', session.user.email)
                .single();
            if (profile) {
                customerId = profile.id;
            }
        }

        // 2. Insert into orders table
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .insert([
                {
                    customer_id: customerId === 'guest_user' ? null : customerId,
                    vendor_id: vendorId,
                    stripe_payment_intent_id: 'pi_mock_' + Math.random().toString(36).substring(7),
                    shipping_address: shippingAddress || { address: "123 Fashion Ave", city: "New York", country: "US" },
                    amount: parsedPrice,
                    platform_commission: commission,
                    vendor_earnings: earnings,
                    status: 'pending',
                    escrow_status: 'held',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, order, isMock: false });
    } catch (err: any) {
        console.warn('Database error creating order, running in mock-only mode:', err.message || err);
        
        // Generate a mock order object for the frontend client
        const mockOrder = {
            id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
            amount: 280.00,
            status: 'pending',
            escrow_status: 'held',
            vendor_id: 'c1',
            created_at: new Date().toISOString()
        };

        return NextResponse.json({ 
            success: true, 
            message: 'Order created successfully (Mock mode)', 
            order: mockOrder, 
            isMock: true 
        });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, role')
            .eq('email', session.user.email)
            .single();

        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        let query = supabaseAdmin.from('orders').select(`
            *,
            customer:profiles!orders_customer_id_fkey(full_name, email),
            vendor:profiles!orders_vendor_id_fkey(store_name, store_handle)
        `);

        if (profile.role === 'vendor') {
            query = query.eq('vendor_id', profile.id);
        } else if (profile.role !== 'admin') {
            query = query.eq('customer_id', profile.id);
        }

        const { data: orders, error } = await query;
        if (error) throw error;

        return NextResponse.json({ success: true, orders });
    } catch (err: any) {
        console.warn('Database fetch failed, returning empty order list:', err.message || err);
        return NextResponse.json({ success: true, orders: [], isMock: true });
    }
}
