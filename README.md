#mobile-robot

# autonmous_rover package

## Installation & Build

Go to the `src` folder inside your workspace
```
cd ~/ws/src
```
Clone the repository
```
git clone https://github.com/AhmedMD72/Military_Autonomous_Rover.git
```
Go back to the workspace root
```
cd ~/your_ws
```
Build the package & Source the setup file
```
colcon build 
source install/setup.bash 
```


# joystick Controller

Install
```
 sudo apt install joystick jstest-gtk evtest 
```
test
```
evtest
jstest-gtk 
ros2 run joy joy_enumerate_devices 
ros2 run joy joy_node 
ros2 run joy_tester test_joy
```
```
ros2 launch Military_Autonomous_Rover joystick.launch.py 
```
```
ros2 run micro_ros_agent micro_ros_agent serial --dev /dev/ttyUSB0 -b 115200
```
# AGENT_IP
```
hostname -I
ip addr show | grep inet
```
```
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "{linear: {x0 1.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 0.0}}"
```
