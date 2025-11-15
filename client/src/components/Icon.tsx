import {
  Plus,
  Car,
  CreditCard,
  AlertTriangle,
  Wallet,
  Truck,
  DollarSign,
  Receipt,
  Edit,
  CheckCheck,
  Archive,
  FileText,
  AlertCircle,
  AlertOctagon,
  Coins,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  UserPlus,
  Sun,
  Moon,
  LucideIcon,
  ArrowLeft,
  FileCheck,
  FileX,
  FilePlus,
  Ban,
  Building,
  Camera,
  Check,
  CheckCircle,
  ListChecks,
  X,
  Trash2,
  Download,
  Calendar,
  Filter,
  History,
  Info,
  Globe,
  ShieldAlert,
  MapPin,
  Lock,
  LogIn,
  FileImage,
  Printer,
  Clock,
  Shield,
  Database,
  Table,
  Undo,
  Eye,
  User,
  PersonStanding,
  HourglassIcon,
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
}

// Comprehensive mapping of Material Icons to Lucide React icons
const iconMap: Record<string, LucideIcon> = {
  // Actions
  add: Plus,
  edit: Edit,
  edit_note: Edit,
  done_all: CheckCheck,
  delete: Trash2,
  close: X,
  clear: X,
  check: Check,
  check_circle: CheckCircle,
  undo: Undo,
  download: Download,
  print: Printer,
  
  // Transportation & Vehicles
  directions_car: Car,
  local_shipping: Truck,
  drive_eta: Car,
  
  // Finance & Money
  payments: CreditCard,
  payment: CreditCard,
  account_balance_wallet: Wallet,
  account_balance: DollarSign,
  attach_money: DollarSign,
  receipt_long: Receipt,
  monetization_on: Coins,
  
  // Alerts & Status
  warning: AlertTriangle,
  error: AlertCircle,
  dangerous: AlertOctagon,
  block: Ban,
  info: Info,
  
  // Documents & Data
  description: FileText,
  archive: Archive,
  assessment: BarChart3,
  assignment: FileCheck,
  assignment_turned_in: FileCheck,
  assignment_late: FileX,
  checklist: ListChecks,
  picture_as_pdf: FileImage,
  table_chart: Table,
  
  // Trends
  trending_up: TrendingUp,
  trending_down: TrendingDown,
  
  // People
  people: Users,
  person: User,
  person_add: UserPlus,
  badge: PersonStanding,
  
  // Theme
  light_mode: Sun,
  dark_mode: Moon,
  
  // Navigation
  arrow_back: ArrowLeft,
  
  // Buildings & Organizations
  business: Building,
  
  // Media
  camera_alt: Camera,
  
  // Date & Time
  event: Calendar,
  schedule: Clock,
  history: History,
  pending: HourglassIcon,
  
  // Actions & Tools
  filter_list: Filter,
  visibility: Eye,
  
  // Security & Auth
  security: Shield,
  lock: Lock,
  login: LogIn,
  local_police: ShieldAlert,
  
  // Location
  location_on: MapPin,
  local_hospital: AlertCircle,
  
  // System
  storage: Database,
  language: Globe,
};

export function Icon({ name, className = '' }: IconProps) {
  const IconComponent = iconMap[name] || FileText;
  
  // Add default size if not specified in className
  const finalClassName = className.includes('w-') || className.includes('h-') 
    ? className 
    : `h-4 w-4 ${className}`.trim();
  
  return <IconComponent className={finalClassName} />;
}
