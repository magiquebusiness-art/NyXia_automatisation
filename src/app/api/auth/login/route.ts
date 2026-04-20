import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Courriel et mot de passe requis' }, { status: 400 });
    }

    // Find user
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // Auto-create the user if not found (first login)
      const userName = name || email.split('@')[0];
      user = await db.user.create({
        data: {
          email,
          password,
          name: userName,
          role: 'client',
          products: '',
          status: 'active',
          token: randomUUID(),
        },
      });
    }

    // Verify password
    if (user.password !== password) {
      return NextResponse.json({ success: false, error: 'Mot de passe incorrect' }, { status: 401 });
    }

    // Generate token
    const token = randomUUID();
    await db.user.update({ where: { id: user.id }, data: { token } });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        products: user.products ? user.products.split(',').filter(Boolean) : [],
        status: user.status,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
