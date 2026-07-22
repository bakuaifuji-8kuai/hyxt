import {
  CircleParking, Coins, QrCode, Crown, Headphones, Search, Car, Zap, Gift,
  UtensilsCrossed, ShoppingBag, Tag, Bell, User, Settings, Star, Heart,
  MapPin, Clock, Coffee, Film, Smartphone, Ticket, Percent, Award,
  TrendingUp, ShoppingCart, Package, Store, Phone, MessageCircle,
  ChevronRight, CheckCircle, XCircle, AlertCircle, Info
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  'parking': CircleParking,
  'coins': Coins,
  'qrcode': QrCode,
  'crown': Crown,
  'headphones': Headphones,
  'search': Search,
  'car': Car,
  'zap': Zap,
  'gift': Gift,
  'utensils': UtensilsCrossed,
  'shopping-bag': ShoppingBag,
  'tag': Tag,
  'bell': Bell,
  'user': User,
  'settings': Settings,
  'star': Star,
  'heart': Heart,
  'location': MapPin,
  'clock': Clock,
  'coffee': Coffee,
  'film': Film,
  'phone': Phone,
  'smartphone': Smartphone,
  'ticket': Ticket,
  'percent': Percent,
  'award': Award,
  'trending': TrendingUp,
  'cart': ShoppingCart,
  'package': Package,
  'store': Store,
  'message': MessageCircle,
  'chevron-right': ChevronRight,
  'check': CheckCircle,
  'x': XCircle,
  'alert': AlertCircle,
  'info': Info,
};

export const MiniIcon: React.FC<{
  name?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}> = ({ name, size = 22, color = 'currentColor', strokeWidth = 2 }) => {
  const Icon = (name && ICON_MAP[name]) || Tag;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
};

export default MiniIcon;
