import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const adminUser = await db.user.findFirst({ where: { token } });

    if (!adminUser || (adminUser.role !== 'superadmin' && adminUser.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 });
    }

    const accounts = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = accounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      email: acc.email,
      password: acc.password,
      products: acc.products ? acc.products.split(',').filter(Boolean) : [],
      status: acc.status,
      role: acc.role,
      createdAt: acc.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, accounts: formatted });
  } catch (error) {
    console.error('Accounts error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
