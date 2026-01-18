import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const items = await prisma.content.findMany({
            where: { approved: true },
            select: { id: true, weight: true }
        });

        if (items.length === 0) {
            return NextResponse.json({ text: "Nothing here yet.", type: "system" });
        }

        // Weighted random selection
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedId = items[0].id;

        for (const item of items) {
            random -= item.weight;
            if (random <= 0) {
                selectedId = item.id;
                break;
            }
        }

        const content = await prisma.content.findUnique({
            where: { id: selectedId },
            select: {
                id: true,
                text: true,
                type: true
                // Exclude internal fields
            }
        });

        return NextResponse.json(content);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
