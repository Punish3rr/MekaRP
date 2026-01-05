# Changelog

## [1.0.0] - Initial Release

### Features
- Multi-workshop work order tracking system
- Role-based access control (ADMIN, MANAGER, MIDDLE_MANAGER, PERSONNEL)
- Orders management with customer and product tracking
- Work items with status workflow and progress tracking
- Process chain tracking per work item
- Approval workflow for personnel status updates
- Image and PDF attachments with Supabase Storage
- Comprehensive audit logging
- In-app notifications
- Archive view for completed/cancelled work items
- Dashboard with status counts and metrics
- Order cloning feature

### Database
- Complete schema with all tables, enums, and indexes
- Row Level Security (RLS) policies for all tables
- Audit triggers for automatic logging
- Process chain support

### Security
- Supabase Auth integration
- RLS policies enforced at database level
- Permission checks in server actions
- Secure file uploads with signed URLs

### UI/UX
- Mobile-first responsive design
- Modern UI with Tailwind CSS and shadcn/ui
- Status indicators with color coding
- Progress bars for work items
- Intuitive navigation

### Known Limitations / TODOs
- Record locking: Structure in place, needs full implementation
- Export/Import: CSV/XLSX export and Excel import need implementation
- SLA notifications: Manual trigger needed, automated cron job pending
- Attachment retention policy: 30-day cleanup needs scheduled job
- Process template system: Scaffolded but needs full implementation
- Email/Telegram notifications: Not implemented (as per requirements)
