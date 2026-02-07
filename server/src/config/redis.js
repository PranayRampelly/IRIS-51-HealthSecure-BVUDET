import Redis from 'ioredis';
import { promisify } from 'util';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
};

class RedisClient {
  constructor() {
    this.client = new Redis(redisConfig);
    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => console.log('Connected to Redis'));
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? value : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, options = {}) {
    try {
      if (options.ex) {
        await this.client.setex(key, options.ex, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async setex(key, seconds, value) {
    try {
      await this.client.setex(key, seconds, value);
      return true;
    } catch (error) {
      console.error('Redis setex error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  async flushAll() {
    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      console.error('Redis flushAll error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async expire(key, seconds) {
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Redis expire error:', error);
      return false;
    }
  }

  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return -2;
    }
  }

  async keys(pattern) {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  }

  async hset(key, field, value) {
    try {
      await this.client.hset(key, field, value);
      return true;
    } catch (error) {
      console.error('Redis hset error:', error);
      return false;
    }
  }

  async hget(key, field) {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      console.error('Redis hget error:', error);
      return null;
    }
  }

  async hgetall(key) {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      console.error('Redis hgetall error:', error);
      return null;
    }
  }

  async hdel(key, field) {
    try {
      await this.client.hdel(key, field);
      return true;
    } catch (error) {
      console.error('Redis hdel error:', error);
      return false;
    }
  }

  async incr(key) {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('Redis incr error:', error);
      return null;
    }
  }

  async decr(key) {
    try {
      return await this.client.decr(key);
    } catch (error) {
      console.error('Redis decr error:', error);
      return null;
    }
  }

  // For rate limiting
  async rateLimitIncr(key, limit, windowInSeconds) {
    const multi = this.client.multi();
    multi.incr(key);
    multi.expire(key, windowInSeconds);
    
    try {
      const results = await multi.exec();
      const count = results[0][1];
      return count <= limit;
    } catch (error) {
      console.error('Redis rate limit error:', error);
      return false;
    }
  }

  // For caching with automatic expiry
  async cache(key, callback, expiry = 3600) {
    try {
      const cached = await this.get(key);
      if (cached) {
        return JSON.parse(cached);
      }

      const fresh = await callback();
      await this.setex(key, expiry, JSON.stringify(fresh));
      return fresh;
    } catch (error) {
      console.error('Redis cache error:', error);
      return null;
    }
  }

  // For pub/sub messaging
  async publish(channel, message) {
    try {
      await this.client.publish(channel, message);
      return true;
    } catch (error) {
      console.error('Redis publish error:', error);
      return false;
    }
  }

  subscribe(channel, callback) {
    const subscriber = this.client.duplicate();
    subscriber.subscribe(channel);
    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(message);
      }
    });
    return subscriber;
  }

  // For managing doctor availability
  async setDoctorAvailability(doctorId, status, reason = '') {
    const key = `doctor:availability:${doctorId}`;
    return this.hset(key, 'status', JSON.stringify({ status, reason, updatedAt: new Date() }));
  }

  async getDoctorAvailability(doctorId) {
    const key = `doctor:availability:${doctorId}`;
    const status = await this.hget(key, 'status');
    return status ? JSON.parse(status) : null;
  }

  // For managing appointment slots
  async lockAppointmentSlot(doctorId, slotId, patientId, duration = 300) {
    const key = `slot:lock:${doctorId}:${slotId}`;
    const result = await this.set(key, patientId, { ex: duration, nx: true });
    return result === 'OK';
  }

  async releaseAppointmentSlot(doctorId, slotId) {
    const key = `slot:lock:${doctorId}:${slotId}`;
    return this.del(key);
  }

  // For managing doctor locations
  async updateDoctorLocation(doctorId, latitude, longitude) {
    const key = `doctor:location:${doctorId}`;
    return this.hset(key, 'coords', JSON.stringify({ latitude, longitude, updatedAt: new Date() }));
  }

  async getDoctorLocation(doctorId) {
    const key = `doctor:location:${doctorId}`;
    const coords = await this.hget(key, 'coords');
    return coords ? JSON.parse(coords) : null;
  }
}

export const redisClient = new RedisClient(); 