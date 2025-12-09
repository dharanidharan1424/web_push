
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const websites = await prisma.website.findMany()
    console.log('Websites:', websites.map(w => ({ id: w.id, name: w.name })))

    const segments = await prisma.segment.findMany()
    console.log('Segments:', segments)

    const subscribers = await prisma.subscriber.findMany()
    console.log('Subscribers:', subscribers.length)

    const subscriberSegments = await prisma.subscriberSegment.findMany()
    console.log('SubscriberSegments:', subscriberSegments)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
