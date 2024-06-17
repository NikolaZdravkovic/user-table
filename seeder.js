import { faker } from '@faker-js/faker';
import { writeFileSync } from 'fs';

const generateUsers = (numUsers) => {
  const users = [];
  for (let i = 1; i <= numUsers; i++) {
    const user = {
      id: i,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
      dob: faker.date.past({ years: 30 }).getTime(),
      status: faker.helpers.arrayElement(['Approved', 'Pending', 'Declined']),
      createdAt: faker.date.past({ years: 3 }).getTime(),
      updatedAt: faker.date.past({ years: 1 }).getTime()
    };
    users.push(user);
  }
  return users;
};

const users = generateUsers(140);
const data = { users };

writeFileSync('api/db.json', JSON.stringify(data, null, 2));
console.log('Mock data generated and saved to db.json');
