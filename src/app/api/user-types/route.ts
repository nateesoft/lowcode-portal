import { NextRequest, NextResponse } from 'next/server';

interface UserType {
  id?: number;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Mock data - replace with actual database calls
let userTypes: UserType[] = [
  {
    id: 1,
    name: 'Admin',
    description: 'System Administrator with full access',
    permissions: ['create', 'read', 'update', 'delete', 'manage_users'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Manager with limited administrative access',
    permissions: ['create', 'read', 'update', 'manage_reports'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Cashier',
    description: 'Point of Sale operator',
    permissions: ['read', 'create_sales', 'process_payments'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'User Normal',
    description: 'Standard user with basic access',
    permissions: ['read'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET - Fetch all user types
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: userTypes,
      message: 'User types retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user types:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user types'
    }, { status: 500 });
  }
}

// POST - Create new user type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permissions, isActive } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Name is required'
      }, { status: 400 });
    }

    // Check if name already exists
    const existingUserType = userTypes.find(ut => 
      ut.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingUserType) {
      return NextResponse.json({
        success: false,
        error: 'User type with this name already exists'
      }, { status: 400 });
    }

    const newUserType: UserType = {
      id: Math.max(...userTypes.map(ut => ut.id || 0)) + 1,
      name: name.trim(),
      description: description || '',
      permissions: permissions || [],
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    userTypes.push(newUserType);

    // TODO: Save to database
    // await db.userType.create({
    //   data: {
    //     name: newUserType.name,
    //     description: newUserType.description,
    //     permissions: JSON.stringify(newUserType.permissions),
    //     isActive: newUserType.isActive,
    //   }
    // });

    return NextResponse.json({
      success: true,
      data: newUserType,
      message: 'User type created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user type:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user type'
    }, { status: 500 });
  }
}

// PUT - Update user type
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, permissions, isActive } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required for update'
      }, { status: 400 });
    }

    const userTypeIndex = userTypes.findIndex(ut => ut.id === id);
    
    if (userTypeIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'User type not found'
      }, { status: 404 });
    }

    // Check if name already exists (excluding current record)
    if (name) {
      const existingUserType = userTypes.find(ut => 
        ut.id !== id && ut.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingUserType) {
        return NextResponse.json({
          success: false,
          error: 'User type with this name already exists'
        }, { status: 400 });
      }
    }

    // Update user type
    const updatedUserType = {
      ...userTypes[userTypeIndex],
      name: name || userTypes[userTypeIndex].name,
      description: description !== undefined ? description : userTypes[userTypeIndex].description,
      permissions: permissions || userTypes[userTypeIndex].permissions,
      isActive: isActive !== undefined ? isActive : userTypes[userTypeIndex].isActive,
      updatedAt: new Date().toISOString(),
    };

    userTypes[userTypeIndex] = updatedUserType;

    // TODO: Update in database
    // await db.userType.update({
    //   where: { id },
    //   data: {
    //     name: updatedUserType.name,
    //     description: updatedUserType.description,
    //     permissions: JSON.stringify(updatedUserType.permissions),
    //     isActive: updatedUserType.isActive,
    //     updatedAt: new Date(),
    //   }
    // });

    return NextResponse.json({
      success: true,
      data: updatedUserType,
      message: 'User type updated successfully'
    });

  } catch (error) {
    console.error('Error updating user type:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user type'
    }, { status: 500 });
  }
}

// DELETE - Delete user type
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required for deletion'
      }, { status: 400 });
    }

    const userTypeIndex = userTypes.findIndex(ut => ut.id === parseInt(id));
    
    if (userTypeIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'User type not found'
      }, { status: 404 });
    }

    const deletedUserType = userTypes[userTypeIndex];
    userTypes = userTypes.filter(ut => ut.id !== parseInt(id));

    // TODO: Delete from database
    // await db.userType.delete({
    //   where: { id: parseInt(id) }
    // });

    return NextResponse.json({
      success: true,
      data: deletedUserType,
      message: 'User type deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user type:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user type'
    }, { status: 500 });
  }
}