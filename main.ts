//% groups='["Readings", "Basic", "Advanced"]'
//% weight=100 color=#431FAE
namespace MPU6050 {
    // Constants
    const address = 0x68;



    // Variables
        // Axis rotational velocities
        let pitch_vel = 0;
        let yaw_vel = 0;
        let roll_vel = 0;

        // Axis rotational positions
        let pitch = 0;
        let yaw = 0;
        let roll = 0;

        // Axis calibration numbers
        let pitch_calibration = 0;
        let yaw_calibration = 0;
        let roll_calibration = 0;

        // Variables
        let auto_update = false;



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
        // Final Values
            //% group="Readings"
            //% block="Pitch velocity"
            export function pitch_velocity(): number { return pitch_vel }

            //% group="Readings"
            //% block="Yaw velocity"
            export function yaw_velocity(): number { return yaw_vel }

            //% group="Readings"
            //% block="Roll velocity"
            export function roll_velocity(): number { return roll_vel }

            //% group="Readings"
            //% block="Pitch"
            export function pitch_position(): number { return pitch }

            //% group="Readings"
            //% block="Yaw"
            export function yaw_position(): number { return yaw }

            //% group="Readings"
            //% block="Roll"
            export function roll_position(): number { return roll }



        //% group="Basic"
        //% block="Initialize gyro"
        export function initialize(): void {
            // Wake up the MPU6050
            write_register(0x6B, 0x00);
            basic.pause(10);

            // Check if the MPU6050 is responsive/the right address is chosen
            check_who_am_i()

            // Set gyroscope sensitivity to 1000 degrees/s
            write_register(0x1B, 0x10);

            // DLPF disabled, maximum bandwidth (8 kHz internal)
            write_register(0x1A, 0x00);

            // 100Hz sample rate
            write_register(0x19, 79);
        }

        //% group="Basic"
        //% block="Calibrate gyroscope for $milliseconds milliseconds"
        export function calibrate(milliseconds: number): void {
            // Initialize the sums
            let sum_pitch_vel = 0;
            let sum_yaw_vel = 0;
            let sum_roll_vel = 0;

            // Collect rotational velocities over a specified amount of milliseconds
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

        //% group="Basic"
        //% block="Turn on auto sample"
        export function auto_sample_on(): void {
            auto_update = true;
        }

        //% group="Basic"
        //% block="Turn off auto sample"
        export function auto_sample_off(): void {
            auto_update = false;
        }

        //% group="Basic"
        //% block="Zero position"
        export function zero_position(): void {
            pitch = 0;
            yaw = 0;
            roll = 0;
        }



        // Advanced
            //% group="Advanced"
            //% block="Raw read 3 axis"
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

            //% group="Advanced"
            //% block="Read 3 axis"
            export function read_3_axis(): void {
                raw_read_3_axis();
                pitch_vel -= pitch_calibration;
                yaw_vel -= yaw_calibration;
                roll_vel -= roll_calibration;

                pitch_vel /= 32.8;
                yaw_vel /= 32.8;
                roll_vel /= 32.8;
            }

    control.inBackground(function () {
        let last_time = 0;
    
        while (true) {
            if (auto_update) {
                basic.showNumber(1)
                let now = input.runningTimeMicros();
    
                if (last_time == 0) {
                    last_time = now;
                    basic.pause(10);
                    continue;
                }
                basic.showNumber(2)
    
                let dt = (now - last_time) / 1_000_000;
                last_time = now;

                basic.showNumber(3)
                if (dt > 0.05) {
                    basic.pause(10);
                    continue;
                }

                basic.showNumber(4)
    
                read_3_axis();
                pitch += pitch_vel * dt;
                yaw += yaw_vel * dt;
                roll += roll_vel * dt;
                basic.showNumber(5)
            } else {
                last_time = 0;
            }
    
            basic.pause(10);
        }
    });
}
