#!/bin/bash

HERE=$PWD

echo "Do you want the web app GUI to run on boot? (y/n)"
read INPUT
while [ "${INPUT}" != "y" ] && [ "${INPUT}" != "n" ]
do
  echo "Do you want the web app GUI to run on boot? (y/n)"
  read INPUT
done
if [ "${INPUT}" == "y" ]
then
  echo "Installing autostart service to run at start-up"
  cd $HERE/../example/commissioner/
  cp autostart.service /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable autostart.service
else
  systemctl disable autostart.service
fi

exit 0