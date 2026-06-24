import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Important: Configure CORS so Strudel / Hydrasynth can fetch data from other domains
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    const supabase = await createClient()

    let query = supabase.from('field_archive').select('*').order('created_at', { ascending: false })

    if (type) {
        query = query.eq('media_type', type)
    }

    if (category) {
        query = query.eq('category', category)
    }

    if (limit) {
        query = query.limit(parseInt(limit, 10))
    } else {
        query = query.limit(100) // reasonable default limit
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }

    return NextResponse.json({ archives: data }, { headers: corsHeaders })
}
