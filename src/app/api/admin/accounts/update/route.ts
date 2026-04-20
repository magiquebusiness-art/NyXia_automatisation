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
    const { email, name, newEmail, password, products, status } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Courriel requis' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Compte introuvable' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (name) updateData.name = name;
    if (newEmail && newEmail !== email) {
      // Check if new email is already taken
      const taken = await db.user.findUnique({ where: { email: newEmail } });
      if (taken) {
        return NextResponse.json({ success: false, error: 'Ce courriel est déjà utilisé' }, { status: 409 });
      }
      updateData.email = newEmail;
    }
    if (password) updateData.password = password;
    if (products && Array.isArray(products)) updateData.products = products.join(',');
    if (status) updateData.status = status;

    const updated = await db.user.update({
      where: { email },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      account: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        products: updated.products ? updated.products.split(',').filter(Boolean) : [],
        status: updated.status,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
