#!/bin/bash
mkdir -p mongodb_data
mongod --dbpath ./mongodb_data --bind_ip 127.0.0.1 --fork --logpath ./mongodb_data/mongod.log
echo "MongoDB started. Logs at ./mongodb_data/mongod.log"
