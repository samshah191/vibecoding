// Test to verify Prisma models exist
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This will show us what models are available
console.log('Available models:');
console.log(Object.keys(prisma));

// Test if project model exists
console.log('\nProject model exists:', typeof prisma.project !== 'undefined');
console.log('ProjectVersion model exists:', typeof prisma.projectVersion !== 'undefined');
console.log('ProjectCollaborator model exists:', typeof prisma.projectCollaborator !== 'undefined');
console.log('ProjectExport model exists:', typeof prisma.projectExport !== 'undefined');

// Close the connection
prisma.$disconnect();