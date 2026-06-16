import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to check session and get vendor ID
async function getVendorId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', session.user.email)
        .single();

    return profile?.id || null;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const handle = searchParams.get('handle');

        let targetVendorId: string | null = null;

        if (handle) {
            // Public query: lookup profile by store_handle
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('store_handle', handle.toLowerCase().trim())
                .single();

            if (profileError || !profile) {
                // Handle not found: return empty product list
                return NextResponse.json({ success: true, products: [] });
            }
            targetVendorId = profile.id;
        } else {
            // Private query: retrieve logged-in merchant's products
            targetVendorId = await getVendorId();
            if (!targetVendorId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('vendor_id', targetVendorId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = products.map(p => {
            let desc = p.description || '';
            let stock = 0;
            let sizes: string[] = [];

            try {
                if (p.description && p.description.startsWith('{')) {
                    const parsed = JSON.parse(p.description);
                    desc = parsed.desc || '';
                    stock = parsed.stock || 0;
                    sizes = parsed.sizes || [];
                }
            } catch (e) {
                // Keep default fallback
            }

            return {
                id: p.id,
                name: p.name,
                price: Number(p.price),
                category: p.category || 'Casual',
                stock,
                sizes,
                desc,
                image_url: p.image_url,
                created_at: p.created_at
            };
        });

        return NextResponse.json({ success: true, products: formatted });
    } catch (err: any) {
        console.error("GET merchant products failed:", err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const vendorId = await getVendorId();
        if (!vendorId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, price, category, stock, sizes, desc, image_url } = body;

        if (!name || price === undefined) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
        }

        const serializedDescription = JSON.stringify({
            desc: desc || '',
            stock: Number(stock) || 0,
            sizes: sizes || []
        });

        const productData = {
            vendor_id: vendorId,
            name,
            price: Number(price),
            category: category || 'Casual',
            image_url: image_url || '/Shop_images/1/basic2-500x750.jpeg',
            description: serializedDescription
        };

        if (id) {
            // Update
            const { data, error } = await supabaseAdmin
                .from('products')
                .update(productData)
                .eq('id', id)
                .eq('vendor_id', vendorId)
                .select();

            if (error) throw error;
            return NextResponse.json({ success: true, product: data[0] });
        } else {
            // Insert
            const { data, error } = await supabaseAdmin
                .from('products')
                .insert([productData])
                .select();

            if (error) throw error;
            return NextResponse.json({ success: true, product: data[0] });
        }
    } catch (err: any) {
        console.error("POST merchant product failed:", err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const vendorId = await getVendorId();
        if (!vendorId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id)
            .eq('vendor_id', vendorId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Product deleted' });
    } catch (err: any) {
        console.error("DELETE merchant product failed:", err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
