
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const websites = await prisma.website.findMany()
    console.log('Websites:', websites)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
