import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DATA FROM src/data/familyDataWithIds.ts
const familyDataWithIds = {
    generations: [
        {
            title: "Generated Generation 1",
            people: [
                {
                    id: "gen1_person1",
                    name: "Person 1",
                    info: "Living in Generation 1",
                    birthYear: 1950,
                }
            ]
        }
    ]
};
// Note: I will replace the above mock with actual file content if tool allows, 
// otherwise I will just read the file dynamically using fs in this script, which is safer than import.

import * as fs from 'fs';
import * as path from 'path';

async function main() {
    // Read the file content
    const dataPath = path.join(process.cwd(), 'config', 'family-data.json');
    console.log("Reading data from:", dataPath);

    let data;
    try {
        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        data = JSON.parse(fileContent);
    } catch (e) {
        console.error("Failed to read/parse data file:", e);
        return;
    }
    if (!data || !data.generations) {
        console.error("No data found or invalid format")
        return
    }

    console.log("Starting import...")

    interface JsonPerson {
        id: string
        name: string
        info: string
        birthYear?: number
        deathYear?: number
        spouse?: string
        fatherId?: string
        avatarUrl?: string
        children?: JsonPerson[]
    }

    // 1. Flatten all people to a Map for easy access
    const allPeople = new Map<string, JsonPerson>()

    function collectPeople(people: JsonPerson[]) {
        for (const p of people) {
            allPeople.set(p.id, p)
            if (p.children) collectPeople(p.children)
        }
    }

    for (const gen of data.generations) {
        collectPeople(gen.people)
    }

    console.log(`Found ${allPeople.size} unique people.`)

    // 2. Create People records (without relations first)
    for (const p of allPeople.values()) {
        await prisma.person.upsert({
            where: { id: p.id },
            update: {
                name: p.name,
                info: p.info,
                birthYear: p.birthYear,
                deathYear: p.deathYear,
                avatarUrl: p.avatarUrl,
            },
            create: {
                id: p.id,
                name: p.name,
                info: p.info,
                birthYear: p.birthYear,
                deathYear: p.deathYear,
                avatarUrl: p.avatarUrl,
            }
        })
    }

    // 3. Update Relations (Father, Spouse)
    console.log("Updating relations...")
    for (const p of allPeople.values()) {
        const updateData: any = {}

        // Father
        if (p.fatherId && allPeople.has(p.fatherId)) {
            updateData.fatherId = p.fatherId
        }

        // Spouse
        if (p.spouse && allPeople.has(p.spouse)) {
            updateData.spouses = {
                connect: [{ id: p.spouse }]
            }
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.person.update({
                where: { id: p.id },
                data: updateData
            })
        }
    }

    console.log("Import completed successfully.")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
