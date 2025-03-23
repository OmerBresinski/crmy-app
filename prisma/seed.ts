import {
  PrismaClient,
  Role,
  Priority,
  TaskStatus,
  User,
  Organization,
} from "@prisma/client";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.task.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleared. Starting seed...");

  // Create 40 users
  const users: User[] = [];
  for (let i = 0; i < 40; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const hashedPassword = await bcrypt.hash("password123", 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: i % 4 === 0 ? Role.ADMIN : Role.MEMBER, // Every 4th user starts as admin
      },
    });
    users.push(user);
    console.log(`Created user: ${user.email}`);
  }

  // Create one organization per 4 users
  const organizations: Organization[] = [];
  for (let i = 0; i < users.length / 4; i++) {
    const companyName = faker.company.name();

    const organization = await prisma.organization.create({
      data: {
        name: companyName,
        createdBy: users[i * 4].id, // First user in each group is the creator
      },
    });
    organizations.push(organization);

    // Assign 4 users to this organization
    for (let t = i * 4; t < i * 4 + 4; t++) {
      if (t < users.length) {
        await prisma.user.update({
          where: { id: users[t].id },
          data: { organizationId: organization.id },
        });
        console.log(
          `Assigned user ${users[t].email} to organization: ${organization.name}`
        );
      }
    }
  }

  // Create 10 more organizations (without assigned users)
  for (let i = 0; i < 10; i++) {
    const companyName = faker.company.name();

    // Use a random user as creator but don't assign them to this org
    const randomUserIndex = Math.floor(Math.random() * users.length);

    const organization = await prisma.organization.create({
      data: {
        name: companyName,
        createdBy: users[randomUserIndex].id,
      },
    });
    organizations.push(organization);
    console.log(`Created additional organization: ${organization.name}`);
  }

  console.log(`Created a total of ${organizations.length} organizations`);

  // Debug: Check which users have organizations before creating tasks
  for (const user of users) {
    const refreshedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true },
    });
    console.log(
      `User ${refreshedUser?.email} has organization: ${
        refreshedUser?.organizationId ? "Yes" : "No"
      }`
    );
  }

  // Create 10 tasks for each user
  let taskCount = 0;
  for (const user of users) {
    // Get fresh user data to ensure we have the latest organizationId
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // Skip users without organizations
    if (!freshUser?.organizationId) {
      console.log(
        `Skipping task creation for user ${user.email} - no organization assigned`
      );
      continue;
    }

    for (let j = 0; j < 10; j++) {
      const dueDate = faker.date.future();

      const priorities = [Priority.LOW, Priority.MEDIUM, Priority.HIGH];
      const statuses = [
        TaskStatus.TODO,
        TaskStatus.INPROGRESS,
        TaskStatus.COMPLETED,
      ];

      const taskTitle = faker.company.buzzPhrase();
      const taskDescription = faker.lorem.paragraph();

      try {
        const task = await prisma.task.create({
          data: {
            title: taskTitle,
            description: taskDescription,
            assignedTo: user.id,
            dueDate,
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            organizationId: freshUser.organizationId,
          },
        });

        taskCount++;
        console.log(`Created task: ${task.title} for user ${user.email}`);
      } catch (error) {
        console.error(`Failed to create task for user ${user.email}:`, error);
      }
    }
  }

  console.log(`Seed completed successfully! Created ${taskCount} tasks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
