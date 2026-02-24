import { NextResponse } from 'next/server'

export async function GET() {
    const apiKey = process.env.DEEPGRAM_API_KEY

    if (!apiKey) {
        return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 })
    }

    try {
        // We could return a temporary key here if using a more complex auth, 
        // but for now we'll just return the key securely to the server-side logic
        // or provide it to the client if the user is okay with it.
        // For a cleaner approach, the client will connect to Deepgram directly
        // and we'll just handle the key injection or use a more robust token.
        return NextResponse.json({ key: apiKey })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to retrieve key' }, { status: 500 })
    }
}
