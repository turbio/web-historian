return redis.call("zadd", "queue", redis.call("incr", "index"), KEYS[1])
