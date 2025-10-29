#!/usr/bin/env node
import { generateAdminPasswordHash } from './password';

// 从命令行参数获取密码
const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run generate-admin-hash <password>');
  console.error('Example: npm run generate-admin-hash my-secure-password');
  process.exit(1);
}

generateAdminPasswordHash(password)
  .then(() => {
    console.log('\nAdd this to your docker-compose.yml or .env file:');
    console.log('ADMIN_PASSWORD=<generated-hash-above>');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error generating hash:', error);
    process.exit(1);
  });