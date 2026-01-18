import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: "Invalid content" }, { status: 400 });
        }

        if (text.length > 280) {
            return NextResponse.json({ error: "Too long" }, { status: 400 });
        }

        if (text.trim().length === 0) {
            return NextResponse.json({ error: "Empty" }, { status: 400 });
        }

        // Basic spam check: Check if same text exists recently? 
        // Or just create.

        await prisma.submission.create({
            data: {
                text: text.trim(),
                approved: false
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
