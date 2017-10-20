# Sensor To Cloud - Running Final Version with Generic Sensor

This folder includes the final application with the generic sensor support added. This final applications purpose is to provide developers with the final code that you should have after completing the tutorial. Furthermore, developers can use the code and instructions to first run the completed application to visualize how the final application with generic sensor support added would function after following the tutorial. Let's get started!

## Requirements
- 2x CC1310 LaunchPads ([http://www.ti.com/tool/LAUNCHXL-CC1310](http://www.ti.com/tool/LAUNCHXL-CC1310))
- UniFlash ([http://www.ti.com/tool/UNIFLASH](http://www.ti.com/tool/UNIFLASH))
- Linux machine (Ubuntu 14.04) or Beagle Bone Black ([PROCESSOR-SDK-LINUX-AM335X](http://www.ti.com/tool/PROCESSOR-SDK-AM335X))
    - Node.js (already incldued in PROCESSOR-SDK-LINUX-AM335X)

## Flashing CC1310 LaunchPads

The necessary hex files have already been generated for you and are located in the `/final/hex/` folder. For the Sensor To Cloud project, we need a minimum of two CC1310 LaunchPads. One will act as the Coprocessor (to communicate between sensor nodes and the Linux collector application), and the other will act as a sensor node. We will use TI UniFlash to flash these LaunchPads with the appropriate firmware. Let's get started. 

### Flash Coprocessor

1. If you have not already, download UniFlash from [http://www.ti.com/tool/UNIFLASH](http://www.ti.com/tool/UNIFLASH). 
2. Open UniFlash, connect one of the CC1310 LaunchPads to your compiter and choose the connected device in UniFlash. 
3. Click "Browse" and select the `/final/hex/coprocessor_cc1310lp.hex` file. 
4. Click the "Load Image" button to flash the image.  

### Flash Sensor

1. If you have not already, download UniFlash from [http://www.ti.com/tool/UNIFLASH](http://www.ti.com/tool/UNIFLASH). 
2. Open UniFlash, connect the second CC1310 LaunchPad to your compiter and choose the connected device in UniFlash. 
3. Click "Browse" and select the `/final/hex/sensor_generic_cc1310lp.hex` file. 
4. Click the "Load Image" button to flash the image.  


## Start Linux Collector
1. Copy the `/final/` folder to the Linux machine. 
2. Open a terminal and navigate to the collector folder `../final/SensorToCloud/`
3. Build all the necessary files for the project. 
    - `sudo ./build_all.sh`
4. Navigate to the collector folder `../final/SensorToCloud/example/collector/`
5. Build the collector C project by running the following command.
    - `sudo make clean`
    - `sudo make host`
6. Connect the CC1310 LaunchPad running the `coprocessor_cc1310lp` project to the Linux machine via USB.  
    - If you are using a Virtual Machine, you must connect the LaunchPad device to the Virtual Machine. 
7. Check what serial port the CC1310 LaunchPad is connected to by running the following command. 
    - `ls -l /dev/ttyACM*`
8. The collector application is configured to look at `/dev/ttyACM0` by default. If the previous command did not return a device is connected to `/dev/ttyACM0` and `/dev/ttyACM1`, the port needs to be changed in the `collector.cfg` file. 
    - To change the COM port, edit the `devname` parameter in the `/final/SensorToCloud/example/collector/collector.cfg` file. Save all changes. 
9. Run the `run_collector.sh` file that was generated during the build by running the following command in the `/final/SensorToCloud/example/collector` folder. 
    - `sudo ./run_collector.sh collector.cfg`
10. If successful, the Linux Collector will detect the "coprocessor" and then run in the background. 
    - If it failed, try running the command again. Make sure CC1310 LaunchPad is on the proper port defined in the `collector.cfg` file. 

## Start Local Gateway Application
1. Open a new terminal and navigate to the `../final/SensorToCloud/example/iot-gateway/` folder.
2. Install the necessary Node packages by running the following command. 
    - `npm install`
3. After all the necessary node modules have been installed, run the local gateway by entering the following command. 
    - `node iot-gateway.js localhost`
4. In a web browser, navigate to your "localhost" address, port 1350.
    - `http://localhost:1350/`
5. If successful, you will see the "TI 15.4-Stack Linux Gateway Example Application" display. 

## Connecting Sensor to Local Gateway Application
1. Click the `Open` button on the left hand side to allow devices to connect to the network. 
2. The CC1310 LaunchPad running the `sensor_generic_cc1310lp` project should then connect to the network and appear in the application table. 
    - If the sensor does not connect and appear, attempt to RESET or reflash the Sensor LaunchPad device and try again. 

## Using the Generic Sensor Function
1. The generic sensor will send a value that corresponds to the number of times BTN-2 on the Sensor LaunchPad is pressed. (each time BTN-2 is pressed, the generic sensor value is incremented)
2. The generic sensor button on the gateway application will send a command to the corresponding sensor to print "Hello from Sensor To Cloud Gateway" to a terminal. 
3. On Windows:
    - To start a COM terminal with the Sensor LaunchPad, first connect the sensor LaunchPad to the Windows machine via USB. 
    - Open "Device Manager" and determine the COM port the LaunchPad is connected to. 
    - Using a program such as PuTTY, start a "Serial" terminal session on the determined COM port.  


## Congratulations, you have gotten the generic sensor working! Now let's try to follow the tutorial to see what it takes to actually implement the same generic sensor on the Sensor To Cloud gateway. Navigate back to the `../tutorial` folder to begin. 