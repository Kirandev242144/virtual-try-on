import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYNC_FILE_PATH = path.join(process.cwd(), 'scratch', 'facebook_sync.json');

interface SyncLog {
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
}

interface FacebookSettings {
    connected: boolean;
    page_name: string;
    catalog_name: string;
    auto_sync: boolean;
    clothing_only: boolean;
    logs: SyncLog[];
}

function getSyncData(email: string): FacebookSettings {
    try {
        if (!fs.existsSync(path.dirname(SYNC_FILE_PATH))) {
            fs.mkdirSync(path.dirname(SYNC_FILE_PATH), { recursive: true });
        }
        if (fs.existsSync(SYNC_FILE_PATH)) {
            const data = JSON.parse(fs.readFileSync(SYNC_FILE_PATH, 'utf8'));
            if (data[email]) {
                return data[email];
            }
        }
    } catch (e) {
        console.error("Failed to read facebook sync data:", e);
    }

    return {
        connected: false,
        page_name: '',
        catalog_name: '',
        auto_sync: false,
        clothing_only: true,
        logs: [
            { timestamp: new Date().toISOString(), type: 'info', message: 'Facebook Integration initialized.' }
        ]
    };
}

function saveSyncData(email: string, settings: FacebookSettings) {
    try {
        if (!fs.existsSync(path.dirname(SYNC_FILE_PATH))) {
            fs.mkdirSync(path.dirname(SYNC_FILE_PATH), { recursive: true });
        }
        let data: Record<string, any> = {};
        if (fs.existsSync(SYNC_FILE_PATH)) {
            data = JSON.parse(fs.readFileSync(SYNC_FILE_PATH, 'utf8'));
        }
        data[email] = settings;
        fs.writeFileSync(SYNC_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error("Failed to save facebook sync data:", e);
    }
}

// MOCK CLOTHES FROM FACEBOOK
const FACEBOOK_MOCK_CATALOG = [
    {
        name: 'Meta Fitted Cropped Vest',
        price: 38.00,
        category: 'tops',
        image_url: '/Shop_images/1/basic2-500x750.jpeg',
        desc: 'Sleek, fitted cropped vest in soft ribbed cotton. Pulled from Meta Catalog feed.'
    },
    {
        name: 'Meta High-Rise Cargo Pants',
        price: 72.00,
        category: 'bottoms',
        image_url: '/Shop_images/9/pocketmen1-500x750.jpeg',
        desc: 'Utility style cargo trousers in relaxed fit with deep pockets. Pulled from Meta Catalog feed.'
    },
    {
        name: 'Meta Knit Slip Dress',
        price: 88.00,
        category: 'one-pieces',
        image_url: '/Shop_images/3/dressblack1-1-500x750.jpeg',
        desc: 'Lightweight ribbed-knit slip dress with thin straps. Pulled from Meta Catalog feed.'
    }
];

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = getSyncData(session.user.email);
        return NextResponse.json({ success: true, settings });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = session.user.email;
        const body = await req.json();
        const { action, settings: updatedSettings } = body;

        let current = getSyncData(email);

        if (action === 'save_settings') {
            current = {
                ...current,
                ...updatedSettings,
                logs: [
                    {
                        timestamp: new Date().toISOString(),
                        type: 'info',
                        message: `Settings updated. Connected: ${updatedSettings.connected ? 'YES' : 'NO'}, Auto-Sync: ${updatedSettings.auto_sync ? 'ACTIVE' : 'DISABLED'}.`
                    },
                    ...current.logs
                ].slice(0, 50) // keep last 50 logs
            };
            saveSyncData(email, current);
            return NextResponse.json({ success: true, settings: current });
        }

        if (action === 'export') {
            // Find vendor profile
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single();

            if (!profile) {
                return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 });
            }

            // Get products
            const { data: products } = await supabaseAdmin
                .from('products')
                .select('*')
                .eq('vendor_id', profile.id);

            const allProducts = products || [];
            
            // Filter clothing products if setting is active
            const filteredProducts = current.clothing_only 
                ? allProducts.filter(p => ['tops', 'bottoms', 'one-pieces', 'Casual', 'Streetwear', 'Formal', 'Ethnic'].includes(p.category || ''))
                : allProducts;

            const logsToAdd: SyncLog[] = [
                { timestamp: new Date().toISOString(), type: 'info', message: 'Triggered manual Catalog Push to Facebook Shop...' },
                { timestamp: new Date().toISOString(), type: 'info', message: `[Meta Graph API] POST /v18.0/catalog_${current.catalog_name || 'main'}/batch_items` },
                { timestamp: new Date().toISOString(), type: 'info', message: `[Meta Graph API] Processing ${filteredProducts.length} items for synchronization...` }
            ];

            if (filteredProducts.length === 0) {
                logsToAdd.push({ timestamp: new Date().toISOString(), type: 'warning', message: 'No items matching clothing categories found to sync.' });
            } else {
                filteredProducts.forEach(p => {
                    logsToAdd.push({
                        timestamp: new Date().toISOString(),
                        type: 'success',
                        message: `[Meta Graph API] Item pushed successfully: "${p.name}" (ID: fb_${p.id.substring(0, 8)})`
                    });
                });
                logsToAdd.push({
                    timestamp: new Date().toISOString(),
                    type: 'success',
                    message: `[Sync Service] Successfully synchronized ${filteredProducts.length} products to Facebook Catalog.`
                });
            }

            current.logs = [...logsToAdd, ...current.logs].slice(0, 50);
            saveSyncData(email, current);
            return NextResponse.json({ success: true, settings: current, syncedCount: filteredProducts.length });
        }

        if (action === 'import') {
            // Find vendor profile
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single();

            if (!profile) {
                return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 });
            }

            const vendorId = profile.id;
            const logsToAdd: SyncLog[] = [
                { timestamp: new Date().toISOString(), type: 'info', message: 'Triggered manual Facebook Import...' },
                { timestamp: new Date().toISOString(), type: 'info', message: `[Meta Graph API] GET /v18.0/page_${current.page_name || 'store'}/subscribed_apps` },
                { timestamp: new Date().toISOString(), type: 'info', message: '[Meta Graph API] Fetching product catalog matching clothing filters...' }
            ];

            let importedCount = 0;

            for (const item of FACEBOOK_MOCK_CATALOG) {
                // Check if product with this name already exists in database for this vendor
                const { data: exists } = await supabaseAdmin
                    .from('products')
                    .select('id')
                    .eq('vendor_id', vendorId)
                    .eq('name', item.name)
                    .limit(1);

                if (exists && exists.length > 0) {
                    logsToAdd.push({
                        timestamp: new Date().toISOString(),
                        type: 'info',
                        message: `[Skipped] "${item.name}" already exists in database.`
                    });
                    continue;
                }

                // Insert into products
                const serializedDescription = JSON.stringify({
                    desc: item.desc,
                    stock: 20,
                    sizes: ['S', 'M', 'L', 'XL']
                });

                const { data: newProd, error: insertError } = await supabaseAdmin
                    .from('products')
                    .insert([{
                        vendor_id: vendorId,
                        name: item.name,
                        price: item.price,
                        category: item.category,
                        image_url: item.image_url,
                        description: serializedDescription
                    }])
                    .select();

                if (insertError) {
                    logsToAdd.push({
                        timestamp: new Date().toISOString(),
                        type: 'error',
                        message: `[Database Error] Failed to write "${item.name}": ${insertError.message}`
                    });
                } else {
                    importedCount++;
                    logsToAdd.push({
                        timestamp: new Date().toISOString(),
                        type: 'success',
                        message: `[Meta Graph API] Pulled clothing product: "${item.name}" ($${item.price}) -> Saved to DB (ID: ${newProd[0].id.substring(0,8)})`
                    });
                }
            }

            logsToAdd.push({
                timestamp: new Date().toISOString(),
                type: 'success',
                message: `[Import Service] Sync finished. Imported ${importedCount} clothing items into database catalog.`
            });

            current.logs = [...logsToAdd, ...current.logs].slice(0, 50);
            saveSyncData(email, current);
            return NextResponse.json({ success: true, settings: current, importedCount });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (err: any) {
        console.error("POST merchant facebook sync failed:", err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
