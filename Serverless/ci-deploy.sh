#!/bin/bash

echo "Running gateway"
cd gateway
serverless deploy -v
sleep 5s

echo "Running profile"
cd ..
cd profile
serverless deploy -v
sleep 5s

echo "Press any key to continue"
read
