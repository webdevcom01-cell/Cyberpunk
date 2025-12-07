// API Health Check Endpoint
// Simple health check for monitoring

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database connection
    const supabase = await createClient()
    const { error: dbError } = await supabase
      .from('agents')
      .select('id')
      .limit(1)
    
    const dbHealthy = !dbError
    const responseTime = Date.now() - startTime
    
    // Overall health status
    const healthy = dbHealthy && responseTime < 1000
    
    return NextResponse.json({
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          responseTime: `${responseTime}ms`,
          error: dbError?.message || null
        },
        api: {
          status: 'healthy',
          responseTime: `${responseTime}ms`
        }
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    }, {
      status: healthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime()
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}
