from launch import LaunchDescription
from launch.actions import ExecuteProcess
from launch_ros.actions import Node
import os
from ament_index_python.packages import get_package_share_directory
import xacro


def generate_launch_description():
    pkg_share = get_package_share_directory('arabian_robot')
    urdf_file = os.path.join(pkg_share, 'urdf', 'my_arabian_robot.urdf')

    
    doc = xacro.process_file(urdf_file)
    robot_desc = doc.toprettyxml(indent='  ')
    robot_desc = robot_desc.replace(
        'package://arabian_robot/',
        os.path.join(pkg_share, '') + '/'
    )

    return LaunchDescription([
        ExecuteProcess(
            cmd=['gz', 'sim', '-v', '4', '-r', 'empty.sdf'],
            output='screen'
        ),

        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            name='robot_state_publisher',
            parameters=[{'robot_description': robot_desc}],
            output='screen'
        ),

        Node(
            package='ros_gz_sim',
            executable='create',
            arguments=['-string', robot_desc, '-name', 'my_robot', '-z', '0.1'],
            output='screen'
        ),

        Node(
            package='ros_gz_bridge',
            executable='parameter_bridge',
            arguments=[
                '/cmd_vel@geometry_msgs/msg/Twist@gz.msgs.Twist',
                '/odom@nav_msgs/msg/Odometry@gz.msgs.Odometry',
                '/pose@geometry_msgs/msg/PoseStamped@gz.msgs.Pose',
                '/lidar@sensor_msgs/msg/LaserScan@gz.msgs.LaserScan',
                '/imu@sensor_msgs/msg/Imu@gz.msgs.IMU',
                '/gps/fix@sensor_msgs/msg/NavSatFix@gz.msgs.Gps'
            ],
            output='screen'
        )
    ])
