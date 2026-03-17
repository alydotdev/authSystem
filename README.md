# Auth System (Backend)

A **Node.js/Express backend authentication system** with JWT-based authentication and password hashing. This project demonstrates a clean backend structure suitable for real-world applications and internship-level portfolios.

---

## Features

- **User Registration** – Create new accounts with secure password hashing (bcrypt).  
- **User Login** – Authenticate users and generate JWT tokens.  
- **Protected Routes** – Middleware to restrict access to authorized users only.  
- **Password Security** – Passwords are never stored in plain text.  
- **Error Handling** – Centralized error responses for better debugging.
- **Role-based access control** (admin/user)  
- **Refresh tokens and logout** 
- **Password reset via email**

---

## Technologies

- **Node.js**  
- **Express.js**  
- **MongoDB / Mongoose**  
- **JWT (JSON Web Tokens)**  
- **Bcrypt for password hashing**  
- **dotenv for environment variables**  

---

## Folder Structure

```text
authSystem/
├── src/
│   ├── controllers/      # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # Express routes
│   ├── middleware/       # Auth middleware & error handling
    ├── lib/              # Email and DB connection
    ├── index.js          # Initializes server, connects to database, and loads routes.
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
