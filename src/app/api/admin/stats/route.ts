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

    const allUsers = await db.user.findMany();
    const proCount = allUsers.filter((u) => u.products.includes('pro')).length;
    const flipbookCount = allUsers.filter((u) => u.products.includes('flipbook')).length;
    const activeCount = allUsers.filter((u) => u.status === 'active').length;

    const projectsCount = await db.project.count();

    return NextResponse.json({
      success: true,
      stats: {
        pro: proCount,
        sites: projectsCount,
        active: activeCount,
        flipbooks: flipbookCount,
        accounts: allUsers.length,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
