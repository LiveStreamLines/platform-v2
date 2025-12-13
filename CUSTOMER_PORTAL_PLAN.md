# Customer Portal Redesign Plan

## Routing Map (Customer View Only)

```
/auth
  /login                    - Login page
  /forgot-password          - Forgot password (stub)

/dashboard                  - Customer dashboard (landing after login)

/projects
  /                         - Projects list
  /:projectId               - Project detail (with tabs: Overview, Cameras, Media, Time-lapse, Services, Memories, Weather)

/cameras
  /                         - All cameras (filtered by project if selected)
  /:cameraId                - Camera detail (tabs: Live View, History, Compare, Map)

/live-view                  - Multi-camera live view (1, 2, or 4 layout)

/timelapse
  /                         - Time-lapse requests list
  /request                  - Request new time-lapse
  /:requestId               - Time-lapse viewer

/services
  /                         - Services overview
  /drone                    - Drone shooting requests
  /site-photography         - Site photography requests
  /360-photography          - 360 photography requests
  /satellite                - Satellite imagery requests
  /:serviceId               - Service request detail

/media
  /                         - Media library (global with filters)
  /viewer/:mediaId          - Media viewer (lightbox)

/memories
  /                         - Memories list
  /:memoryId                - Memory detail
  /create                   - Create memory

/messages
  /                         - Support conversations list
  /:threadId                - Conversation detail (chat interface)

/about                      - About Us page

/404                        - Not Found page
```

## Folder Structure (Feature-Based)

```
src/app/
├── core/                   # Core services and guards
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── api.service.ts
│   │   └── project-context.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── interceptors/
│       └── auth.interceptor.ts
│
├── shared/                 # Shared components and utilities
│   ├── components/
│   │   ├── ui-card/
│   │   ├── ui-table/
│   │   ├── ui-filter/
│   │   ├── status-chip/
│   │   ├── breadcrumbs/
│   │   ├── project-selector/
│   │   ├── loading-spinner/
│   │   └── empty-state/
│   ├── pipes/
│   └── directives/
│
├── layout/                 # Layout components
│   ├── customer-shell/
│   │   ├── customer-shell.component.ts
│   │   ├── customer-shell.component.html
│   │   └── customer-shell.component.css
│   ├── sidebar/
│   │   ├── sidebar.component.ts
│   │   ├── sidebar.component.html
│   │   └── sidebar.component.css
│   └── topbar/
│       ├── topbar.component.ts
│       ├── topbar.component.html
│       └── topbar.component.css
│
├── features/               # Feature modules (lazy-loaded)
│   ├── auth/
│   │   ├── login/
│   │   └── forgot-password/
│   ├── dashboard/
│   ├── projects/
│   │   ├── project-list/
│   │   ├── project-detail/
│   │   └── project-tabs/
│   ├── cameras/
│   │   ├── camera-list/
│   │   ├── camera-detail/
│   │   ├── camera-live/
│   │   ├── camera-history/
│   │   ├── camera-compare/
│   │   └── camera-map/
│   ├── live-view/
│   ├── timelapse/
│   │   ├── timelapse-list/
│   │   ├── timelapse-request/
│   │   └── timelapse-viewer/
│   ├── services/
│   │   ├── services-list/
│   │   ├── service-request/
│   │   └── service-detail/
│   ├── media/
│   │   ├── media-library/
│   │   └── media-viewer/
│   ├── memories/
│   │   ├── memories-list/
│   │   ├── memory-detail/
│   │   └── memory-form/
│   ├── messages/
│   │   ├── conversations-list/
│   │   └── conversation-detail/
│   └── about/
│
└── models/                 # TypeScript models
    ├── user.model.ts
    ├── developer.model.ts
    ├── project.model.ts
    ├── camera.model.ts
    ├── media.model.ts
    ├── timelapse.model.ts
    ├── service.model.ts
    ├── memory.model.ts
    └── message.model.ts
```

## Layout Concept

### Customer Shell Layout
- **Left Sidebar**: Collapsible navigation
  - Dashboard
  - Projects
  - Live View
  - Time-lapse
  - Media Library
  - Memories
  - Services
  - Messages/Support
  - About
- **Top Bar**:
  - Breadcrumbs
  - Project selector (dropdown if multiple projects)
  - User avatar + menu (profile, logout)
- **Main Content Area**: Router outlet with padding

### Design System
- **Colors**: 
  - Primary: Blue/Teal (#0ea5e9 or #14b8a6)
  - Neutral: Gray scale
  - Success: Green
  - Warning: Amber
  - Error: Red
- **Typography**: Clean, readable fonts (system fonts or Inter/Poppins)
- **Spacing**: Consistent 4px/8px grid
- **Components**: Cards with subtle shadows, rounded corners (8px), clean tables

## Implementation Order

1. ✅ Setup Tailwind CSS
2. ✅ Create folder structure
3. ✅ Create TypeScript models
4. ✅ Create layout components (shell, sidebar, topbar)
5. ✅ Update routing with lazy-loaded routes
6. ✅ Implement authentication flow
7. ✅ Implement dashboard
8. ✅ Implement projects feature
9. ✅ Implement cameras feature
10. ✅ Implement live view
11. ✅ Implement time-lapse
12. ✅ Implement services
13. ✅ Implement media library
14. ✅ Implement memories
15. ✅ Implement messages/support
16. ✅ Implement about & 404
17. ✅ Create backend API endpoints
18. ✅ Create shared UI components

