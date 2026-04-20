import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (token) {
      // Clear the token from the database
      const user = await db.user.findFirst({ where: { token } });
      if (user) {
        await db.user.update({ where: { id: user.id }, data: { token: null } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: true }); // Always return success for logout
  }
}
