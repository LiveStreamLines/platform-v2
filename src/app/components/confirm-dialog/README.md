# Enhanced Confirm Dialog Component

A modern, beautiful, and highly customizable confirmation dialog component for Angular applications.

## Features

- 🎨 **Modern Design**: Clean, professional appearance with smooth animations
- 🌈 **Multiple Types**: Support for question, warning, error, info, and success dialogs
- 📱 **Responsive**: Works perfectly on desktop and mobile devices
- 🌙 **Dark Mode**: Automatic dark mode support
- ⚡ **TypeScript**: Full type safety with comprehensive interfaces
- 🎯 **Accessible**: Built with accessibility in mind
- 🔧 **Customizable**: Extensive customization options

## Dialog Types

The component supports five different dialog types, each with its own visual styling:

- **Question** (default): Blue theme with help icon
- **Warning**: Yellow theme with warning icon
- **Error**: Red theme with error icon
- **Info**: Cyan theme with info icon
- **Success**: Green theme with check circle icon

## Usage

### Basic Usage

```typescript
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

constructor(private dialog: MatDialog) {}

showConfirmDialog() {
  const dialogData: ConfirmDialogData = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    type: 'question'
  };

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: dialogData,
    width: '450px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // User confirmed
      console.log('Confirmed');
    } else {
      // User cancelled
      console.log('Cancelled');
    }
  });
}
```

### Using the Example Service

```typescript
import { ConfirmDialogExampleService } from './confirm-dialog-example.service';

constructor(private confirmService: ConfirmDialogExampleService) {}

// Basic confirmation
this.confirmService.showConfirm('Delete Item', 'Are you sure?')
  .subscribe(confirmed => {
    if (confirmed) {
      // Handle confirmation
    }
  });

// Warning dialog
this.confirmService.showWarning('Proceed with Caution', 'This action may have consequences.')
  .subscribe(proceed => {
    if (proceed) {
      // Handle proceeding
    }
  });

// Error dialog
this.confirmService.showError('Operation Failed', 'Something went wrong. Please try again.')
  .subscribe(() => {
    // Handle acknowledgment
  });

// Success dialog
this.confirmService.showSuccess('Operation Complete', 'Your action was successful!')
  .subscribe(() => {
    // Handle success acknowledgment
  });

// Delete confirmation
this.confirmService.showDeleteConfirm('My Document')
  .subscribe(deleted => {
    if (deleted) {
      // Handle deletion
    }
  });
```

## Configuration Options

### ConfirmDialogData Interface

```typescript
interface ConfirmDialogData {
  title: string;                    // Dialog title
  message: string;                  // Dialog message
  confirmText?: string;             // Confirm button text (default: 'Confirm')
  cancelText?: string;              // Cancel button text (default: 'Cancel')
  type?: DialogType;                // Dialog type (default: 'question')
  showCancel?: boolean;             // Show cancel button (default: true)
  confirmColor?: 'primary' | 'accent' | 'warn'; // Confirm button color
  icon?: string;                    // Custom icon name
}
```

### DialogType

```typescript
type DialogType = 'warning' | 'error' | 'info' | 'success' | 'question';
```

## Examples

### Warning Dialog
```typescript
const warningData: ConfirmDialogData = {
  title: 'Unsaved Changes',
  message: 'You have unsaved changes. Are you sure you want to leave?',
  type: 'warning',
  confirmText: 'Leave Page',
  cancelText: 'Stay Here'
};
```

### Error Dialog (No Cancel Button)
```typescript
const errorData: ConfirmDialogData = {
  title: 'Connection Error',
  message: 'Unable to connect to the server. Please check your internet connection.',
  type: 'error',
  confirmText: 'OK',
  showCancel: false
};
```

### Success Dialog
```typescript
const successData: ConfirmDialogData = {
  title: 'Profile Updated',
  message: 'Your profile has been successfully updated.',
  type: 'success',
  confirmText: 'Continue',
  showCancel: false
};
```

### Custom Icon Dialog
```typescript
const customData: ConfirmDialogData = {
  title: 'Custom Action',
  message: 'This dialog uses a custom icon.',
  type: 'info',
  icon: 'star',
  confirmText: 'Awesome!',
  cancelText: 'Not Now'
};
```

## Styling

The component includes comprehensive CSS with:

- Smooth animations and transitions
- Responsive design for mobile devices
- Dark mode support
- Hover effects on buttons
- Professional color schemes for each dialog type

### Custom Styling

You can override the default styles by targeting the component's CSS classes:

```css
/* Custom dialog container */
.confirm-dialog-container {
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
}

/* Custom button styling */
.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

/* Custom icon container */
.icon-container {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
```

## Accessibility

The component is built with accessibility in mind:

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes
- Focus management

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- Angular Material (Dialog, Button, Card, Icon modules)
- Angular Common module

## Installation

1. Ensure Angular Material is installed in your project
2. Import the component in your module or use it as a standalone component
3. Import the required Angular Material modules

```typescript
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
```

## License

This component is part of the LSL Platform project. 