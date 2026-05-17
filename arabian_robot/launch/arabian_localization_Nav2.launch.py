import os 
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node
import xacro

def generate_launch_description():

    robot_xacro_name ="arabian_robot"

    namePKG="arabian_robot"

    modeFileRelativePath = 'urdf/arabian_robot.xacro'

    ## world
    worldfileRelativePath = 'worlds/simple_map.sdf'

    pathModeFile = os.path.join(get_package_share_directory(namePKG), modeFileRelativePath)

    pathWorldFile = os.path.join(get_package_share_directory(namePKG),worldfileRelativePath)

    robotDescription = xacro.process_file(pathModeFile).toxml()
    robotDescription_abs=robotDescription.replace('package://arabian_robot/',
        os.path.join(get_package_share_directory(namePKG), '') + '/')
    
    #Gazebo Node
    gazebo_rosPackageLaunch=PythonLaunchDescriptionSource(os.path.join(get_package_share_directory('ros_gz_sim'),'launch','gz_sim.launch.py'))
    
    gazeboLaunch=IncludeLaunchDescription(gazebo_rosPackageLaunch,launch_arguments={'gz_args': f'-r {pathWorldFile}'}.items())
    
    bridge_params = os.path.join(get_package_share_directory('arabian_robot'),'config','bridge.yaml')

    spawnModelNode = Node (
        package='ros_gz_sim',
        executable='create',
        arguments=['-string',robotDescription_abs ,'-entity',robot_xacro_name,'-z', '0.2'],
        output= 'screen'
    )
    
    nodeRobotStatePublisher = Node (
        package='robot_state_publisher',
        executable='robot_state_publisher',
        output='screen',
        parameters=[{'robot_description': robotDescription,'use_sim_time': True}]
    )

    bridge =  Node(
        package="ros_gz_bridge",
        executable="parameter_bridge",
        arguments=[
            '--ros-args',
            '-p',
            f'config_file:={bridge_params}',]
    )
    RobotStateJoint= Node(
        package='joint_state_publisher',
        executable='joint_state_publisher',
        name='joint_state_publisher',
        output='screen'
    )

    rviz2Node = Node(
    package='rviz2',
    executable='rviz2',
    name='rviz2',
   # arguments=['-d', os.path.join(get_package_share_directory(namePKG), 'rviz', 'lidar_config.rviz')],
    output='screen'
)
  #  launchDescriptionObject = LaunchDescription()

    # launchDescriptionObject.add_action(gazeboLaunch)
    # launchDescriptionObject.add_action(spawnModelNode)
    # launchDescriptionObject.add_action(nodeRobotStatePublisher)

    return LaunchDescription([
        gazeboLaunch,
        spawnModelNode,
        nodeRobotStatePublisher,
        bridge,
        # RobotStateJoint,
        #rviz2Node
    ])
