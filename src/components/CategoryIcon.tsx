import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Home,
  Film,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Banknote,
  Store,
  Briefcase,
  TrendingUp,
  Award,
  Gift,
  PlusCircle,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

const iconMap: Record<string, React.FC<LucideProps>> = {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Home,
  Film,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Banknote,
  Store,
  Briefcase,
  TrendingUp,
  Award,
  Gift,
  PlusCircle,
  HelpCircle,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent {...props} />;
};
