export const NAVIGATION_BUTTONS_STYLE_SIDES: string = 'sides';
export const NAVIGATION_BUTTONS_STYLE_TOP: string = 'top';

interface NavigationButtonStyle {
  name: string;
  value: string;
}

export const NAVIGATION_BUTTONS_STYLES: NavigationButtonStyle[] = [
  { name: 'onTheSides', value: NAVIGATION_BUTTONS_STYLE_SIDES },
  { name: 'onTop', value: NAVIGATION_BUTTONS_STYLE_TOP },
];
