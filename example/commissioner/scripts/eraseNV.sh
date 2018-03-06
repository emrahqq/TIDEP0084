#!/bin/bash

NV="../../prebuilt/bin/nv-simulation.bin"

if [ -f $NV ] ; then
  rm $NV
  echo "NV erased"
fi

exit 0