# Settings & Preferences Architecture

## Component Hierarchy

```
Settings Page (Main Container)
│
├── Sidebar Navigation
│   ├── Profile Tab
│   ├── Theme Tab
│   ├── Notifications Tab
│   ├── Study Tab
│   ├── Privacy Tab
│   ├── Language Tab
│   ├── Shortcuts Tab
│   └── Data Export Tab
│
├── Main Content Area
│   ├── ProfileSettings
│   ├── ThemeSettings
│   ├── NotificationSettings
│   ├── StudySettings
│   ├── PrivacySettings
│   ├── LanguageSettings
│   ├── KeyboardShortcuts
│   └── DataExport
│
└── Quick Actions Panel
    ├── Reset to Defaults
    ├── Import Settings
    └── Get Help
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interaction                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               Settings Component (UI)                        │
│  • ThemeSettings  • NotificationSettings  • StudySettings   │
│  • PrivacySettings  • DataExport  • ProfileSettings         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Settings Store (Zustand)                   │
│  • updateTheme()  • updateNotifications()                   │
│  • updateStudyPreferences()  • updatePrivacy()              │
│  • syncSettings()                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─────────────────────┐
                         │                     │
                         ▼                     ▼
┌──────────────────────────────────┐  ┌──────────────────────┐
│     LocalStorage (Persist)       │  │   Backend API        │
│  • Immediate persistence         │  │  • Server sync       │
│  • Offline support               │  │  • Data backup       │
└──────────────────────────────────┘  └──────────┬───────────┘
                                                  │
                                                  ▼
                                       ┌──────────────────────┐
                                       │   MongoDB Database   │
                                       │  • User settings     │
                                       └──────────────────────┘
```

## Key Features Summary

### 1. Profile Settings
- Avatar upload and preview
- Name editing (first/last)
- Email display (read-only)
- Password change with validation
- Profile photo management

### 2. Theme Settings
- Light/Dark/Auto modes
- System preference detection
- Real-time preview
- Smooth transitions

### 3. Notification Settings
- 8 notification types
- 3 delivery methods (Email, Push, Sound)
- Test notification functionality
- Granular toggle controls

### 4. Study Settings
- Daily review limit slider (10-500)
- Study reminders with time picker
- Auto-play videos toggle
- Show/hide hints
- Keyboard shortcuts enable/disable

### 5. Privacy Settings
- Public profile visibility
- Progress sharing
- Analytics opt-in/out
- Account deletion workflow

### 6. Language Settings
- Multi-language support (EN, ES, FR, DE)
- Flag-based interface
- Regional settings preview
- Translation contribution

### 7. Keyboard Shortcuts
- Comprehensive shortcut reference
- Categorized by function
- Visual key display
- Print option

### 8. Data Export
- Export settings (JSON)
- Export progress data
- Export SRS reviews
- Complete data package
- Format selection (JSON/CSV)

## Technical Stack

### Frontend
- **React 18** - UI components
- **TypeScript** - Type safety
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication

### State Management
- **Zustand Store** - Client state
- **LocalStorage** - Persistence
- **Backend API** - Server sync

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get user settings |
| PUT | `/api/settings` | Update settings |
| POST | `/api/settings/sync` | Sync settings |
| GET | `/api/settings/export-all` | Export all data |
| DELETE | `/api/settings/delete-account` | Delete account |

## Security Features

1. **Authentication**
   - JWT token required for all endpoints
   - User can only access own settings

2. **Validation**
   - Frontend TypeScript validation
   - Backend express-validator
   - Database Mongoose schemas

3. **Data Protection**
   - Passwords hashed with bcrypt
   - HTTP-only cookies for tokens
   - No sensitive data in exports

4. **Account Deletion**
   - Two-step confirmation
   - Type "DELETE" to confirm
   - Permanent action with warnings

## Performance Optimizations

1. **LocalStorage Caching**
   - Immediate UI updates
   - Reduced API calls
   - Offline support

2. **Lazy Loading**
   - Components loaded on demand
   - Reduced initial bundle
   - Faster page load

3. **Optimistic Updates**
   - UI updates immediately
   - Background sync
   - Error rollback

## Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Screen reader compatible
- WCAG AA compliant
- High contrast support
- Touch-friendly targets

## Future Enhancements

1. Settings search functionality
2. Custom theme creation
3. Settings presets
4. Cloud sync across devices
5. Settings history/rollback
6. Advanced keyboard shortcut customization
