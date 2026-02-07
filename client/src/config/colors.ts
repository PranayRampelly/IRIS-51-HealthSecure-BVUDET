/**
 * HealthTech Color Palette Configuration
 * 
 * This file contains all the color definitions used throughout the application.
 * Colors are organized into categories for easy reference and maintenance.
 */

// Brand Colors (8 colors) - Primary application colors
export const brandColors = {
  healthTeal: '#004D40',      // Primary brand color - deep teal
  healthAqua: '#00796B',      // Secondary brand color - medium teal
  healthLightGray: '#F5F5F5', // Light background color
  healthCharcoal: '#424242',  // Text color - dark gray
  healthBlueGray: '#546E7A',  // Accent color - blue-gray
  healthSuccess: '#2E7D32',   // Success state - green
  healthDanger: '#C62828',    // Error state - red
  healthWarning: '#F57C00',   // Warning state - orange
} as const;

// Chart Colors (6 colors) - Data visualization
export const chartColors = {
  chartBlue: '#0EA5E9',       // Primary chart color
  chartGreen: '#10B981',      // Success/positive data
  chartOrange: '#F59E0B',     // Warning/attention data
  chartRed: '#EF4444',        // Error/negative data
  chartPurple: '#8884d8',     // Secondary chart color
  chartCyan: '#3DCAD0',       // Tertiary chart color
} as const;

// Third-Party Colors (8 colors) - External integrations
export const thirdPartyColors = {
  // Google Colors
  googleBlue: '#4285F4',
  googleGreen: '#34A853',
  googleYellow: '#FBBC05',
  googleRed: '#EA4335',
  
  // Microsoft Colors
  microsoftRed: '#f25022',
  microsoftBlue: '#00a4ef',
  microsoftGreen: '#7fba00',
  microsoftYellow: '#ffb900',
} as const;

// Utility Colors (3 colors) - General purpose
export const utilityColors = {
  grayUtility: '#888',        // General gray utility
  reactBlue: '#646cff',       // React brand color
  reactCyan: '#61dafb',       // React cyan
} as const;

// HSL Theme Colors for Light Mode (25+ colors)
export const lightThemeColors = {
  // Primary colors
  primary: 'hsl(175, 100%, 15%)',           // health-teal
  primaryForeground: 'hsl(0, 0%, 100%)',
  
  // Secondary colors
  secondary: 'hsl(175, 100%, 24%)',         // health-aqua
  secondaryForeground: 'hsl(0, 0%, 100%)',
  
  // Background colors
  background: 'hsl(0, 0%, 100%)',
  foreground: 'hsl(222.2, 84%, 4.9%)',
  
  // Card colors
  card: 'hsl(0, 0%, 100%)',
  cardForeground: 'hsl(222.2, 84%, 4.9%)',
  
  // Popover colors
  popover: 'hsl(0, 0%, 100%)',
  popoverForeground: 'hsl(222.2, 84%, 4.9%)',
  
  // Muted colors
  muted: 'hsl(0, 0%, 96%)',                 // health-light-gray
  mutedForeground: 'hsl(215.4, 16.3%, 46.9%)',
  
  // Accent colors
  accent: 'hsl(175, 100%, 24%)',            // health-aqua
  accentForeground: 'hsl(0, 0%, 100%)',
  
  // Destructive colors
  destructive: 'hsl(0, 84.2%, 60.2%)',      // health-danger
  destructiveForeground: 'hsl(0, 0%, 100%)',
  
  // Border and input colors
  border: 'hsl(214.3, 31.8%, 91.4%)',
  input: 'hsl(214.3, 31.8%, 91.4%)',
  ring: 'hsl(175, 100%, 15%)',              // health-teal
  
  // Sidebar colors
  sidebarBackground: 'hsl(0, 0%, 98%)',
  sidebarForeground: 'hsl(240, 5.3%, 26.1%)',
  sidebarPrimary: 'hsl(175, 100%, 15%)',    // health-teal
  sidebarPrimaryForeground: 'hsl(0, 0%, 100%)',
  sidebarAccent: 'hsl(240, 4.8%, 95.9%)',
  sidebarAccentForeground: 'hsl(240, 5.9%, 10%)',
  sidebarBorder: 'hsl(220, 13%, 91%)',
  sidebarRing: 'hsl(175, 100%, 24%)',       // health-aqua
  
  // Status colors
  success: 'hsl(120, 61%, 34%)',            // health-success
  successForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(25, 100%, 48%)',            // health-warning
  warningForeground: 'hsl(0, 0%, 100%)',
  info: 'hsl(199, 89%, 48%)',               // chart-blue
  infoForeground: 'hsl(0, 0%, 100%)',
  
  // Chart colors
  chartGreen: 'hsl(160, 84%, 39%)',
  chartOrange: 'hsl(38, 93%, 50%)',
  chartRed: 'hsl(0, 84%, 60%)',
  chartPurple: 'hsl(250, 47%, 60%)',
  chartCyan: 'hsl(183, 100%, 41%)',
  
  // Brand colors
  healthCharcoal: 'hsl(0, 0%, 26%)',
  healthBlueGray: 'hsl(200, 13%, 41%)',
  
  // Third-party colors
  googleBlue: 'hsl(217, 89%, 61%)',
  googleGreen: 'hsl(142, 76%, 36%)',
  googleYellow: 'hsl(45, 100%, 51%)',
  googleRed: 'hsl(4, 90%, 58%)',
  microsoftRed: 'hsl(6, 89%, 54%)',
  microsoftBlue: 'hsl(199, 100%, 47%)',
  microsoftGreen: 'hsl(74, 100%, 37%)',
  microsoftYellow: 'hsl(45, 100%, 50%)',
  
  // Utility colors
  grayUtility: 'hsl(0, 0%, 53%)',
  reactBlue: 'hsl(237, 100%, 67%)',
  reactCyan: 'hsl(193, 95%, 68%)',
} as const;

// HSL Theme Colors for Dark Mode (25+ colors)
export const darkThemeColors = {
  // Primary colors
  primary: 'hsl(175, 100%, 24%)',           // health-aqua for dark mode
  primaryForeground: 'hsl(222.2, 47.4%, 11.2%)',
  
  // Secondary colors
  secondary: 'hsl(175, 100%, 15%)',         // health-teal for dark mode
  secondaryForeground: 'hsl(210, 40%, 98%)',
  
  // Background colors
  background: 'hsl(222.2, 84%, 4.9%)',
  foreground: 'hsl(210, 40%, 98%)',
  
  // Card colors
  card: 'hsl(222.2, 84%, 4.9%)',
  cardForeground: 'hsl(210, 40%, 98%)',
  
  // Popover colors
  popover: 'hsl(222.2, 84%, 4.9%)',
  popoverForeground: 'hsl(210, 40%, 98%)',
  
  // Muted colors
  muted: 'hsl(217.2, 32.6%, 17.5%)',
  mutedForeground: 'hsl(215, 20.2%, 65.1%)',
  
  // Accent colors
  accent: 'hsl(175, 100%, 15%)',            // health-teal for dark mode
  accentForeground: 'hsl(210, 40%, 98%)',
  
  // Destructive colors
  destructive: 'hsl(0, 62.8%, 30.6%)',      // health-danger dark
  destructiveForeground: 'hsl(210, 40%, 98%)',
  
  // Border and input colors
  border: 'hsl(217.2, 32.6%, 17.5%)',
  input: 'hsl(217.2, 32.6%, 17.5%)',
  ring: 'hsl(175, 100%, 24%)',              // health-aqua
  
  // Sidebar colors
  sidebarBackground: 'hsl(240, 5.9%, 10%)',
  sidebarForeground: 'hsl(240, 4.8%, 95.9%)',
  sidebarPrimary: 'hsl(175, 100%, 24%)',    // health-aqua
  sidebarPrimaryForeground: 'hsl(222.2, 47.4%, 11.2%)',
  sidebarAccent: 'hsl(240, 3.7%, 15.9%)',
  sidebarAccentForeground: 'hsl(240, 4.8%, 95.9%)',
  sidebarBorder: 'hsl(240, 3.7%, 15.9%)',
  sidebarRing: 'hsl(175, 100%, 24%)',       // health-aqua
  
  // Status colors
  success: 'hsl(120, 61%, 34%)',            // health-success
  successForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(25, 100%, 48%)',            // health-warning
  warningForeground: 'hsl(0, 0%, 100%)',
  info: 'hsl(199, 89%, 48%)',               // chart-blue
  infoForeground: 'hsl(0, 0%, 100%)',
  
  // Chart colors
  chartGreen: 'hsl(160, 84%, 39%)',
  chartOrange: 'hsl(38, 93%, 50%)',
  chartRed: 'hsl(0, 84%, 60%)',
  chartPurple: 'hsl(250, 47%, 60%)',
  chartCyan: 'hsl(183, 100%, 41%)',
  
  // Brand colors (lightened for dark mode)
  healthCharcoal: 'hsl(0, 0%, 74%)',
  healthBlueGray: 'hsl(200, 13%, 61%)',
  
  // Third-party colors
  googleBlue: 'hsl(217, 89%, 61%)',
  googleGreen: 'hsl(142, 76%, 36%)',
  googleYellow: 'hsl(45, 100%, 51%)',
  googleRed: 'hsl(4, 90%, 58%)',
  microsoftRed: 'hsl(6, 89%, 54%)',
  microsoftBlue: 'hsl(199, 100%, 47%)',
  microsoftGreen: 'hsl(74, 100%, 37%)',
  microsoftYellow: 'hsl(45, 100%, 50%)',
  
  // Utility colors (lightened for dark mode)
  grayUtility: 'hsl(0, 0%, 67%)',
  reactBlue: 'hsl(237, 100%, 67%)',
  reactCyan: 'hsl(193, 95%, 68%)',
} as const;

// Color usage examples and recommendations
export const colorUsage = {
  // Primary brand usage
  primary: {
    main: brandColors.healthTeal,      // Main brand color
    secondary: brandColors.healthAqua, // Secondary brand color
    text: brandColors.healthCharcoal,  // Primary text color
    background: brandColors.healthLightGray, // Light background
  },
  
  // Status indicators
  status: {
    success: brandColors.healthSuccess,
    warning: brandColors.healthWarning,
    error: brandColors.healthDanger,
    info: chartColors.chartBlue,
  },
  
  // UI elements
  ui: {
    border: brandColors.healthBlueGray,
    accent: brandColors.healthAqua,
    muted: brandColors.healthLightGray,
  },
  
  // Charts and data visualization
  charts: {
    primary: chartColors.chartBlue,
    secondary: chartColors.chartGreen,
    tertiary: chartColors.chartOrange,
    quaternary: chartColors.chartRed,
    quinary: chartColors.chartPurple,
    senary: chartColors.chartCyan,
  },
  
  // Third-party integrations
  integrations: {
    google: {
      blue: thirdPartyColors.googleBlue,
      green: thirdPartyColors.googleGreen,
      yellow: thirdPartyColors.googleYellow,
      red: thirdPartyColors.googleRed,
    },
    microsoft: {
      red: thirdPartyColors.microsoftRed,
      blue: thirdPartyColors.microsoftBlue,
      green: thirdPartyColors.microsoftGreen,
      yellow: thirdPartyColors.microsoftYellow,
    },
  },
} as const;

// Tailwind CSS class mappings for easy reference
export const tailwindClasses = {
  // Brand colors
  healthTeal: 'text-health-teal bg-health-teal border-health-teal',
  healthAqua: 'text-health-aqua bg-health-aqua border-health-aqua',
  healthLightGray: 'text-health-light-gray bg-health-light-gray border-health-light-gray',
  healthCharcoal: 'text-health-charcoal bg-health-charcoal border-health-charcoal',
  healthBlueGray: 'text-health-blue-gray bg-health-blue-gray border-health-blue-gray',
  healthSuccess: 'text-health-success bg-health-success border-health-success',
  healthDanger: 'text-health-danger bg-health-danger border-health-danger',
  healthWarning: 'text-health-warning bg-health-warning border-health-warning',
  
  // Chart colors
  chartBlue: 'text-chart-blue bg-chart-blue border-chart-blue',
  chartGreen: 'text-chart-green bg-chart-green border-chart-green',
  chartOrange: 'text-chart-orange bg-chart-orange border-chart-orange',
  chartRed: 'text-chart-red bg-chart-red border-chart-red',
  chartPurple: 'text-chart-purple bg-chart-purple border-chart-purple',
  chartCyan: 'text-chart-cyan bg-chart-cyan border-chart-cyan',
  
  // Third-party colors
  googleBlue: 'text-google-blue bg-google-blue border-google-blue',
  googleGreen: 'text-google-green bg-google-green border-google-green',
  googleYellow: 'text-google-yellow bg-google-yellow border-google-yellow',
  googleRed: 'text-google-red bg-google-red border-google-red',
  microsoftRed: 'text-microsoft-red bg-microsoft-red border-microsoft-red',
  microsoftBlue: 'text-microsoft-blue bg-microsoft-blue border-microsoft-blue',
  microsoftGreen: 'text-microsoft-green bg-microsoft-green border-microsoft-green',
  microsoftYellow: 'text-microsoft-yellow bg-microsoft-yellow border-microsoft-yellow',
  
  // Utility colors
  grayUtility: 'text-gray-utility bg-gray-utility border-gray-utility',
  reactBlue: 'text-react-blue bg-react-blue border-react-blue',
  reactCyan: 'text-react-cyan bg-react-cyan border-react-cyan',
} as const;

// Export all colors for easy access
export const allColors = {
  brand: brandColors,
  chart: chartColors,
  thirdParty: thirdPartyColors,
  utility: utilityColors,
  lightTheme: lightThemeColors,
  darkTheme: darkThemeColors,
  usage: colorUsage,
  tailwind: tailwindClasses,
} as const;

export default allColors; 