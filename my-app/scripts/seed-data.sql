-- Insert sample projects
INSERT INTO projects (title, description, image_url, technologies, github_url, demo_url) VALUES
(
  'Autonomous Robot Navigation',
  'Built an autonomous robot using Arduino and ultrasonic sensors for obstacle avoidance and path planning. The robot can navigate complex environments and avoid obstacles in real-time.',
  'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['Arduino', 'C++', 'Ultrasonic Sensors', '3D Printing'],
  'https://github.com/hmsengineeringclub/autonomous-robot',
  NULL
),
(
  'Smart Home IoT System',
  'Developed a comprehensive IoT system for home automation with mobile app control and real-time monitoring. Features include temperature control, lighting automation, and security monitoring.',
  'https://images.pexels.com/photos/1841841/pexels-photo-1841841.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['Raspberry Pi', 'Python', 'React Native', 'MQTT', 'IoT'],
  'https://github.com/hmsengineeringclub/smart-home',
  'https://smarthome-demo.netlify.app'
),
(
  'Solar Panel Efficiency Monitor',
  'Created a monitoring system to track solar panel performance and optimize energy collection. The system provides real-time data analytics and performance optimization suggestions.',
  'https://images.pexels.com/photos/9875481/pexels-photo-9875481.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['ESP32', 'Solar Panels', 'Data Analytics', 'Cloud Storage'],
  'https://github.com/hmsengineeringclub/solar-monitor',
  NULL
);

-- Insert sample executives
INSERT INTO executives (name, grade, role, image_url, graduation_year, is_alumni) VALUES
(
  'Alex Johnson',
  12,
  'President',
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
  2024,
  false
),
(
  'Sarah Chen',
  11,
  'Vice President',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  2025,
  false
),
(
  'Mike Rodriguez',
  12,
  'Project Lead',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
  2024,
  false
),
(
  'Emma Thompson',
  10,
  'Secretary',
  'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400',
  2026,
  false
);

-- Insert sample announcements
INSERT INTO announcements (title, content, type) VALUES
(
  'Weekly Meeting Tomorrow',
  'Join us tomorrow at 3:30 PM in Room 204 for our weekly engineering meeting. We will be discussing the upcoming robotics competition and new project proposals. All members are encouraged to attend and bring their ideas!',
  'meeting'
),
(
  'Robotics Competition Registration Open',
  'Registration is now open for the Regional Robotics Competition taking place next month. Teams of 3-4 members are required. Registration deadline is April 15th. Cash prizes for top 3 teams! Contact executives for more details.',
  'competition'
),
(
  'New Project Showcase Next Week',
  'Present your completed projects next Thursday during our regular meeting time. Each presentation should be 5 minutes followed by Q&A. This is a great opportunity to share your work with the club and get feedback from peers.',
  'project'
),
(
  'Engineering Club Open House',
  'We are hosting an open house event for prospective members next Friday after school. Current members are encouraged to bring friends who might be interested in joining our engineering community.',
  'general'
);
