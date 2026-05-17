#!/usr/bin/env python3
import math
import rclpy
from rclpy.node import Node

class GPSFollower(Node):
    def __init__(self):
        super().__init__('gps_follower')
        self.get_logger().info("GPS Follower Node Started ✅")

        # Example: حساب المسافات بين المدن
        new_york   = (40.66964055858272,  -73.2918438988026)
        montreal   = (45.499155994690476, -73.5187471087869)
        madrid     = (40.42545972472332, -3.577711461862623)
        glasgow    = (55.86725614373743,  -4.22935951146214)
        copenhagen = (55.711247305054904, 12.585837172964045)

        self.print_distance("New York to Montreal", new_york, montreal)
        self.print_distance("New York to Madrid", new_york, madrid)
        self.print_distance("Glasgow to Madrid", glasgow, madrid)
        self.print_distance("Copenhagen to Glasgow", copenhagen, glasgow)

    def haversine(self, lat1_deg, lon1_deg, lat2_deg, lon2_deg):
        R = 6378.137  # Earth radius in km
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1_deg, lon1_deg, lat2_deg, lon2_deg])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat / 2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon / 2)**2
        c = 2 * math.asin(math.sqrt(a))
        distance_km = R * c
        y = math.sin(dlon) * math.cos(lat2)
        x = math.cos(lat1)*math.sin(lat2) - math.sin(lat1)*math.cos(lat2)*math.cos(dlon)
        bearing_rad = math.atan2(y, x)
        bearing_deg = (math.degrees(bearing_rad) + 360) % 360
        return distance_km, bearing_deg

    def print_distance(self, label, coord1, coord2):
        dist, bearing = self.haversine(coord1[0], coord1[1], coord2[0], coord2[1])
        self.get_logger().info(f"{label}: {dist:.2f} km, Bearing: {bearing:.2f}°")

def main(args=None):
    rclpy.init(args=args)
    node = GPSFollower()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == "__main__":
    main()
