# Agent Rules

## Rules
- never write to the /references/ directory, it is used for reference only
- reference root README.md for project details
- the /docs/ directory is for documentation about the project except for README.md

## Common Folder Files
- manifest.md is used for describing the contents of a specific folder, optionally including subfolders

## Project Structure
- Use modern JavaScript practices, including ES6+ features such as arrow functions, template literals, destructuring, modules, and promises. Ensure code is clean, modular, and follows best practices for maintainability and performance.
- Use semantic HTML
- Use CSS for styling
- Browser navigation should remain within the single HTML file the library gets embedded within, but the History API should be used to allow for back/forward navigation

# Documentation
- The agent should update documentation as it completes its work in the following ways:
  - Update the `/docs/AGENT-HISTORY.md` with a history of the work it has done
  - Update the `/docs/ARCHITECTURE.md` to describe and justify the decisions made on how the software is designed. This should include:
    - An overview of the system architecture
    - Key components and their interactions
    - Design patterns used
    - Rationale for architectural decisions
    - Any changes made to the architecture during development
  - Update `/docs/AGENT-RULES.md` to remember rules it has been given that it should continue to follow

## Coding Style (General)
- My philosophy on code is to have all methods and public fields/properties to be well-documented with comments that can be exported to a documentation generator, and code should be written similar to paragraphs with a single line comments describing that those lines in the "paragraph" does

## Coding Style (JavaScript)
- use ES6+ features
- use const and let instead of var
- use arrow functions instead of function declarations
- use template literals instead of string concatenation
- use const for constants
- use let for variables that will change
- use const for functions that will not change
- use const for objects that will not change
- use const for arrays that will not change
- use async/await when appropriate
- detect and handle errors
- use JSDoc comments to document code
- use classes to organize code
- use a settings class to specify default settings, accept object parameters for constructors with any key not specified coming from the default settings object, for example if you have a class name SonarCalendar, SonarCalendarSettings will contain default settings for the SonarCalendar class.

## Coding Style (CSS)
- All CSS should be mobile-first and mobile-responsive
- Use CSS variables for colors and dimensions
- Use CSS variables for spacing
- Multiple theme files should be available to provide as an example and stored in a separate CSS file
- Light and dark themes should be available
- CSS should use well-commented sections to make maintenance easier

## Task and History Management
- After completing a task, update `/docs/TASKS.md` by checking the [ ] box like [X] to indicate completion.
- Log all actions and changes made by the AI in `/docs/AGENT-HISTORY.md` immediately after each step using the template within that file.
- If new rules are given or existing ones need modification, update `/docs/AGENT-RULES.md` to ensure they are remembered and followed.

## Consistency
- Ensure that all updates to `/docs/AGENT-RULES.md`, `/docs/AGENT-HISTORY.md`, and `/docs/TASKS.md` are consistent with the actions taken and reflect the current state of the project.

