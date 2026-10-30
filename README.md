# 🎓 CareerCampus Skill & Opportunity Platform

A MERN Stack-based web application designed to connect students with internships, jobs, and career opportunities. The platform helps students discover relevant opportunities, apply online, and manage their applications, while administrators can manage opportunities and track student applications.

## 🚀 About the Project

The **Smart Campus Skill & Opportunity Platform** aims to make campus recruitment and opportunity discovery easier and more organized.

Students can explore available internships and jobs, save opportunities, submit applications, and provide their academic details through an application form.

Administrators can publish new opportunities, update existing listings, delete opportunities, and review applications submitted by students.

## ✨ Features

### 👨‍🎓 Student Features
- User registration and login.
- Browse available internships and job opportunities.
- View company and location details.
- Save and unsave opportunities.
- Apply for opportunities through an online application form.
- Submit academic details, including:
  - Current Year
  - Branch
  - College Name
  - Passing Year
  - Phone Number
  - Official Email
- View relevant opportunity information and application status.

### 👨‍💼 Admin Features
- Admin authentication and role-based access.
- Add new job and internship opportunities.
- Edit existing opportunities.
- Delete opportunities.
- View student applications.
- Review student academic and contact details.
- Update application status.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| JavaScript | Application logic |
| HTML5 | Structure |
| CSS3 | Styling and responsive UI |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| JWT | Authentication |
| Git & GitHub | Version control |

## 📂 Project Structure

```text
Smart-Campus-Platform/
│
├── Frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       └── main.jsx
│
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
└── README.md
```

*Note: Folder names may differ slightly depending on the final project structure.*

## ⚙️ Installation and Setup

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/Aman123-so/Smart-Campus-Platform.git
```

```bash
cd Smart-Campus-Platform
```

### 2. Backend Setup

Open a terminal:

```bash
cd Backend
npm install
```

Create a `.env` file inside the Backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend server:

```bash
node server.js
```

Backend will run at:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd Frontend
npm install
```

Start the React development server:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

## 🔐 Authentication & Authorization

The platform uses JWT-based authentication to secure user access.

- Students can access student-specific features.
- Administrators can manage opportunities and student applications.
- Role-based access controls restrict administrative actions.

## 🗄️ Database

MongoDB is used to store application data, including:

- User information
- Opportunity details
- Student applications
- Saved opportunities

Mongoose is used to define schemas and interact with MongoDB.

## 🔮 Future Enhancements

- AI-based opportunity recommendations.
- Resume upload and analysis.
- Email notifications for application updates.
- Advanced student skill-matching system.
- Application analytics dashboard.
- Real-time notifications.

## 🎯 Project Objective

To build a centralized campus platform that simplifies the process of discovering career opportunities, applying for internships and jobs, and managing student applications.

## 👨‍💻 Developer

**Aman Gupta**

B.Tech Computer Science Engineering | 3rd Year

Skills: C++, DSA, MERN Stack, SQL

- GitHub: [Aman123-so](https://github.com/Aman123-so)

---

⭐ If you find this project useful, consider giving it a star!

**Built with ❤️ using the MERN Stack.**
