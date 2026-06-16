import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.RUNPOD_API_KEY;
        const endpointId = process.env.RUNPOD_ENDPOINT_ID;

        // If environment variables are not set, return a warning so the client can fall back to the proxy URL
        if (!apiKey || !endpointId) {
            return NextResponse.json({ 
                error: 'RunPod environment variables (RUNPOD_API_KEY, RUNPOD_ENDPOINT_ID) are not configured on the server. Falling back to client-side proxy direct endpoint.' 
            }, { status: 400 });
        }

        const formData = await req.formData();
        const personFile = formData.get('person_image') as File | null;
        const garmentFile = formData.get('garment_image') as File | null;
        const category = formData.get('category') as string || 'tops';

        if (!personFile || !garmentFile) {
            return NextResponse.json({ error: 'Missing person_image or garment_image file.' }, { status: 400 });
        }

        // Convert files to base64 strings in Node.js
        const personBuffer = Buffer.from(await personFile.arrayBuffer());
        const personBase64 = `data:${personFile.type};base64,${personBuffer.toString('base64')}`;

        const garmentBuffer = Buffer.from(await garmentFile.arrayBuffer());
        const garmentBase64 = `data:${garmentFile.type};base64,${garmentBuffer.toString('base64')}`;

        // Send job request to RunPod serverless API
        const runpodUrl = `https://api.runpod.ai/v1/${endpointId}/run`;
        console.log(`[RunPod] Spawning serverless try-on job for endpoint ${endpointId}...`);
        
        const response = await fetch(runpodUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                input: {
                    person_image: personBase64,
                    garment_image: garmentBase64,
                    category: category
                }
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`RunPod serverless returned HTTP ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        
        // RunPod Serverless response returns: { id: "job-id", status: "IN_QUEUE" }
        return NextResponse.json({ 
            success: true, 
            jobId: data.id, 
            status: data.status 
        });

    } catch (err: any) {
        console.error('[RunPod Submit Job Error]:', err);
        return NextResponse.json({ error: err.message || 'Failed to submit try-on job to RunPod' }, { status: 500 });
    }
}
