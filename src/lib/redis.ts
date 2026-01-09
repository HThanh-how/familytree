class FakeRedis {
    private store: Map<string, any>;

    constructor() {
        this.store = new Map();
    }

    async get(key: string): Promise<any | null> {
        const value = this.store.get(key);
        if (!value) return null;
        // Simulate async
        return value;
    }

    async set(key: string, value: any): Promise<void> {
        this.store.set(key, value);
        console.log(`[Redis] Set ${key}`);
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
        console.log(`[Redis] Deleted ${key}`);
    }

    async flush(): Promise<void> {
        this.store.clear();
        console.log(`[Redis] Flushed all keys`);
    }
}

// Global singleton to allow data persistence across hot reloads in dev (mostly)
const globalForRedis = globalThis as unknown as { redis: FakeRedis }

const redis = globalForRedis.redis || new FakeRedis()

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

export default redis;
