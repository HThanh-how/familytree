import { PrismaClient } from '@prisma/client'
import { familyDataWithIds } from '../data/familyDataWithIds'

const prisma = new PrismaClient()

// Types matching the JSON structure
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

interface JsonGeneration {
    title: string
    people: JsonPerson[]
}

interface JsonFamilyData {
    generations: JsonGeneration[]
}

async function main() {
    const data = familyDataWithIds as JsonFamilyData

    if (!data || !data.generations) {
        console.error("No data found")
        return
    }

    console.log("Starting import...")

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
                // Default gender based on some logic or leave null? 
                // Current data doesn't specify gender explicitly, but `fatherId` implies hierarchy.
                // We'll leave gender as default 'male' for now or infer?
                // Let's just map fields we have.
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
            // Connect spouse bi-directionally? Or just one way?
            // Prisma self-relation M-N:
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
