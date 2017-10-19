#!/bin/bash

HERE=$PWD

if [ ! -f "/boot/am335x-boneblack.dtb" ]
then
  echo "Cannot find device tree file /boot/am335x-boneblack.dtb."
  echo "Make sure to boot from the am335x processor SD card by holding S1 on power-up."
  exit 1
fi


if [ -f "devicetree-zImage-am335x-boneblack-wifi-cape-e14.dtb" ] && [ ! -f "/boot/devicetree-zImage-am335x-boneblack-wifi-cape-e14.dtb" ]
then
  cp devicetree-zImage-am335x-boneblack-wifi-cape-e14.dtb /boot/
  cd /boot/
  mv am335x-boneblack.dtb am335x-boneblack.dtb.backup
  ln -s devicetree-zImage-am335x-boneblack-wifi-cape-e14.dtb am335x-boneblack.dtb
fi

if [ ! -d "/usr/sbin/wlconf" ]
then
  cp -r /usr/bin/wlconf/ /usr/sbin
  cd /usr/sbin/wlconf/
# echo "Enter the following to configure Wi-Fi cape:"
# echo "Using a TI module? -> yes"
# echo "Chip flavor -> 1837"
# echo "Japanese standards? -> no"
# echo "Number of 2.4 GHz antennas -> 2"
# echo "Number of 5 GHz antennas -> 1"
  sh configure-device.sh << EOD
y
1837
n
2
1
EOD
fi

# change HOSTAPD_BIN_DIR form /usr/local/bin to /usr/bin
cd /usr/share/wl18xx/
sed -i -e 's/local\/bin/sbin/g' ap_start.sh

if [ ! -f "/etc/systemd/system/autostart.service" ]
then
  echo "Installing autostart service to run at start-up"
  cd $HERE/example/commissioner/
  cp autostart.service /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable autostart.service
fi

echo "This BeagleBone will now advertise a Wi-Fi network. Please enter desired network name."
read NET_NAME
if [ "x${NET_NAME}x" != "xx" ] ; then
  echo "SSID is now ${NET_NAME}"
  sed -i -e "/^ssid=/ s/=.*/=${NET_NAME}/" /usr/share/wl18xx/hostapd.conf
fi

echo "Please enter a password for this network (must be at least 8 characters)."
read PASSWORD
echo "Please enter your password again."
read PASS2
if [ $PASSWORD == $PASS2 ]
then
  if [ "x${PASSWORD}x" == 'xx' ]
  then
    echo "SitaraAP is now an open network."
    sed -i "/wpa=1/s/^/#/" /usr/share/wl18xx/hostapd.conf
    # sed -i -e "/wpa_passphrase/ s/=.*/=${PASSWORD}/" /usr/share/wl18xx/hostapd.conf
    sed -i "/wpa_passphrase=/s/^/#/" /usr/share/wl18xx/hostapd.conf
    sed -i "/wpa_key_mgmt=/s/^/#/" /usr/share/wl18xx/hostapd.conf
  else
    echo "Success. Password is '${PASSWORD}'"
    sed -i "/wpa=1/s/^#//" /usr/share/wl18xx/hostapd.conf
    sed -i -e "/wpa_passphrase/ s/=.*/=${PASSWORD}/" /usr/share/wl18xx/hostapd.conf
    sed -i "/wpa_passphrase=/s/^#//" /usr/share/wl18xx/hostapd.conf
    sed -i "/wpa_key_mgmt=/s/^#//" /usr/share/wl18xx/hostapd.conf
    sed -i -e "/wpa_key_mgmt/ s/=.*/=WPA-PSK/" /usr/share/wl18xx/hostapd.conf
  fi
else
  echo "Passwords do not match. Password not changed. Please run script again to change password."
  exit 1
fi

echo "SensorToCloud" > /etc/hostname

echo "Checking node_modules dependencies..."
if [ ! -d "${HERE}/example/commissioner/webserver/uploads" ]
then
  cd ${HERE}/example/commissioner/webserver/
  mkdir uploads
fi
if [ -d "${HERE}/example/iot-gateway/node_modules" ]
then
  echo "node_modules found for iot-gateway!"
else
  npm config set proxy http://webproxy.ext.ti.com:80
  npm config set registry http://registry.npmjs.org/
  cd ${HERE}/example/iot-gateway/
  echo "Installing node_modules for iot-gateway"
  npm install
fi

if [ -d "${HERE}/example/commissioner/node_modules" ]
then
  echo "node_modules found for commisioner!"
else
  echo "Installing node_modules for commissioner"
  cd ${HERE}/example/commissioner/
  npm install
fi

echo "Reboot system for changes to take effect"

exit 0