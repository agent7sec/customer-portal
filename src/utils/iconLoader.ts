/**
 * Icon Loader Utility
 * 
 * Provides lazy loading for Ant Design icons to reduce initial bundle size.
 * Icons are loaded on-demand rather than bundling all icons upfront.
 * 
 * Usage:
 * import { loadIcon } from '@/utils/iconLoader';
 * const Icon = loadIcon('UserOutlined');
 */

import { lazy, ComponentType } from 'react';
import type { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';

type IconComponent = ComponentType<AntdIconProps>;

/**
 * Cache for loaded icons to avoid re-importing
 */
const iconCache = new Map<string, IconComponent>();

/**
 * Dynamically load an Ant Design icon by name
 * 
 * @param iconName - The name of the icon (e.g., 'UserOutlined', 'SettingFilled')
 * @returns A lazy-loaded icon component
 * 
 * @example
 * const UserIcon = loadIcon('UserOutlined');
 * <UserIcon style={{ fontSize: '24px' }} />
 */
export const loadIcon = (iconName: string): IconComponent => {
  // Return cached icon if already loaded
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!;
  }

  // Lazy load the icon
  const LazyIcon = lazy(() =>
    import('@ant-design/icons').then((icons) => {
      const Icon = (icons as any)[iconName];
      if (!Icon) {
        console.warn(`Icon "${iconName}" not found in @ant-design/icons`);
        // Return a fallback empty component
        return { default: () => null };
      }
      return { default: Icon };
    })
  );

  iconCache.set(iconName, LazyIcon);
  return LazyIcon;
};

/**
 * Preload commonly used icons to avoid loading delays
 * Call this function early in the app lifecycle
 * 
 * @param iconNames - Array of icon names to preload
 */
export const preloadIcons = async (iconNames: string[]): Promise<void> => {
  const icons = await import('@ant-design/icons');
  
  iconNames.forEach((iconName) => {
    const Icon = (icons as any)[iconName];
    if (Icon && !iconCache.has(iconName)) {
      iconCache.set(iconName, Icon);
    }
  });
};

/**
 * Common icons used throughout the application
 * These can be preloaded on app initialization
 */
export const COMMON_ICONS = [
  'UserOutlined',
  'LockOutlined',
  'MailOutlined',
  'DashboardOutlined',
  'UploadOutlined',
  'FileOutlined',
  'DownloadOutlined',
  'CheckCircleOutlined',
  'CloseCircleOutlined',
  'LoadingOutlined',
  'SettingOutlined',
  'LogoutOutlined',
  'MenuOutlined',
  'BellOutlined',
] as const;

/**
 * Clear the icon cache (useful for testing or memory management)
 */
export const clearIconCache = (): void => {
  iconCache.clear();
};
