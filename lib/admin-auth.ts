import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

export class AdminAccessError extends Error {
  public readonly statusCode: number;

  constructor(message = 'Admin access required', statusCode = 403) {
    super(message);
    this.name = 'AdminAccessError';
    this.statusCode = statusCode;
  }
}

interface AdminSession {
  userId?: string;
  strategy: 'session' | 'token';
}

export async function requireAdmin(request?: NextRequest): Promise<AdminSession> {
  const adminToken = request?.headers.get('x-admin-token');
  const configuredAdminToken = process.env.ADMIN_TOKEN;

  if (adminToken && configuredAdminToken && adminToken === configuredAdminToken) {
    return { strategy: 'token' };
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new AdminAccessError('Authentication required', 401);
  }

  if (session.user.role !== 'ADMIN') {
    throw new AdminAccessError('Admin access required', 403);
  }

  return { strategy: 'session', userId: session.user.id };
}

export async function requireSuperAdmin(request?: NextRequest): Promise<AdminSession> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new AdminAccessError('Authentication required', 401);
  }

  if (session.user.role !== 'ADMIN') {
    throw new AdminAccessError('Admin access required', 403);
  }

  // Verificar se é super admin baseado no email
  const superAdminEmail = process.env.GOOGLE_SUPERADMIN_EMAIL || 'fonseca@colegioose.com.br';
  if (session.user.email !== superAdminEmail) {
    throw new AdminAccessError('Super admin access required', 403);
  }

  return { strategy: 'session', userId: session.user.id };
}

export function handleAdminRouteError(error: unknown) {
  if (error instanceof AdminAccessError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  return null;
}

export function handleSuperAdminRouteError(error: unknown) {
  if (error instanceof AdminAccessError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  return null;
}
