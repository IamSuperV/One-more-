import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const contentData = [
    { text: "You have never seen your own face, only reflections and photos.", type: "fact", weight: 3 },
    { text: "One day, you will place a book down and never pick it up again.", type: "thought", weight: 4 },
    { text: "We suffer more often in imagination than in reality.", type: "thought", weight: 5 },
    { text: "Confession: I check their profile every day, even though we haven't spoken in years.", type: "confession", weight: 2 },
    { text: "If you could see the deadline of your life, what would you stop doing immediately?", type: "question", weight: 5 },
    { text: "Most of your memories are actually memories of memories.", type: "fact", weight: 3 },
    { text: "You are the villain in someone else's story.", type: "thought", weight: 5 },
    { text: "Everything you own will one day belong to someone else.", type: "fact", weight: 4 },
    { text: "Confession: I lied when I said I was fine.", type: "confession", weight: 2 },
    { text: "Is it better to speak or to die?", type: "question", weight: 3 },
    { text: "The universe doesn't care about your plans.", type: "thought", weight: 4 },
    { text: "You are younger today than you will ever be again.", type: "fact", weight: 5 },
  ]

  console.log(`Start seeding ...`)
  for (const c of contentData) {
    const content = await prisma.content.create({
      data: c,
    })
    console.log(`Created content with id: ${content.id}`)
  }
  console.log(`Seeding finished.`)
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
