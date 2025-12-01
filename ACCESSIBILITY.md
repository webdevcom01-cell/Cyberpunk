# Accessibility (A11y) Guide

This document outlines the accessibility features implemented in the CrewAI Orchestrator application.

## WCAG 2.1 Compliance

The application aims to meet WCAG 2.1 Level AA compliance.

### Implemented Features

#### 1. Keyboard Navigation

- **Skip Link**: Press `Tab` on page load to reveal "Skip to main content" link
- **Focus Management**: All interactive elements are focusable with visible focus indicators
- **Focus Trap**: Modal dialogs trap focus within the dialog
- **Escape Key**: Press `Escape` to close modals and menus

#### 2. Screen Reader Support

- **ARIA Labels**: All interactive elements have descriptive labels
- **ARIA Live Regions**: Dynamic content updates are announced
- **Semantic HTML**: Proper use of landmarks, headings, and lists
- **Form Labels**: All form inputs have associated labels

#### 3. Visual Accessibility

- **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **High Contrast Mode**: Supports `prefers-contrast: high` and Windows High Contrast

#### 4. Touch Accessibility

- **Touch Targets**: Minimum 44x44px touch target size
- **Spacing**: Adequate spacing between interactive elements
- **Gestures**: No complex gestures required

## Components

### Accessible Button
\`\`\`tsx
import { AccessibleButton } from "@/components/accessible-button"

<AccessibleButton
  isLoading={loading}
  loadingText="Saving..."
  onClick={handleSave}
>
  Save Changes
</AccessibleButton>
\`\`\`

### Skip Link
Automatically included in the layout. Users can press Tab to access it.

### Focus Trap
\`\`\`tsx
import { FocusTrap } from "@/components/focus-trap"

<FocusTrap active={isOpen} onEscape={() => setIsOpen(false)}>
  <DialogContent>...</DialogContent>
</FocusTrap>
\`\`\`

### Announcements
\`\`\`tsx
import { useAnnouncement } from "@/components/announcement"

const { message, announce } = useAnnouncement()

// Announce when data is saved
announce("Changes saved successfully")
\`\`\`

## Testing Accessibility

### Manual Testing

1. **Keyboard-only navigation**: Navigate the entire app using only keyboard
2. **Screen reader testing**: Test with VoiceOver (Mac), NVDA (Windows), or Orca (Linux)
3. **Zoom testing**: Ensure app works at 200% zoom
4. **Color blindness**: Use browser extensions to simulate color blindness

### Automated Testing

\`\`\`bash
# Run accessibility tests
npm run test:a11y

# Generate accessibility report
npm run test:a11y:report
\`\`\`

## CSS Utilities

\`\`\`css
/* Focus ring for interactive elements */
.focus-ring

/* Minimum touch target size */
.touch-target-min

/* Screen reader only content */
.sr-only

/* Text wrapping for better readability */
.text-balance
.text-pretty
\`\`\`

## Best Practices

1. **Always use semantic HTML** - Use `<button>` for actions, `<a>` for navigation
2. **Provide text alternatives** - Add `alt` text to images, `aria-label` to icon buttons
3. **Use landmarks** - `<main>`, `<nav>`, `<header>`, `<footer>`
4. **Maintain focus order** - Logical tab order that matches visual order
5. **Test with real users** - Include users with disabilities in testing

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
