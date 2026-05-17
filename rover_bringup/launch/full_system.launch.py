from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, TimerAction
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory

import os


def generate_launch_description():
    robot_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                get_package_share_directory("arabian_robot"),
                "launch",
                "arabian.launch.py"
            )
        )
    )

    joystick_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                get_package_share_directory("military_autonomous_rover"),
                "launch",
                "joystick.launch.py"
            )
        )
    )

    sllidar_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                get_package_share_directory("sllidar_ros2"),
                "launch",
                "sllidar_a1_launch.py"
            )
        ),
        launch_arguments={
            "serial_port": "/dev/ttyUSB1",
            "serial_baudrate": "115200",
        }.items()
    )
    
    rf2o_node = Node(
        package="rf2o_laser_odometry",
        executable="rf2o_laser_odometry_node",
        name="rf2o_laser_odometry",
        output="screen",
        parameters=[
            {
                "laser_scan_topic": "/scan",
                "odom_topic": "/odom",
                "base_frame_id": "base_footprint",
                "odom_frame_id": "odom",
                "publish_tf": True,
                "freq": 10.0,
            }
        ]
    )

    mapping_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                get_package_share_directory("arabian_robot"),
                "launch",
                "online_sync_launch.py"
            )
        )
    )

    return LaunchDescription([
        robot_launch,
        joystick_launch,
        sllidar_launch,
        rf2o_node,
        TimerAction(
            period=3.0,
            actions=[mapping_launch]
        ),
    ])