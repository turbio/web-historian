#!/usr/bin/env python3
import redis
import json

config = json.load(open('../config.json'))['redis']

client = redis.StrictRedis(
	host=config['host'],
	port=config['port'])

while True:
	job = client.blpop('pending')[1]
	client.rpush('pending-test', job)
