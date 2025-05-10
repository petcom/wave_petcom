# Changes from Original Repository

This document outlines the differences between this repository and the original Wave theme repository located in `_references/Wave-main`.

## CSS Changes

1. **File: `assets/css/general/vars.css`**
   - **Line 2-14**: Introduction of CSS variables for colors and fonts, such as `--brand-color`, `--primary-text-color`, `--font-sans`, etc.
   - **Line 17-19**: Media query for adjusting `--header-spacing` on smaller screens.
   - **Line 23-27**: Commented out variables for `--background-color`, `--text-color`, `--accent-color`, and `--link-color`.

2. **File: `assets/css/site/header.css`**
   - **Line 2-6**: Styles for `.gh-head` and `.site-header-content` to use CSS variables for background and text colors.
   - **Line 7-9**: Styles for links within `.gh-head` and `.site-header-content` to use CSS variables for text color and hover color.
   - **Line 12-24**: Commented out styles for `.gh-head` and `.header-wrapper` that previously used hardcoded colors.

## HTML Changes

1. **File: `default.hbs`**
   - **Line 5-14**: Inline styles using CSS variables for `--background-color`, `--text-color`, `--accent-color`, and `--link-color` with values sourced from `{{@custom}}` properties.
   - **Line 16-20**: Application of these variables to the `body` and `a` elements for dynamic styling based on custom settings.

## Package Changes
- Differences in `package.json` formatting and additional color options for customization.

## Additional Files
- New directories and files such as `docs`, `node_modules`, and `package-lock.json`.

## File Differences
- Various differences in CSS files indicating changes in styling and layout. 