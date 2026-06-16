import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const apiKey = process.env.RUNPOD_API_KEY;
        const endpointId = process.env.RUNPOD_ENDPOINT_ID;

        if (!apiKey || !endpointId) {
            return NextResponse.json({ 
                error: 'RunPod environment variables are not configured.' 
            }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json({ error: 'Missing jobId parameter' }, { status: 400 });
        }

        const statusUrl = `https://api.runpod.ai/v1/${endpointId}/status/${jobId}`;
        const response = await fetch(statusUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`RunPod status check returned HTTP ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        
        // RunPod serverless status response contains:
        // { id: "job-id", status: "COMPLETED" | "IN_PROGRESS" | "IN_QUEUE" | "FAILED", output: ... }
        return NextResponse.json({
            success: true,
            status: data.status,
            output: data.output, // Base64 try-on result or URL
            error: data.error
        });

    } catch (err: any) {
        console.error('[RunPod Status Check Error]:', err);
        return NextResponse.json({ error: err.message || 'Failed to check status' }, { status: 500 });
    }
}
