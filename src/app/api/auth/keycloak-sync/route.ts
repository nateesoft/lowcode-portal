import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keycloakId, email, firstName, lastName, role = 'user', emailVerified = false } = body;

    // Validate required fields
    if (!keycloakId || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: keycloakId, email, firstName, lastName' },
        { status: 400 }
      );
    }

    // Mock response for testing - in production this should connect to your actual backend
    const mockUser = {
      id: Math.floor(Math.random() * 1000) + 1,
      email,
      firstName,
      lastName,
      isActive: true,
      role,
      keycloakId,
      emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockTokens = {
      access_token: `mock_access_token_${Date.now()}`,
      refresh_token: `mock_refresh_token_${Date.now()}`,
    };

    // Log the sync attempt
    console.log('Keycloak user sync request:', {
      keycloakId,
      email,
      firstName,
      lastName,
      role,
      emailVerified,
    });

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = {
      user: mockUser,
      tokens: mockTokens,
      message: 'Keycloak user synced successfully',
    };

    console.log('Keycloak user sync response:', response);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Keycloak sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error during Keycloak sync' },
      { status: 500 }
    );
  }
}