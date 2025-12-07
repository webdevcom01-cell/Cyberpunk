import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Authentication middleware for API routes
 * Verifies Supabase session and returns user info
 */
export async function requireAuth(request: NextRequest) {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Unauthorized - Missing or invalid authorization header' },
            { status: 401 }
        )
    }

    const token = authHeader.replace('Bearer ', '')

    try {
        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase configuration missing')
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Verify the JWT token
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            )
        }

        // Return user info if auth successful
        return { user, supabase }
    } catch (error) {
        console.error('Auth error:', error)
        return NextResponse.json(
            { error: 'Unauthorized - Authentication failed' },
            { status: 401 }
        )
    }
}

/**
 * Optional authentication - allows both authenticated and anonymous requests
 * Returns user info if authenticated, null otherwise
 */
export async function optionalAuth(request: NextRequest) {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null, supabase: null }
    }

    const token = authHeader.replace('Bearer ', '')

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseKey) {
            return { user: null, supabase: null }
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data: { user } } = await supabase.auth.getUser(token)

        return { user, supabase }
    } catch (error) {
        return { user: null, supabase: null }
    }
}
