#!/bin/bash

cd ${PWD}/scripts/

if [ -f "setup_gateway.sh" ]
then
  echo "Executing setup_gateway.sh"
  bash setup_gateway.sh
fi

if [ -f "autostart_gui.sh" ]
then
  echo "Executing autostart_gui.sh"
  bash autostart_gui.sh
fi

if [ -f "setup_wireless_cape.sh" ]
then
  echo "Executing setup_wireless_cape.sh"
  bash setup_wireless_cape.sh
fi

exit 0