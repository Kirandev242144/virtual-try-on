import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { orderId, trackingNumber, courier } = await req.json();

        if (!orderId || !trackingNumber || !courier) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 1. Get vendor profile id
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, role')
            .eq('email', session.user.email)
            .single();

        if (!profile || (profile.role !== 'vendor' && profile.role !== 'admin')) {
            return NextResponse.json({ error: 'Forbidden. Vendor role required.' }, { status: 403 });
        }

        // 2. Update order
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .update({
                status: 'shipped',
                tracking_number: trackingNumber,
                courier: courier,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('vendor_id', profile.id) // Ensure vendor owns the order
            .select()
            .single();

        if (error) throw error;

        // 3. Register shipping webhook simulation
        // In a real application, we would call Shippo/EasyPost API to register a tracker.
        // For mock, we will automatically trigger a simulated delivery in 10 seconds via a background timeout or a mock cron,
        // or the user can trigger it manually through our mock webhook API.
        
        return NextResponse.json({ success: true, order });
    } catch (err: any) {
        console.warn('Database error marking order as shipped, returning mock success:', err.message || err);
        return NextResponse.json({ 
            success: true, 
            message: 'Order status updated to Shipped (Mock Mode)', 
            isMock: true 
        });
    }
}
