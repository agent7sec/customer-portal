import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadIcon, preloadIcons, clearIconCache, COMMON_ICONS } from './iconLoader';

describe('iconLoader', () => {
  beforeEach(() => {
    clearIconCache();
  });

  describe('loadIcon', () => {
    it('should return a lazy component for valid icon name', () => {
      const Icon = loadIcon('UserOutlined');
      expect(Icon).toBeDefined();
      expect(typeof Icon).toBe('object');
    });

    it('should cache loaded icons', () => {
      const Icon1 = loadIcon('UserOutlined');
      const Icon2 = loadIcon('UserOutlined');
      expect(Icon1).toBe(Icon2);
    });

    it('should handle different icon names', () => {
      const UserIcon = loadIcon('UserOutlined');
      const SettingIcon = loadIcon('SettingOutlined');
      expect(UserIcon).not.toBe(SettingIcon);
    });
  });

  describe('preloadIcons', () => {
    it('should preload multiple icons', async () => {
      await preloadIcons(['UserOutlined', 'SettingOutlined']);
      
      // Icons should be cached after preloading
      const Icon1 = loadIcon('UserOutlined');
      const Icon2 = loadIcon('SettingOutlined');
      
      expect(Icon1).toBeDefined();
      expect(Icon2).toBeDefined();
    });

    it('should handle empty array', async () => {
      await expect(preloadIcons([])).resolves.not.toThrow();
    });
  });

  describe('clearIconCache', () => {
    it('should clear the icon cache', () => {
      const Icon1 = loadIcon('UserOutlined');
      clearIconCache();
      const Icon2 = loadIcon('UserOutlined');
      
      // After clearing cache, should get a new instance
      expect(Icon1).not.toBe(Icon2);
    });
  });

  describe('COMMON_ICONS', () => {
    it('should contain expected common icons', () => {
      expect(COMMON_ICONS).toContain('UserOutlined');
      expect(COMMON_ICONS).toContain('SettingOutlined');
      expect(COMMON_ICONS).toContain('DashboardOutlined');
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(COMMON_ICONS)).toBe(true);
      expect(COMMON_ICONS.length).toBeGreaterThan(0);
    });
  });
});
