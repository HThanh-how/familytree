import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ensure this path is correct based on alias
import redis from '@/lib/redis';

export async function GET() {
  try {
    // 1. Try to get from Cache
    const cachedData = await redis.get('family_tree_data');
    if (cachedData) {
      console.log("[API] Returning cached family data");
      return NextResponse.json(JSON.parse(cachedData));
    }

    console.log("[API] Cache miss, fetching from DB...");

    // 2. Fetch from DB
    const people = await prisma.person.findMany({});

    // Transform to match legacy frontend structure
    // The frontend buildFamilyTree takes a list and builds hierarchy,
    // so we can put everyone in one generation.
    const transformedPeople = people.map(p => ({
      id: p.id,
      name: p.name,
      info: p.info || "",
      birthYear: p.birthYear || undefined,
      deathYear: p.deathYear || undefined,
      fatherId: p.fatherId || undefined,
      avatarUrl: p.avatarUrl || undefined,
    }));

    const responseData = {
      generations: [
        {
          title: "From Database",
          people: transformedPeople
        }
      ]
    };

    // 3. Set Cache
    // Store as JSON string
    await redis.set('family_tree_data', JSON.stringify(responseData));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error loading family data:', error);
    return NextResponse.json(
      { error: 'Failed to load family data' },
      { status: 500 }
    );
  }
}