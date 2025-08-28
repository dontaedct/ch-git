import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  Package, 
  BarChart3, 
  MessageSquare, 
  Clock, 
  Plus,
  RefreshCw,
  Inbox,
  FolderOpen,
  Search,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  icon: React.ReactNode
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center ${className}`}>
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 max-w-sm">{description}</p>
      </div>
      {action && (
        <div className="mt-2">
          {action.href ? (
            <Link href={action.href}>
              <Button size="sm" className="h-8 text-xs px-3">
                <Plus className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button size="sm" className="h-8 text-xs px-3" onClick={action.onClick}>
              <Plus className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Legacy empty states (keeping for backward compatibility)
export function SessionsEmptyState() {
  return (
    <EmptyState
      title="No upcoming sessions"
      description="Create your first session to get started."
      icon={<Calendar className="w-6 h-6 text-gray-400" />}
      action={{
        label: "Create Session",
        href: "/sessions/new"
      }}
    />
  )
}

export function RSVPsEmptyState() {
  return (
    <EmptyState
      title="No RSVPs yet"
      description="Invite clients to this session to manage RSVPs here."
      icon={<Users className="w-6 h-6 text-gray-400" />}
      action={{
        label: "Send Invitations",
        href: "/invitations"
      }}
    />
  )
}

// New comprehensive empty states
export function DashboardEmptyState() {
  return (
    <EmptyState
      title="Welcome to your dashboard"
      description="Start by creating your first consultation or setting up your profile."
      icon={<BarChart3 className="w-6 h-6 text-gray-400" />}
      action={{
        label: "New Consultation",
        href: "/questionnaire"
      }}
    />
  )
}

export function ConsultationsEmptyState() {
  return (
    <EmptyState
      title="No consultations yet"
      description="Create your first consultation to start helping clients."
      icon={<MessageSquare className="w-6 h-6 text-gray-400" />}
      action={{
        label: "Start Consultation",
        href: "/questionnaire"
      }}
    />
  )
}

export function ModulesEmptyState() {
  return (
    <EmptyState
      title="No modules configured"
      description="Set up consultation modules to customize your workflow."
      icon={<Package className="w-6 h-6 text-gray-400" />}
      action={{
        label: "Add Module",
        href: "/dashboard/modules"
      }}
    />
  )
}

export function CatalogEmptyState() {
  return (
    <EmptyState
      title="No catalog items"
      description="Add items to your service catalog to get started."
      icon={<FolderOpen className="w-6 h-6 text-gray-400" />}
      action={{
        label: "Add Catalog Item",
        href: "/dashboard/catalog"
      }}
    />
  )
}

export function SettingsEmptyState() {
  return (
    <EmptyState
      title="Settings not configured"
      description="Configure your account settings to personalize your experience."
      icon={<Settings className="w-6 h-6 text-gray-400" />}
      action={{
        label: "Configure Settings",
        href: "/dashboard/settings"
      }}
    />
  )
}

export function SearchEmptyState() {
  return (
    <EmptyState
      title="No results found"
      description="Try adjusting your search terms or browse all items."
      icon={<Search className="w-6 h-6 text-gray-400" />}
    />
  )
}

export function InboxEmptyState() {
  return (
    <EmptyState
      title="Inbox is empty"
      description="You're all caught up! New messages will appear here."
      icon={<Inbox className="w-6 h-6 text-gray-400" />}
    />
  )
}

export function ReportsEmptyState() {
  return (
    <EmptyState
      title="No reports available"
      description="Generate your first report to see insights about your consultations."
      icon={<BarChart3 className="w-6 h-6 text-gray-400" />}
      action={{
        label: "Generate Report",
        href: "/reports"
      }}
    />
  )
}

export function ClientsEmptyState() {
  return (
    <EmptyState
      title="No clients yet"
      description="Your client list will appear here once you start consultations."
      icon={<Users className="w-6 h-6 text-gray-400" />}
      action={{
        label: "Add Client",
        href: "/clients/new"
      }}
    />
  )
}

export function AppointmentsEmptyState() {
  return (
    <EmptyState
      title="No appointments scheduled"
      description="Schedule your first appointment to start managing your calendar."
      icon={<Clock className="w-6 h-6 text-gray-400" />}
      action={{
        label: "Schedule Appointment",
        href: "/appointments/new"
      }}
    />
  )
}

export function DocumentsEmptyState() {
  return (
    <EmptyState
      title="No documents uploaded"
      description="Upload documents to share with clients or store for reference."
      icon={<FileText className="w-6 h-6 text-gray-400" />}
      action={{
        label: "Upload Document",
        href: "/documents/upload"
      }}
    />
  )
}

// Generic empty state for lists
export function GenericListEmptyState({ 
  itemType = "items", 
  actionLabel = "Add Item",
  actionHref,
  actionOnClick 
}: { 
  itemType?: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
}) {
  return (
    <EmptyState
      title={`No ${itemType} found`}
      description={`Get started by adding your first ${itemType.slice(0, -1)}.`}
      icon={<FolderOpen className="w-6 h-6 text-gray-400" />}
      action={{
        label: actionLabel,
        href: actionHref,
        onClick: actionOnClick
      }}
    />
  )
}

// First run empty state
export function FirstRunEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-12 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-blue-600" />
      </div>
      <div className="space-y-3 max-w-md">
        <h2 className="text-lg font-semibold text-gray-900">Welcome! Let&apos;s get started</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          This appears to be your first time here. Let&apos;s help you set up your account and create your first consultation.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/questionnaire">
          <Button className="h-10 px-6">
            <Plus className="w-4 h-4 mr-2" />
            Start First Consultation
          </Button>
        </Link>
        <Link href="/dashboard/settings">
          <Button variant="outline" className="h-10 px-6">
            <Settings className="w-4 h-4 mr-2" />
            Configure Settings
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Loading state for when data is being fetched
export function LoadingEmptyState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 p-8 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">{message}</p>
      </div>
    </div>
  )
}

// Export the base EmptyState component for custom use
export { EmptyState }
