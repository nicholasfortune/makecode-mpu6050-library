# MPU6050 Extension
This Microsoft MakeCode extension provides basic support for the MPU6050 gyroscope.


## Blocks included are:
### Pitch, yaw and roll velocities and angular positions
Roll velocities are in deg/s, and angular positions only update with "Auto sample" enabled.

### Initialize gyro
Wakes the MPU6050, checks if the MPU6050 is on the right address, and configures sensitivity, filters, and sample rate optimally.

### Calibrate gyroscope for **ms** milliseconds
Calibrates gyroscope drift for a specified amount of milliseconds. Please keep the gyroscope still while doing this.

### Turn on and off auto sample
Two seperate blocks to turn on and off auto sample. The pitch, yaw, and roll variables do not ever update when auto sampling is off.

### Zero position
Sets pitch, yaw, and roll to zero; effectively reseting all gyroscope logic


## Advanced blocks
### Raw read 3 axis
Updates pitch, yaw, and roll velocity variables with raw, uncalibrated sensor data.

### Read 3 axis 
Updates pitch, yaw, and roll position variables with calibrated sensor data. **This does not update the rotational position variables**


## Implementation
It is recommended that you use the extension's blocks in this order and way:
1. **Initialize gyro**
2. **Calibrate gyroscope for** *500* **milliseconds**
3. **Turn on auto sample**

**Then use the angular position variables as you wish!**

## License
This Microsoft Makecode Extension is licensed under the [CC BY-NC-ND 4.0](LICENSE) license.
