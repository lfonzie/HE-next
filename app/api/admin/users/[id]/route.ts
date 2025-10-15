import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { withAdminTracing } from '@/lib/admin-telemetry';
import { handleSuperAdminRouteError, requireSuperAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSuperAdmin(request);

    return await withAdminTracing('admin.users.update', async () => {
      const { id } = params;
      const { name, email, password, role, school_id, birth_date, city, state } = await request.json();

      // Validate required fields
      if (!name || !email || !role) {
        return NextResponse.json({ error: 'Nome, email e role são obrigatórios' }, { status: 400 });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      // Check if email is already taken by another user
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });

        if (emailExists) {
          return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 });
        }
      }

      // Prepare update data
      const updateData: any = {
        name,
        email,
        role,
        school_id: school_id || null,
        birth_date: birth_date ? new Date(birth_date) : null,
        city,
        state,
        plan: role === 'ADMIN' ? 'premium' : 'free'
      };

      // Hash password if provided
      if (password) {
        updateData.password_hash = await bcrypt.hash(password, 12);
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
      });

      return NextResponse.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        updated_at: updatedUser.updated_at
      });
    }, {
      'admin.endpoint': '/api/admin/users/[id]',
      'admin.method': 'PUT',
      'admin.userId': params.id,
    });
  } catch (error) {
    const adminResponse = handleSuperAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSuperAdmin(request);

    return await withAdminTracing('admin.users.delete', async () => {
      const { id } = params;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      // Prevent deletion of super admin
      const superAdminEmail = process.env.GOOGLE_SUPERADMIN_EMAIL || 'fonseca@colegioose.com.br';
      if (existingUser.email === superAdminEmail) {
        return NextResponse.json({ error: 'Não é possível deletar o super administrador' }, { status: 400 });
      }

      // Delete user (cascade will handle related data)
      await prisma.user.delete({
        where: { id }
      });

      return NextResponse.json({ success: true });
    }, {
      'admin.endpoint': '/api/admin/users/[id]',
      'admin.method': 'DELETE',
      'admin.userId': params.id,
    });
  } catch (error) {
    const adminResponse = handleSuperAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
