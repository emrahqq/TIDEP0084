#!/bin/bash

HERE=$PWD

echo "Do you want to configure the BeagleBone Black to use the Wireless cape? (y/n)"
read INPUT
while [ "${INPUT}" != "y" ] && [ "${INPUT}" != "n" ]
do
  echo "Do you want to configure the BeagleBone Black to use the Wireless cape? (y/n)"
  read INPUT
done
if [ "${INPUT}" == "n" ]
then
  exit 0
fi

if [ ! -f "/boot/am335x-boneblack.dtb" ]
then
  echo "Cannot find device tree file /boot/am335x-boneblack.dtb."
  echo "Make sure to boot from the am335x processor SDK flashed onto an SD card."
  echo "You can boot to the SD card by holding S1 on power-up."
  exit 1
fi


if [ -f "../devicetree-zImage-am335x-boneblack-wifi-cape-e14.dtb" ]
then
  cp ../devicetree-zImage-am335x-boneblack-wifi-cape-e14.dtb /boot/
  cd /boot/
  mv am335x-boneblack.dtb am335x-boneblack.dtb.backup
  ln -s devicetree-zImage-am335x-boneblack-wifi-cape-e14.dtb am335x-boneblack.dtb
  echo "wifi-cape device tree will be used on next boot. Execute the following command to revert to the stock device tree file:"
  echo "ln -s devicetree-zImage-am335x-evm.dtb am335x-boneblack.dtb"
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

echo "This BeagleBone will now advertise a Wi-Fi network."
echo "Enter your desired network name. Press enter to skip."
read NET_NAME
if [ "x${NET_NAME}x" != "xx" ] ; then
  echo "SSID is now ${NET_NAME}"
  sed -i -e "/^ssid=/ s/=.*/=${NET_NAME}/" /usr/share/wl18xx/hostapd.conf
fi

echo "Please enter a password for this network (must be at least 8 characters)."
echo "Press enter to leave the network open."
read PASSWORD
echo "Please enter your password again."
read PASS2
if [ $PASSWORD == $PASS2 ]
then
  if [ "x${PASSWORD}x" == 'xx' ]
  then
    echo "${NET_NAME} is now an open network."
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

echo "Reboot required for changes to take effect. Reboot now? (y/n)"
read INPUT
while [ "${INPUT}" != "y" ] && [ "${INPUT}" != "n" ]
do
  echo "Reboot required for changes to take effect. Reboot now? (y/n)"
  read INPUT
done

if [ "${INPUT}" == "y" ]
then
  reboot
fi

exit 0