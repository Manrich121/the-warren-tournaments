// prisma/seed.ts

import { PrismaClient, PointMetricType, TieBreakerType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedScoringSystem() {
  console.log('Seeding default scoring system...');

  // Create default scoring system
  const defaultSystem = await prisma.scoringSystem.upsert({
    where: { name: 'Standard Scoring' },
    update: {},
    create: {
      name: 'Standard Scoring',
      isDefault: true,
      formulas: {
        create: [
          {
            multiplier: 1,
            pointMetric: PointMetricType.EVENT_ATTENDANCE,
            order: 1
          },
          { multiplier: 3, pointMetric: PointMetricType.FIRST_PLACE, order: 2 },
          {
            multiplier: 2,
            pointMetric: PointMetricType.SECOND_PLACE,
            order: 3
          },
          { multiplier: 1, pointMetric: PointMetricType.THIRD_PLACE, order: 4 }
        ]
      },
      tieBreakers: {
        create: [
          { type: TieBreakerType.LEAGUE_POINTS, order: 1 },
          { type: TieBreakerType.MATCH_POINTS, order: 2 },
          { type: TieBreakerType.OPP_MATCH_WIN_PCT, order: 3 },
          { type: TieBreakerType.GAME_WIN_PCT, order: 4 },
          { type: TieBreakerType.OPP_GAME_WIN_PCT, order: 5 }
        ]
      }
    }
  });

  console.log('Default scoring system created:', defaultSystem.id);
}

async function main() {
  console.log('Starting database seeding...');

  await seedScoringSystem();

  console.log('Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
