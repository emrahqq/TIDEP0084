# Adding New Sensor Support To Sub1GHz Sensor to Cloud Linux Gateway

In this tutorial, we will go through all the necessary steps to add a generic sensor to the Sensor To Cloud application. 

In the `/final` folder, all the necessary changes to add the generic sensor to the project are already implemented and can be used as a reference. It also includes all hex files for the LaunchPads. Let's start by getting the `/final` project working first to see how our generic sensor will function. 

In the `/tutorial` folder, the original Sensor To Cloud project and necessary LaunchPad hex files are included. The tutorial README will walk through all the steps necessary to add the generic sensor to the project. Since the actual CCS projects are not included, you will need to copy these from the latest SDK. 

## Requirements
- 2x CC1310 LaunchPads ([http://www.ti.com/tool/LAUNCHXL-CC1310](http://www.ti.com/tool/LAUNCHXL-CC1310))
- UniFlash ([http://www.ti.com/tool/UNIFLASH](http://www.ti.com/tool/UNIFLASH))
- SIMPLELINK-CC13X0-SDK ([http://www.ti.com/tool/SIMPLELINK-CC13X0-SDK](http://www.ti.com/tool/SIMPLELINK-CC13X0-SDK))
- Code Composer Studio ([http://www.ti.com/tool/CCSTUDIO](http://www.ti.com/tool/CCSTUDIO))
    - Version must be supported in the current SIMPLELINK-CC13x0-SDK
- Linux machine (Ubuntu 14.04) or Beagle Bone Black ([PROCESSOR-SDK-LINUX-AM335X](http://www.ti.com/tool/PROCESSOR-SDK-AM335X))
    - Node.js (already incldued in PROCESSOR-SDK-LINUX-AM335X)

To continue, there are two options:
1. navigate to the `/final` folder and follow the README instructions to run the final project with the generic sensor already implemented. This will allow you to see your end goal when following the `/tutorial`. This also provides a reference to compare against after you have completed the `/tutorial`.
2. navigate to the `/tutorial` folder and follow the README instructions to follow the step by step instructions which illustrate via an example of generic sensor how to add new sensor support to the Sensor To Cloud gateway. 
