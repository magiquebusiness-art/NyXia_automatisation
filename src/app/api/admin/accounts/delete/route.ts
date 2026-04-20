import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Courriel requis' }, { status: 400 });
    }

    // Prevent deleting self
    if (email === adminUser.email) {
      return NextResponse.json({ success: false, error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Compte introuvable' }, { status: 404 });
    }

    await db.user.delete({ where: { email } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
