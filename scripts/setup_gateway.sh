#!/bin/bash

HERE=$PWD

UUID=$(cat /etc/machine-id)
HOSTNAME="SensorToCloud-${UUID: -4}"
echo "${HOSTNAME}" > /etc/hostname
echo "Hostname is now ${HOSTNAME}"

if [ ! -d "${HERE}/../example/commissioner/webserver/uploads" ]
then
  cd ${HERE}/../example/commissioner/webserver/
  mkdir uploads
fi

echo "Downloading and installing required Node.js dependency packages"
echo "This requires an active internet connection..."
if [ ! -d "${HERE}/../example/iot-gateway/node_modules" ]
then
  cd ${HERE}/../example/iot-gateway/
  npm install
fi

if [ ! -d "${HERE}/../example/commissioner/node_modules" ]
then
  cd ${HERE}/../example/commissioner/
  npm install
fi