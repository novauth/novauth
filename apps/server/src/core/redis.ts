/**
 * Async wrapper for the redis package
 */
import redis from 'redis'

let client: redis.RedisClient

async function init(): Promise<void> {
  if (process.env.REDIS_URL !== undefined)
    client = redis.createClient(String(process.env.REDIS_URL))
  else client = redis.createClient(Number(process.env.REDIS_PORT), String(process.env.REDIS_HOST))
  return await new Promise<void>((resolve, reject) => {
    client.on('error', (error) => {
      console.error('Error while interacting with the redis server ')
      console.error(error)
      reject(error)
    })
    client.on('ready', () => client.flushall(() => resolve()))
  })
}

function getClient(): redis.RedisClient {
  return client
}

async function set(key: string, value: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    client.set(key, value, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

async function setex(key: string, seconds: number, value: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    client.setex(key, seconds, value, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

async function setpx(key: string, ms: number, value: string): Promise<string | undefined> {
  return await new Promise((resolve, reject) => {
    client.set(key, value, 'PX', ms, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

async function get(key: string): Promise<string | null> {
  return await new Promise((resolve, reject) => {
    client.get(key, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

async function del(keys: string | string[]): Promise<number> {
  return await new Promise((resolve, reject) => {
    client.del(keys, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

async function keys(pattern: string): Promise<string[]> {
  return await new Promise((resolve, reject) => {
    client.keys(pattern, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

async function zadd(set: string, score: number, member: string): Promise<number> {
  return await new Promise((resolve, reject) => {
    client.zadd(set, score, member, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

async function zcard(set: string): Promise<number> {
  return await new Promise((resolve, reject) => {
    client.zcard(set, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

async function zrem(set: string, members: string | string[]): Promise<number> {
  return await new Promise((resolve, reject) => {
    client.zrem(set, members, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

async function zrevrangebyscore(
  set: string,
  min: number | string,
  max: number | string
): Promise<string[]> {
  return await new Promise((resolve, reject) => {
    client.zrevrangebyscore(set, min, max, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

async function zrangebyscore(
  set: string,
  min: number | string,
  max: number | string
): Promise<string[]> {
  return await new Promise((resolve, reject) => {
    client.zrangebyscore(set, min, max, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

async function zscore(set: string, member: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    client.zscore(set, member, (err, res) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

export default {
  init,
  getClient,
  get,
  keys,
  set,
  setex,
  setpx,
  del,
  zadd,
  zcard,
  zrangebyscore,
  zrem,
  zrevrangebyscore,
  zscore,
}
