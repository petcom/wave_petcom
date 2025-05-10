# TASKS.md
To use this, tell the agent to complete the tasks under one of the sections, like "Project Setup".

# Instructions
This file is for tracking tasks that need to be completed.
The format is as follows:

## 1. [ ] Section Name [Priority: High/Medium/Low]
- [ ] Task Name [Category] (Completion criteria)
- [ ] Task Name [Category] (Depends on: Task X)
- [X] Completed Task Name
## 2. [X] Completed Section Name
- [X] Completed Task Name (all must be checked for section to be completed)

The agent should update this file as it completes tasks.
Tasks should be organized into sections named using ## Headers.
Sections should be numbered (e.g., "## 1. Section Name") to make them easier for humans to reference.
Individual tasks within sections do not need numbers and should use bullet points as shown above.

## 1. [ ] Project Setup [Priority: High]
- [ ] Create a series of well organized steps to complete this project [PLANNING] (Criteria: Steps should cover all aspects of implementation)
- [x] Move dist folder to root and update references [STRUCTURE]

---
AGENT CREATED TASKS SHOULD GO BELOW THIS LINE.  HUMAN CREATED TASKS SHOULD GO ABOVE THIS LINE.   HUMANS MAY EDIT AGENT CREATED TASKS, BUT AGENT SHOULD NOT EDIT HUMAN CREATED TASKS.  THE SECTIONS ABOVE USE NUMBERS AS EXAMPLES AND NUMBERING SHOULD START WITH 1
---

# Agent Created Tasks

## 1. [ ] Documentation Update
- [ ] Review the README.md file and update it to reflect any changes made to this repository compared to the original repository found in _references/Wave-main.
- [ ] Update the /docs/ directory to document any architectural or functional changes from the original repository.
- [ ] Ensure that all updates are consistent with the current state of the project and adhere to the rules outlined in /docs/AGENT-RULES.md.


