#!/bin/bash

echo "Demolishing your awesome stacks..."

cd profile
serverless remove

cd ..
cd gateway
serverless remove

echo "Demolishing complete :)"
read
