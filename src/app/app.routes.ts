import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './services/auth.guard';  // Import the AuthGuard
import { ProjectListComponent } from './components/project-list/project-list.component';
import { CameraListComponent } from './components/camera-list/camera-list.component';
import { CameraDetailComponent } from './components/camera-detail/camera-detail.component';
import { CameraCompareComponent } from './components/camera-compare/camera-compare.component';
import { DevelopersComponent } from './components/developers/developers.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { CameraComponent } from './components/cameras/cameras.component';
import { CameraFormComponent } from './components/cameras/camera-form/camera-form.component'; // Adjust the path as necessary
import { GalleryComponent } from './components/gallery/gallery.component';
import { VideoRequestComponent } from './components/gallery/video-request/video-request.component';
import { PhotoRequestComponent } from './components/gallery/photo-request/photo-request.component';
import { MediaComponent } from './components/media/media.component';
import { ServicesComponent } from './components/services/services.component';
import { UsersComponent } from './components/users/users.component';
import { UserFormComponent } from './components/users/user-form/user-form.component';
import { ResetPasswordComponent } from './components/users/reset-password/reset-password.component';
import { LiveviewComponent } from './components/liveview/liveview.component';
import { ServiceDetailComponent } from './components/service-detail/service-detail.component';
import { AboutUsComponent } from './components/about/about.component';
import { CameraViewComponent } from './components/camera-list/camera-view/camera-view.component';
import { CameraViewerComponent } from './components/camera-viewer/camera-viewer.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SitePhotoComponent } from './components/site-photo/site-photo.component';
import { CameraFeedComponent } from './components/camera-feed/camera-feed.component';
import { MemoriesComponent } from './components/memories/memories.component';
import { MemoryFormComponent } from './components/memories/memory-form/memory-form.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { EditDeviceComponent } from './components/inventory/edit-device/edit-device.component';
import { EcrdComponent } from './components/camera-viewer/ecrd/ecrd.component';
import { CameraMonitorComponent } from './components/camera-monitor/camera-monitor.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { CameraHistoryComponent } from './components/camera-history/camera-history.component';
import { CameraSelectionComponent } from './components/camera-selection/camera-selection.component';
import { Liveview2Component } from './components/liveview2/liveview2.component';
import { SalesOrderFormComponent } from './components/sales-order/sales-order-form.component';
import { SalesOrderListComponent } from './components/sales-order/sales-order-list/sales-order-list.component';
import { SalesOrderViewComponent } from './components/sales-order/sales-order-view.component';
import { InvoicesListComponent } from './components/sales-order/invoices-list/invoices-list.component';
import { InvoiceDetailComponent } from './components/sales-order/invoice-detail/invoice-detail.component';
import { InvoiceEditComponent } from './components/sales-order/invoice-edit/invoice-edit.component';
import { PrintableInvoiceComponent } from './components/sales-order/printable-invoice/printable-invoice.component';
import { DroneShootingComponent } from './components/drone-shooting/drone-shooting.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent},
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },  // Protect home with AuthGuard
  { path: 'home/:developerTag', component: ProjectListComponent,  canActivate: [AuthGuard] },  // Project list for a specific developer
  { path: 'home/:developerTag/:projectTag', component: ServicesComponent,  canActivate: [AuthGuard]},
  { path: 'home/:developerTag/:projectTag/timelapse', component: CameraListComponent, canActivate: [AuthGuard] },  // Camera list for a specific project
  { path: 'home/:developerTag/:projectTag/camera-selection', component: CameraSelectionComponent, canActivate: [AuthGuard]},
  { path: 'home/:developerTag/:projectTag/liveview/:cameraId', component: LiveviewComponent, canActivate:[AuthGuard]},
  { path: 'home/:developerTag/:projectTag/drone-shooting', component: DroneShootingComponent, canActivate: [AuthGuard] },  // Camera list for a specific project
  { path: 'home/:developerTag/:projectTag/site-photography', component: SitePhotoComponent, canActivate: [AuthGuard] },  // Camera list for a specific project
  { path: 'home/:developerTag/:projectTag/360-photography', component: ServiceDetailComponent, canActivate: [AuthGuard] },  // Camera list for a specific project
  { path: 'home/:developerTag/:projectTag/satellite-imagery', component: ServiceDetailComponent, canActivate: [AuthGuard] },  // Camera list for a specific project
  { path: 'home/:developerTag/:projectTag/liveview2', component: Liveview2Component, canActivate:[AuthGuard]},
  { path: 'home/:developerTag/:projectTag/:cameraName', component: CameraDetailComponent,  canActivate: [AuthGuard] },  // Route for camera detail
  { path: 'compare', component: CameraCompareComponent,  canActivate: [AuthGuard] },
  { path: 'developers', component: DevelopersComponent,  
    canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} },
  { path: 'projects', component: ProjectsComponent,  
    canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} },
  { path: 'cameras', component: CameraComponent,  
    canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} },
  { path: 'camera-form', component: CameraFormComponent,  
    canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} }, // Route for adding a new camera
  { path: 'camera-form/:id', component: CameraFormComponent,  
    canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} }, // Route for editing a camera by ID
  { path: 'users', component: UsersComponent,  canActivate: [AuthGuard] },
  { path: 'users/add', component: UserFormComponent,  canActivate: [AuthGuard] },
  { path: 'users/edit/:id', component: UserFormComponent,  canActivate: [AuthGuard] }, // Route for editing
  { path: 'gallery', component: GalleryComponent,  canActivate: [AuthGuard]},
  { path: 'gallery/video-request', component: VideoRequestComponent,  canActivate: [AuthGuard]},
  { path: 'gallery/photo-request', component: PhotoRequestComponent,  canActivate: [AuthGuard]},
  { path: 'media', component: MediaComponent,  canActivate: [AuthGuard]},
  { path: 'about', component: AboutUsComponent, canActivate:[AuthGuard]},
  { path: 'monitor', component: CameraViewerComponent, canActivate:[AuthGuard]},
  { path: 'camera-monitor', component: CameraMonitorComponent, 
    canActivate:[AuthGuard], 
    data: {roles: ['Super Admin', 'Admin']}
  },
  { path: 'memories', component: MemoriesComponent, 
    canActivate:[AuthGuard], data: {roles: ['Super Admin', 'Admin']}},  
  { path: 'memory-form', component: MemoryFormComponent,
     canActivate:[AuthGuard], data: {roles: ['Super Admin', 'Admin']}},  
  { path: 'memory-form/:id', component: MemoryFormComponent, 
    canActivate:[AuthGuard], data: {roles: ['Super Admin','Admin']}},  
  { path: 'inventory', component: InventoryComponent, 
    canActivate:[AuthGuard], data: {roles: ['Super Admin', 'Admin']}},
  { path: 'inventory/edit/:id', component: EditDeviceComponent, 
    canActivate:[AuthGuard], data: {roles: ['Super Admin', 'Admin']}},
  { path: 'maintenance', component: MaintenanceComponent, 
    canActivate:[AuthGuard], data: {roles: ['Super Admin', 'Admin']}},
  { path: 'camera-history/:id', component: CameraHistoryComponent, 
    canActivate: [AuthGuard], 
    data: {roles: ['Super Admin', 'Admin']}
  },
  { path: 'sales-orders', component: SalesOrderListComponent, canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} },
  { path: 'sales-orders/new', component: SalesOrderFormComponent, canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} },
  { path: 'sales-orders/edit/:id', component: SalesOrderFormComponent, canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} },
  { path: 'sales-orders/view/:id', component: SalesOrderViewComponent, canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} },
  { path: 'invoices', component: InvoicesListComponent, canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} },
  { path: 'invoices/view/:invoiceNumber', component: InvoiceDetailComponent, canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} },
  { path: 'invoices/edit/:invoiceNumber', component: InvoiceEditComponent, canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} },
  { path: 'invoices/print/:invoiceNumber', component: PrintableInvoiceComponent, canActivate: [AuthGuard], data: {roles: ['Super Admin', 'Admin']} },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }  // Use the NotFoundComponent for 404
];