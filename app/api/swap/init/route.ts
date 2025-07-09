import { NextRequest, NextResponse } from 'next/server'
// No need to initialize the server-side service as it uses the config file

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Server-side swap service is ready'
    })

  } catch (error) {
    console.error('Initialization error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Initialization failed',
        success: false 
      },
      { status: 500 }
    )
  }
}