# Employee Management System (EMS)

## 📌 Project Description

An Employee Management System is a full-stack web application that helps organizations manage employees, roles, and leave workflows efficiently.

The system supports multi-user roles (Admin, HR, Manager, Employee) with proper authorization and a leave approval flow where requests move from Employee → HR → Manager.

This is a real-world mini enterprise app — perfect for your Spring Boot + React practice.

## ⚙️ Tech Stack

### 🖥️ Backend
- **Spring Boot** – REST APIs
- **Spring Security + JWT** – Authentication & role-based access
- **Spring Data JPA (Hibernate)** – ORM
- **MySQL (Railway SQL)** – Database
- **Lombok** – Reduce boilerplate

### 🎨 Frontend
- **React.js (Vite or CRA)** – UI
- **Axios** – API calls
- **React Router** – Navigation
- **Tailwind CSS / Bootstrap** – Styling

### 🛠️ Tools
- **Git & GitHub** (multi-branch workflow)
- **Postman** (API testing)
- **Railway** (DB hosting)

---

## 🚀 Core Features

### 👥 1. Multi-User Role System
- **Roles:** Admin, HR, Manager, Employee
- **Features:**
  - Login with JWT authentication
  - Role-based dashboard
  - Protected routes (frontend + backend)

### 👤 2. Employee Management (CRUD)
- Add employee (Admin/HR)
- View all employees
- Update employee details
- Delete employee
- Assign role (HR, Manager, Employee)

### 🏢 3. Department / Role Management
- Create departments (Admin)
- Assign employees to departments
- View department-wise employees

### 📝 4. Leave Management System (MAIN FEATURE 🔥)
**Flow:** Employee → HR → Manager → Final Decision

**Features:**
- Employee applies leave
- HR reviews (approve/reject)
- If approved → goes to Manager
- Manager gives final approval
- **Leave status tracking:** Pending HR, Pending Manager, Approved, Rejected

### 📊 5. Dashboard (Role-based)
- **Employee Dashboard:** Apply leave, View leave status, View profile
- **HR Dashboard:** View employee list, Review leave requests, Approve/reject (level 1)
- **Manager Dashboard:** Final approval of leave, View team employees
- **Admin Dashboard:** Full control, Manage users, roles, departments

### 🔐 6. Authentication & Authorization
- Login / Register
- JWT Token-based authentication
- Role-based API access
- Secure endpoints

### 📅 7. Leave History & Tracking
- View past leave requests
- **Filter by:** Status, Date, Employee

### 🔎 8. Search & Filter
- Search employees by name/email
- Filter leaves by status

### 📌 Optional (if time allows)
- Email notification (on leave approval)
- Profile picture upload
- Pagination
- Dark mode UI 😄

---

## 🗃️ Core Database Entities

### 1. User
- `id`, `name`, `email`, `password`, `role` (ADMIN, HR, MANAGER, EMPLOYEE)

### 2. Employee
- `id`, `user_id`, `department_id`, `designation`

### 3. Department
- `id`, `name`

### 4. LeaveRequest
- `id`, `employee_id`, `start_date`, `end_date`, `reason`, `status` (PENDING_HR, PENDING_MANAGER, APPROVED, REJECTED)

---

## 🎯 Project Goal

Build a real-time workflow system that demonstrates:
- Full-stack integration
- Role-based access control
- API design
- Database relationships
- Team collaboration using Git branches
