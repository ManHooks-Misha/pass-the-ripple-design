import {
  Heart,
  Star,
  Trophy,
  Crown,
  Flame,
  Gift,
  Gem,
  Sun,
  Moon,
  Cloud,
  Leaf,
  TreePine,
  Flower2,
  Camera,
  Music,
  Book,
  Gamepad2,
  Palette,
  Wrench,
  Lock,
  Key,
  Bell,
  Mail,
  Phone,
  MapPin,
  Home,
  User,
  Users,
  Settings,
  Search,
  Download,
  Upload,
  Share,
  Coffee,
  Car,
  EarthIcon,
} from "lucide-react";

export interface IconOption {
  name: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const iconOptions: IconOption[] = [
  { name: "heart", label: "Heart", icon: Heart },
  { name: "star", label: "Star", icon: Star },
  { name: "trophy", label: "Trophy", icon: Trophy },
  { name: "crown", label: "Crown", icon: Crown },
  { name: "flame", label: "Flame", icon: Flame },
  { name: "gift", label: "Gift", icon: Gift },
  { name: "gem", label: "Gem", icon: Gem },
  { name: "sun", label: "Sun", icon: Sun },
  { name: "moon", label: "Moon", icon: Moon },
  { name: "cloud", label: "Cloud", icon: Cloud },
  { name: "leaf", label: "Leaf", icon: Leaf },
  { name: "tree", label: "Tree", icon: TreePine },
  { name: "flower", label: "Flower", icon: Flower2 },
  { name: "camera", label: "Camera", icon: Camera },
  { name: "music", label: "Music", icon: Music },
  { name: "book", label: "Book", icon: Book },
  { name: "gamepad2", label: "Game", icon: Gamepad2 },
  { name: "palette", label: "Art", icon: Palette },
  { name: "wrench", label: "Tool", icon: Wrench },
  { name: "lock", label: "Lock", icon: Lock },
  { name: "key", label: "Key", icon: Key },
  { name: "bell", label: "Bell", icon: Bell },
  { name: "mail", label: "Email", icon: Mail },
  { name: "phone", label: "Phone", icon: Phone },
  { name: "mappin", label: "Location", icon: MapPin },
  { name: "home", label: "Home", icon: Home },
  { name: "user", label: "User", icon: User },
  { name: "users", label: "Users", icon: Users },
  { name: "settings", label: "Settings", icon: Settings },
  { name: "search", label: "Search", icon: Search },
  { name: "download", label: "Download", icon: Download },
  { name: "upload", label: "Upload", icon: Upload },
  { name: "share", label: "Share", icon: Share },
  { name: "coffee", label: "Coffee", icon: Coffee },
  { name: "car", label: "Car", icon: Car },
  { name: "earth", label: "Earth", icon: EarthIcon },
];

/**
 * Helper: Get icon component by name
 */
export const getIconByName = (name: string) => {
  return iconOptions.find((item) => item.name === name)?.icon || Star;
};
