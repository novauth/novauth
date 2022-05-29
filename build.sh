#!/bin/bash

npm --prefix packages/common run build;

if [[ $NODE_ENV != "production" || $NODE_ENV == "production" && $PROCESS == "server" ]]
then
    npm --prefix apps/server run build;
fi