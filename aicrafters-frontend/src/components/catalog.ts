export const componentCatalog = {
  common: {
    buttons: [
      {
        name: 'Primary Button',
        variants: ['contained', 'outlined', 'text'],
        sizes: ['small', 'medium', 'large'],
      },
      {
        name: 'Icon Button',
        variants: ['round', 'square'],
      },
      {
        name: 'Loading Button',
        states: ['loading', 'disabled'],
      },
    ],
    inputs: [
      {
        name: 'Text Input',
        variants: ['outlined', 'filled'],
        states: ['default', 'error', 'success'],
      },
      {
        name: 'Search Input',
        features: ['autocomplete', 'suggestions'],
      },
      {
        name: 'Select Input',
        variants: ['single', 'multiple'],
      },
    ],
    cards: [
      {
        name: 'Course Card',
        variants: ['horizontal', 'vertical'],
      },
      {
        name: 'Profile Card',
        variants: ['compact', 'detailed'],
      },
      {
        name: 'Achievement Card',
        variants: ['badge', 'certificate'],
      },
    ],
  },
  features: {
    courses: [
      {
        name: 'Course List',
        variants: ['grid', 'list'],
      },
      {
        name: 'Course Details',
        sections: ['overview', 'curriculum', 'reviews'],
      },
      {
        name: 'Course Progress',
        features: ['progress bar', 'completion status'],
      },
    ],
    auth: [
      {
        name: 'Login Form',
        variants: ['email', 'social'],
      },
      {
        name: 'Registration Form',
        variants: ['user', 'trainer'],
      },
      {
        name: 'Password Reset',
        steps: ['request', 'verify', 'reset'],
      },
    ],
    cart: [
      {
        name: 'Cart Item',
        features: ['quantity', 'remove'],
      },
      {
        name: 'Cart Summary',
        features: ['subtotal', 'discount', 'total'],
      },
      {
        name: 'Checkout Form',
        sections: ['billing', 'payment'],
      },
    ],
  },
  layout: {
    navigation: [
      {
        name: 'Header',
        variants: ['public', 'authenticated'],
      },
      {
        name: 'Footer',
        sections: ['links', 'social', 'legal'],
      },
      {
        name: 'Sidebar',
        variants: ['user', 'trainer', 'admin'],
      },
    ],
    dashboard: [
      {
        name: 'Dashboard Layout',
        variants: ['user', 'trainer', 'admin'],
      },
      {
        name: 'Stats Card',
        variants: ['numeric', 'chart'],
      },
      {
        name: 'Activity Feed',
        items: ['notifications', 'updates'],
      },
    ],
  },
}; 