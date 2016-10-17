#!/usr/bin/env python3
import json
import redis
import requests
import signal
import sys
from lxml import html

class Job:
	def __init__(self, data):
		parsed = json.loads(data.decode())
		self.id = parsed['id']
		self.url = parsed['url']

	def run(self):
		try:
			response = requests.get(self.url)
		except error:
			print('problem fetching url', error)
			return

		tree = html.fromstring(response.content)

		self.links = tree.xpath('//a/@href')
	
	def serialize(self):
		return json.dumps({
			'id': self.id,
			'url': self.url,
			'links': self.links
		})

class JobQueue:
	def __init__(self, config):
		self.redis = redis.StrictRedis(
			host=config['host'],
			port=config['port'])

	def pop(self):
		return Job(self.redis.blpop('pending')[1])

	def push(self, job):
		self.redis.lpush('done', job.serialize())

config = json.load(open('../config.json'))
queue = JobQueue(config['redis'])
running = True

def exit(signal, frame):
	global running

	print('quiting gracefully...')
	running = False

signal.signal(signal.SIGINT, exit)

while running:
	job = queue.pop()
	print('recieved job for', job.url)
	job.run()
	print('found', len(job.links), 'links')
	queue.push(job)
	print('done sending links')
