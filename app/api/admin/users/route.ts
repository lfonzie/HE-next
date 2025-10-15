import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { getUsersData } from '@/lib/admin-utils';
import { withAdminTracing } from '@/lib/admin-telemetry';
import { handleAdminRouteError, requireSuperAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    return await withAdminTracing('admin.users.get', async () => {
      const users = await getUsersData();
      return NextResponse.json(users);
    }, {
      'admin.endpoint': '/api/admin/users',
      'admin.method': 'GET',
    });
  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    return await withAdminTracing('admin.users.create', async () => {
      const { name, email, password, role, school_id, birth_date, city, state } = await request.json();

      // Validate required fields
      if (!name || !email || !password || !role) {
        return NextResponse.json({ error: 'Nome, email, senha e role são obrigatórios' }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Usuário com este email já existe' }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password_hash: hashedPassword,
          role,
          school_id: school_id || null,
          birth_date: birth_date ? new Date(birth_date) : null,
          city,
          state,
          plan: role === 'ADMIN' ? 'premium' : 'free'
        }
      });

      return NextResponse.json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      });
    }, {
      'admin.endpoint': '/api/admin/users',
      'admin.method': 'POST',
    });
  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
