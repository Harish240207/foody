🥗 Foody
AI-Enabled Surplus Food Redistribution & Safety Platform

🚀 A smart national-level platform that connects Restaurants, NGOs, and Volunteers to reduce food wastage and eliminate hunger using technology.

📌 Problem Statement

India faces two major issues simultaneously:

🍛 Massive food wastage from hotels & restaurants

🥣 Food insecurity among underprivileged communities

Additionally:

No structured redistribution system

No transparent tracking

No food safety validation

No real-time coordination

💡 Solution – Foody

Foody is a full-stack web platform that:

Connects surplus food donors (Hotels/Restaurants)

Notifies nearby NGOs

Enables live order tracking

Ensures food safety validation

Provides admin monitoring dashboard

Uses structured database tracking via MongoDB

🎯 Key Features
👤 Multi-Role Authentication

Hotel Login & Registration

NGO Login

User Login

Admin Dashboard

🏨 Hotel Dashboard

Add surplus food

Manage menu

Track orders

View pickup status

🏢 NGO Dashboard

View available surplus food

Accept donation requests

Track delivery

🚚 Order Tracking

Real-time tracking system

Delivery status updates

🛡 Admin Panel

Complaint management

Platform monitoring

Dashboard analytics

🗺 Delivery Map Integration

Location-based delivery support

🧠 System Architecture

Frontend (React.js)
⬇
Backend (Node.js + Express.js)
⬇
Database (MongoDB Atlas)

🛠 Tech Stack
Layer	Technology Used
Frontend	React.js
Backend	Node.js
API Server	Express.js
Database	MongoDB Atlas
Styling	CSS
Routing	React Router
HTTP Client	Axios
📂 Project Structure
foody/
│
├── foody-backend/
│   ├── server.js
│   ├── models/
│   ├── routes/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.js
│
├── public/
└── package.json
⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/yourusername/foody.git
cd foody
2️⃣ Backend Setup
cd foody-backend
npm install
node server.js

Server runs on:

http://localhost:5000
3️⃣ Frontend Setup

Open new terminal:

npm install
npm start

Frontend runs on:

http://localhost:3000
🌍 How It Works

Hotel adds surplus food

NGO sees available listings

NGO accepts request

Delivery tracking begins

Admin monitors the process

🔐 Database

MongoDB Atlas cloud database

Secure connection

Structured collections for:

Users

Hotels

NGOs

Orders

Complaints

📈 Impact

✔ Reduces food wastage
✔ Supports hunger elimination
✔ Enables transparency
✔ Improves coordination
✔ Digitizes surplus food management

🚀 Future Enhancements

AI-based food safety prediction

Expiry detection using ML

Real-time volunteer GPS tracking

Analytics dashboard with charts

Mobile app integration

👨‍💻 Developed By

Team Name: Team Mavericks
Project Lead: Harish K
Hackathon Submission 2026

📜 License

This project is developed for academic and hackathon purposes.
