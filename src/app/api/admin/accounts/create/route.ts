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
    const { name, email, password, products } = body;

    if (!name || !email || !password || !products || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Tous les champs sont requis avec au moins un produit',
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Le mot de passe doit avoir au moins 6 caractères',
      }, { status: 400 });
    }

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Un compte avec cette adresse courriel existe déjà',
      }, { status: 409 });
    }

    const productsStr = Array.isArray(products) ? products.join(',') : products;

    const newUser = await db.user.create({
      data: {
        name,
        email,
        password,
        products: productsStr,
        role: 'client',
        status: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        products: newUser.products ? newUser.products.split(',').filter(Boolean) : [],
        status: newUser.status,
        createdAt: newUser.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
