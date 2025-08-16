import { NextRequest, NextResponse } from 'next/server';

export interface FlowVersion {
  id?: number;
  flowId: number;
  version: string;
  versionNumber: number;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  metadata?: any;
  createdBy: number;
  createdAt?: string;
  isActive?: boolean;
  changeLog?: string;
}

// Mock data - replace with actual database calls
let flowVersions: FlowVersion[] = [
  {
    id: 1,
    flowId: 1,
    version: 'v1.0.0',
    versionNumber: 1,
    name: 'Initial Version',
    description: 'First version of the workflow',
    nodes: [],
    edges: [],
    metadata: {},
    createdBy: 1,
    createdAt: new Date().toISOString(),
    isActive: true,
    changeLog: 'Initial workflow creation'
  }
];

// GET - Fetch flow versions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flowId = searchParams.get('flowId');
    const versionId = searchParams.get('versionId');
    const isActive = searchParams.get('isActive');

    let filteredVersions = flowVersions;

    // Filter by flowId
    if (flowId) {
      filteredVersions = filteredVersions.filter(v => v.flowId === parseInt(flowId));
    }

    // Filter by specific version
    if (versionId) {
      filteredVersions = filteredVersions.filter(v => v.id === parseInt(versionId));
    }

    // Filter by active status
    if (isActive !== null) {
      filteredVersions = filteredVersions.filter(v => v.isActive === (isActive === 'true'));
    }

    // Sort by version number descending (latest first)
    filteredVersions.sort((a, b) => b.versionNumber - a.versionNumber);

    return NextResponse.json({
      success: true,
      data: filteredVersions,
      message: 'Flow versions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching flow versions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch flow versions'
    }, { status: 500 });
  }
}

// POST - Create new flow version
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      flowId, 
      name, 
      description, 
      nodes, 
      edges, 
      metadata, 
      createdBy, 
      changeLog,
      versionType = 'minor' // major, minor, patch
    } = body;

    // Validation
    if (!flowId || !name || !nodes || !edges || !createdBy) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: flowId, name, nodes, edges, createdBy'
      }, { status: 400 });
    }

    // Get latest version for this flow
    const existingVersions = flowVersions.filter(v => v.flowId === flowId);
    const latestVersion = existingVersions.reduce((latest, current) => 
      current.versionNumber > latest.versionNumber ? current : latest, 
      { versionNumber: 0 }
    );

    // Calculate new version number
    let newVersionNumber = 1;
    let newVersion = 'v1.0.0';

    if (latestVersion.versionNumber > 0) {
      const versionParts = latestVersion.version.replace('v', '').split('.').map(Number);
      
      switch (versionType) {
        case 'major':
          versionParts[0]++;
          versionParts[1] = 0;
          versionParts[2] = 0;
          break;
        case 'minor':
          versionParts[1]++;
          versionParts[2] = 0;
          break;
        case 'patch':
          versionParts[2]++;
          break;
      }
      
      newVersionNumber = latestVersion.versionNumber + 1;
      newVersion = `v${versionParts.join('.')}`;
    }

    // Deactivate previous active version
    if (existingVersions.length > 0) {
      flowVersions = flowVersions.map(v => 
        v.flowId === flowId ? { ...v, isActive: false } : v
      );
    }

    const newFlowVersion: FlowVersion = {
      id: Math.max(...flowVersions.map(v => v.id || 0)) + 1,
      flowId,
      version: newVersion,
      versionNumber: newVersionNumber,
      name,
      description: description || '',
      nodes,
      edges,
      metadata: metadata || {},
      createdBy,
      createdAt: new Date().toISOString(),
      isActive: true,
      changeLog: changeLog || `Version ${newVersion} created`
    };

    flowVersions.push(newFlowVersion);

    // TODO: Save to database
    // await db.flowVersion.create({
    //   data: {
    //     flowId: newFlowVersion.flowId,
    //     version: newFlowVersion.version,
    //     versionNumber: newFlowVersion.versionNumber,
    //     name: newFlowVersion.name,
    //     description: newFlowVersion.description,
    //     nodes: JSON.stringify(newFlowVersion.nodes),
    //     edges: JSON.stringify(newFlowVersion.edges),
    //     metadata: JSON.stringify(newFlowVersion.metadata),
    //     createdBy: newFlowVersion.createdBy,
    //     isActive: newFlowVersion.isActive,
    //     changeLog: newFlowVersion.changeLog
    //   }
    // });

    return NextResponse.json({
      success: true,
      data: newFlowVersion,
      message: `Flow version ${newVersion} created successfully`
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating flow version:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create flow version'
    }, { status: 500 });
  }
}

// PUT - Update flow version or restore version
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      name, 
      description, 
      nodes, 
      edges, 
      metadata, 
      isActive, 
      changeLog,
      action = 'update' // update, restore
    } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Version ID is required'
      }, { status: 400 });
    }

    const versionIndex = flowVersions.findIndex(v => v.id === id);
    
    if (versionIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Flow version not found'
      }, { status: 404 });
    }

    const existingVersion = flowVersions[versionIndex];

    if (action === 'restore') {
      // Deactivate all versions for this flow
      flowVersions = flowVersions.map(v => 
        v.flowId === existingVersion.flowId ? { ...v, isActive: false } : v
      );
      
      // Activate this version
      flowVersions[versionIndex] = {
        ...existingVersion,
        isActive: true,
        changeLog: changeLog || `Restored to version ${existingVersion.version}`
      };
    } else {
      // Update version details
      flowVersions[versionIndex] = {
        ...existingVersion,
        name: name || existingVersion.name,
        description: description !== undefined ? description : existingVersion.description,
        nodes: nodes || existingVersion.nodes,
        edges: edges || existingVersion.edges,
        metadata: metadata || existingVersion.metadata,
        isActive: isActive !== undefined ? isActive : existingVersion.isActive,
        changeLog: changeLog || existingVersion.changeLog
      };
    }

    // TODO: Update in database
    // await db.flowVersion.update({
    //   where: { id },
    //   data: {
    //     name: flowVersions[versionIndex].name,
    //     description: flowVersions[versionIndex].description,
    //     nodes: JSON.stringify(flowVersions[versionIndex].nodes),
    //     edges: JSON.stringify(flowVersions[versionIndex].edges),
    //     metadata: JSON.stringify(flowVersions[versionIndex].metadata),
    //     isActive: flowVersions[versionIndex].isActive,
    //     changeLog: flowVersions[versionIndex].changeLog
    //   }
    // });

    return NextResponse.json({
      success: true,
      data: flowVersions[versionIndex],
      message: `Flow version ${action === 'restore' ? 'restored' : 'updated'} successfully`
    });

  } catch (error) {
    console.error('Error updating flow version:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update flow version'
    }, { status: 500 });
  }
}

// DELETE - Delete flow version
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Version ID is required for deletion'
      }, { status: 400 });
    }

    const versionIndex = flowVersions.findIndex(v => v.id === parseInt(id));
    
    if (versionIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Flow version not found'
      }, { status: 404 });
    }

    const deletedVersion = flowVersions[versionIndex];
    
    // Prevent deletion of active version
    if (deletedVersion.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete active version. Please activate another version first.'
      }, { status: 400 });
    }

    flowVersions = flowVersions.filter(v => v.id !== parseInt(id));

    // TODO: Delete from database
    // await db.flowVersion.delete({
    //   where: { id: parseInt(id) }
    // });

    return NextResponse.json({
      success: true,
      data: deletedVersion,
      message: 'Flow version deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting flow version:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete flow version'
    }, { status: 500 });
  }
}