# LSLplatform

A comprehensive platform for managing construction projects, cameras, media, and related services. Built with Angular 19 and Node.js backend.

## Features

### 🔐 Authentication & Authorization
- User login and authentication
- Password reset functionality
- Role-based access control (Super Admin, Admin, User)
- Protected routes with Auth Guards
- Login history tracking

### 🏗️ Project Management
- **Developers Management**: Create, edit, and manage developers
- **Projects Management**: Organize projects under developers
- **Hierarchical Navigation**: Navigate through Developer → Project → Services structure
- Project-specific services and configurations

### 📷 Camera Management
- **Camera List**: View all cameras organized by project
- **Camera Detail View**: Detailed information and controls for individual cameras
- **Camera Comparison**: Compare multiple cameras side-by-side or with magnify view
- **Camera Selection**: Select cameras for specific operations
- **Camera Monitor**: Real-time monitoring dashboard for cameras
- **Camera History**: Track camera status and changes over time
- **Camera Status Tracking**: Monitor camera health and status
- **Camera Feed**: View live camera feeds
- **Camera Viewer**: Advanced camera viewing interface
- **ECRD**: Electronic Camera Record Display
- **Camera Map**: Geographic view of camera locations

### 📺 Live Viewing
- **Live View**: Real-time camera streaming
- **Live View 2**: Enhanced live viewing experience
- Multiple camera viewing support

### 🎬 Services
- **Time Lapse**: Create and manage time-lapse photography
- **Live Streaming**: Real-time video streaming from cameras
- **Drone Shooting**: Manage drone photography and videography
- **Site Photography & Videography**: Professional site documentation
- **360 Photography & Videography**: Immersive 360-degree media
- **Satellite Imagery**: Satellite image integration and viewing

### 🖼️ Media Management
- **Gallery**: Browse and manage all media files
- **Video Requests**: Request and manage video generation
- **Photo Requests**: Request and manage photo generation
- **Media Viewer**: Advanced media viewing interface
- **Media Library**: Comprehensive media organization and search

### 👥 User Management
- User list and management
- Add/Edit user profiles
- Password reset functionality
- User role assignment
- Login history tracking

### 📦 Inventory Management
- Device inventory tracking
- Device type management
- Edit and update device information
- Device status monitoring

### 🔧 Maintenance
- Maintenance tracking and scheduling
- Maintenance history
- Task management for maintenance activities

### 💰 Sales & Invoicing
- **Sales Orders**: Create, edit, view, and list sales orders
- **Invoices**: Comprehensive invoice management
  - Invoice listing
  - Invoice detail view
  - Invoice editing
  - Printable invoice generation
- Amount-to-words conversion for invoices

### 📝 Memories
- Memory management system
- Create and edit memories
- Memory organization and search

### 💬 Communication
- **Chat**: Real-time chat functionality
- **Contacts**: Contact management
- **Tasks**: Task creation and management

### 🌐 Additional Features
- **About Us**: Company information page
- **Weather Integration**: Weather data for project locations
- **Studio**: Media production tools
- **Service Configuration**: Configure available services per project
- **Camera Widget**: Embeddable camera widget for external websites
- **Mobile Support**: Capacitor integration for mobile apps
- **404 Page**: Custom not found page
- **Breadcrumb Navigation**: Enhanced navigation experience

## Technology Stack

### Frontend
- Angular 19
- Angular Material
- TypeScript
- RxJS
- Swiper.js
- Google Maps Integration
- Capacitor (for mobile)

### Backend
- Node.js
- Express.js
- RESTful API
- File storage (S3 support)
- JSON data storage

## Development

### Prerequisites
- Node.js (v18 or higher)
- Angular CLI 19
- npm or yarn

### Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Backend Server

Navigate to the `backend` directory and run:
```bash
npm install
npm start
```

The backend server runs on `http://localhost:5000`.

### Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running Unit Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running End-to-End Tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Project Structure

```
lslplatform/
├── src/                    # Angular frontend source
│   ├── app/
│   │   ├── components/     # All Angular components
│   │   ├── services/       # Angular services
│   │   ├── models/         # TypeScript models/interfaces
│   │   ├── interceptors/   # HTTP interceptors
│   │   └── pipes/          # Custom pipes
│   └── assets/             # Static assets
├── backend/                # Node.js backend
│   ├── controllers/        # API controllers
│   ├── routes/             # Express routes
│   ├── models/             # Data models
│   ├── data/               # JSON data files
│   └── utils/              # Utility functions
└── public/                 # Public static files
```

## Further Help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
