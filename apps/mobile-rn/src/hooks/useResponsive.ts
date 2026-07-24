import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWeb: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  columns: number;
  maxWidth: number;
}

const BREAKPOINTS = {
  mobile: 600,
  tablet: 1024,
  desktop: 1440,
};

export function useResponsive(): ResponsiveInfo {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;

  let breakpoint: Breakpoint = 'mobile';
  if (width >= BREAKPOINTS.desktop) breakpoint = 'desktop';
  else if (width >= BREAKPOINTS.tablet) breakpoint = 'tablet';

  let columns = 1;
  if (width >= BREAKPOINTS.desktop) columns = 5;
  else if (width >= BREAKPOINTS.tablet) columns = 4;
  else if (width >= BREAKPOINTS.mobile) columns = 3;
  else if (width >= 400) columns = 2;

  let maxWidth = width;
  if (width >= BREAKPOINTS.desktop) maxWidth = 1200;
  else if (width >= BREAKPOINTS.tablet) maxWidth = 960;
  else if (width >= BREAKPOINTS.mobile) maxWidth = 560;

  return {
    width,
    height,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isWeb: Platform.OS === 'web',
    isAndroid: Platform.OS === 'android',
    isIOS: Platform.OS === 'ios',
    columns,
    maxWidth,
  };
}

export function getResponsiveColumns(width: number): number {
  if (width >= BREAKPOINTS.desktop) return 5;
  if (width >= BREAKPOINTS.tablet) return 4;
  if (width >= BREAKPOINTS.mobile) return 3;
  if (width >= 400) return 2;
  return 1;
}
