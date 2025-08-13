import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes (replace with database in production)
let flows: any[] = [];

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      flows: flows 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch flows' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const flow = {
      id: body.id || Date.now().toString(),
      name: body.name || 'Untitled Flow',
      isActive: body.isActive || false,
      nodes: body.nodes || [],
      edges: body.edges || [],
      viewport: body.viewport || null,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check if flow already exists (update) or create new
    const existingIndex = flows.findIndex(f => f.id === flow.id);
    
    if (existingIndex >= 0) {
      flows[existingIndex] = flow;
    } else {
      flows.push(flow);
    }

    console.log('Flow saved:', flow);

    return NextResponse.json({ 
      success: true, 
      flow: flow,
      message: 'Flow saved successfully' 
    });
  } catch (error) {
    console.error('Error saving flow:', error);
    return NextResponse.json(
      { error: 'Failed to save flow' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flowId = searchParams.get('id');

    if (!flowId) {
      return NextResponse.json(
        { error: 'Flow ID is required' }, 
        { status: 400 }
      );
    }

    const initialLength = flows.length;
    flows = flows.filter(f => f.id !== flowId);

    if (flows.length === initialLength) {
      return NextResponse.json(
        { error: 'Flow not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Flow deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting flow:', error);
    return NextResponse.json(
      { error: 'Failed to delete flow' }, 
      { status: 500 }
    );
  }
}