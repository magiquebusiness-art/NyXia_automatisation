import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token manquant' }, { status: 401 });
    }

    const user = await db.user.findFirst({ where: { token } });

    if (!user) {
      return NextResponse.json({ valid: false, error: 'Token invalide' }, { status: 401 });
    }

    if (user.status === 'suspended') {
      return NextResponse.json({ valid: false, error: 'Compte suspendu' }, { status: 403 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        products: user.products ? user.products.split(',').filter(Boolean) : [],
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ valid: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
