namespace MPU6050 {
    // Variables
        // Axis rotational velocities
        let pitch_vel = 0;
        let yaw_vel = 0;
        let roll_vel = 0;

        // Axis calibration numbers
        let pitch_calibration = 0
        let yaw_calibration = 0
        let roll_calibration = 0



    // Helper; reads from a specified register
    function readregister(register: number): number {
        // Read from the register
        let addr = 0x68
        pins.i2cWriteNumber(addr, register, NumberFormat.UInt8BE, false)
        let buf = pins.i2cReadBuffer(addr, 2, false)

        // Some bitshifting or something
        let value = (buf[0] << 8) | buf[1]
        if (value >= 0x8000) value -= 0x10000
        return value
    }



    //% block="Raw read 3 axis"
    export function rawread3axis(): void {
        // Read from each register and put it into their variable
        pitch_vel = readregister(0x43);
        yaw_vel = readregister(0x45);
        roll_vel = readregister(0x47);
    }



    //% block="Calibrate gyroscope"
    export function calibrate(miliseconds: number): void {
        // Initialize the sums
        let sum_pitch_vel = 0;
        let sum_yaw_vel = 0;
        let sum_roll_vel = 0;

        // Collect rotational velocities over a specified amount of ms
        for (let i = 0; i < miliseconds; i++) {
            rawread3axis();
            sum_pitch_vel += pitch_vel;
            sum_yaw_vel += yaw_vel;
            sum_roll_vel += roll_vel;
            basic.pause(1);
        }

        // Average the rotational velocities
        pitch_calibration = sum_pitch_vel / miliseconds;
        yaw_calibration = sum_yaw_vel / miliseconds;
        roll_calibration = sum_roll_vel / miliseconds;
    }



    //% block="Read 3 axis"
    export function read3axis(): void {
        rawread3axis();
        pitch_vel -= pitch_calibration;
        yaw_vel -= yaw_calibration;
        roll_vel -= roll_calibration;
    }
}
