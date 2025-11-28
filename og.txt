//% weight=100 color=#431FAE
namespace MPU6050 {
    // Constants
    const address = 0x68;



    // Variables
        // Axis rotational velocities
        let pitch_vel = 0;
        let yaw_vel = 0;
        let roll_vel = 0;

        // Axis calibration numbers
        let pitch_calibration = 0
        let yaw_calibration = 0
        let roll_calibration = 0



    // Helpers
        // Write to a register
        function write_register(register: number, value: number) {
            let buffer = pins.createBuffer(2);
            buffer[0] = register;
            buffer[1] = value;
            pins.i2cWriteBuffer(address, buffer, false);
        }

        // Read a specified amount of bytes starting at a specified register
        function read_block(register: number, length: number): Buffer {
            let r = pins.createBuffer(1);
            r[0] = register;
            pins.i2cWriteBuffer(address, r, true);
            return pins.i2cReadBuffer(address, length, false);
        }

        // Check if the MPU6050 is responsive/the right address is chosen
        function check_who_am_i() {
            let id = read_block(0x75, 1);
            if (id[0] != 0x68) {
                basic.showString("gyro error");
                while (true) {}
            }
        }

    //Blocks
        //% block="Raw Read 3 Axis"
        export function raw_read_3_axis(): void {
            // Load data into a buffer so we don't have to call it multiple times
            let buffer = read_block(0x43, 6);

            // Bitshift or something chatgpt did this
            let pitch_buffer = ((buffer[0] << 8) | buffer[1]);
            let yaw_buffer = ((buffer[2] << 8) | buffer[3]);
            let roll_buffer = ((buffer[4] << 8) | buffer[5]);

            // Change unsigned 16 bit integer into signed integer (+ or -)
            if (pitch_buffer & 0x8000) pitch_buffer -= 0x10000;
            if (yaw_buffer & 0x8000) yaw_buffer -= 0x10000;
            if (roll_buffer & 0x8000) roll_buffer -= 0x10000;

            pitch_vel = pitch_buffer;
            yaw_vel = yaw_buffer;
            roll_vel = roll_buffer;
        }

        //% block="Calibrate gyroscope for $milliseconds milliseconds"
        export function calibrate(milliseconds: number): void {
            // Initialize the sums
            let sum_pitch_vel = 0;
            let sum_yaw_vel = 0;
            let sum_roll_vel = 0;

            // Collect rotational velocities over a specified amount of milliseconds
            // (10ms steps because of the 200Hz Gyro refresh rate)
            for (let i = 0; i < milliseconds; i+=10) {
                raw_read_3_axis();
                sum_pitch_vel += pitch_vel;
                sum_yaw_vel += yaw_vel;
                sum_roll_vel += roll_vel;
                basic.pause(10);
            }

            // Average the rotational velocities
            if (milliseconds > 0) {
                pitch_calibration = sum_pitch_vel / (milliseconds / 10);
                yaw_calibration = sum_yaw_vel / (milliseconds / 10);
                roll_calibration = sum_roll_vel / (milliseconds / 10);
            }
        }

        //% block="Read 3 axis"
        export function read_3_axis(): void {
            raw_read_3_axis();
            pitch_vel -= pitch_calibration;
            yaw_vel -= yaw_calibration;
            roll_vel -= roll_calibration;

            pitch_vel /= 131;
            yaw_vel /= 131;
            roll_vel /= 131;
        }

        //% block="Initialize Gyro"
        export function initialize(): void {
            // Wake up the MPU6050
            write_register(0x6B, 0x00);
            basic.pause(10);

            // Check if the MPU6050 is responsive/the right address is chosen
            check_who_am_i()

            // Set gyroscope sensitivity to 250 degrees/s
            write_register(0x1B, 0x00);

            // 42Hz low-pass filter
            write_register(0x1A, 0x03);

            // 200Hz sample rate
            write_register(0x19, 39);
        }

        // Final Values
            //% block="Pitch velocity"
            export function pitch(): number { return pitch_vel }

            //% block="Yaw velocity"
            export function yaw(): number { return yaw_vel }

            //% block="Roll velocity"
            export function roll(): number { return roll_vel }
}