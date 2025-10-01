// MongoDB initialization script for Docker
db = db.getSiblingDB('niaz_portfolio');

// Create collections
db.createCollection('users');
db.createCollection('projects');
db.createCollection('achievements');
db.createCollection('research');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.projects.createIndex({ "title": "text", "description": "text", "tags": "text" });
db.achievements.createIndex({ "title": "text", "description": "text", "tags": "text" });
db.research.createIndex({ "title": "text", "abstract": "text", "tags": "text" });

// Create a default admin user (optional)
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/VjWy", // password: admin123
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');