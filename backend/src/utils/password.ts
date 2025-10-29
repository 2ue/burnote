import { promisify } from 'util';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';

const scryptAsync = promisify(scrypt);

// 密码哈希参数（与argon2安全性相当）
const SCRYPT_KEYLEN = 64;  // 输出长度
const SCRYPT_N = 32768;    // CPU/内存成本
const SCRYPT_R = 8;        // 块大小
const SCRYPT_P = 1;        // 并行化

export interface HashedPassword {
  salt: string;
  hash: string;
  params: {
    n: number;
    r: number;
    p: number;
    keylen: number;
  };
}

/**
 * 哈希密码 - 使用Node.js内置的scrypt
 * @param password 明文密码
 * @returns base64编码的哈希字符串（包含salt和参数）
 */
export async function hashPassword(password: string): Promise<string> {
  // 生成随机salt
  const salt = randomBytes(16);

  // 使用scrypt哈希
  const derivedKey = await scryptAsync(password, salt, SCRYPT_KEYLEN) as Buffer;

  // 构造哈希对象
  const hashedPassword: HashedPassword = {
    salt: salt.toString('base64'),
    hash: derivedKey.toString('base64'),
    params: {
      n: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
      keylen: SCRYPT_KEYLEN
    }
  };

  // 存储为JSON字符串（向后兼容）
  return Buffer.from(JSON.stringify(hashedPassword)).toString('base64');
}

/**
 * 验证密码
 * @param hashedPassword 哈希后的密码（base64字符串）
 * @param password 要验证的明文密码
 * @returns 是否匹配
 */
export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
  try {
    // 检查是否为旧格式（明文或argon2）
    if (!hashedPassword.startsWith('ey')) {
      // 不是我们的新格式，可能是明文密码
      return password === hashedPassword;
    }

    // 解析哈希数据
    const hashedData: HashedPassword = JSON.parse(
      Buffer.from(hashedPassword, 'base64').toString('utf-8')
    );

    // 使用相同的参数重新哈希
    const salt = Buffer.from(hashedData.salt, 'base64');
    const derivedKey = await scryptAsync(password, salt, hashedData.params.keylen) as Buffer;

    // 比较哈希值
    const expectedHash = Buffer.from(hashedData.hash, 'base64');

    // 使用恒定时间比较（防时序攻击）
    return timingSafeEqual(derivedKey, expectedHash);
  } catch (error) {
    // 如果解析失败，可能是旧格式，尝试明文比较
    return password === hashedPassword;
  }
}

/**
 * 为管理员密码生成哈希（用于环境变量配置）
 * @param password 明文密码
 * @returns 哈希后的密码（可直接设置为ADMIN_PASSWORD）
 */
export async function generateAdminPasswordHash(password: string): Promise<string> {
  const hash = await hashPassword(password);
  console.log('Generated admin password hash:');
  console.log(`ADMIN_PASSWORD=${hash}`);
  return hash;
}