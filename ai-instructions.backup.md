1. Overview
This ai-instructions.md file serves as the central guide, documentation, and working memory for the [Project Name]. It is intended for both human developers and AI agents collaborating on this project. This file provides essential information about the project, tracks progress, and facilitates seamless collaboration.

Note: Keep this file at the root of the repository and ensure it is continuously updated by AI agents and human contributors.

2. Project Goals
Objective 1: Clearly state the primary goal of the project.
Objective 2: State secondary goals or sub-objectives.
Target Audience: Describe who will use or benefit from this project.
3. Architecture Summary
Overview: Summarize the overall architecture and how components interact.
Components: List main components and their responsibilities.
Technologies Used: Mention frameworks, libraries, tools, and versions.
4. Development Environment
Languages: Specify programming languages and their versions.
Frameworks/Libraries: List key frameworks and libraries with versions.
Setup Instructions:
Steps to clone the repository.
Commands to install dependencies.
Configuration of environment variables.
Hosting Details: Describe how the project is hosted or deployed.
5. Key Features & Functionality
Feature 1: Brief description.
Feature 2: Brief description.
APIs: Outline any APIs with brief descriptions of endpoints and their purposes.
6. Design Guidelines
Style: Describe the visual style and design principles.
Layout: Outline the layout structure and navigation flow.
Assets: Mention any specific assets to be used (images, icons, fonts).
7. Content Requirements
Audience: Define the audience for the content.
Tone: Describe the desired tone (e.g., professional, casual).
Sections: List the content sections and their purposes.
8. Testing & Deployment
Testing:
Testing frameworks used.
Commands to run tests.
Testing protocols and coverage expectations.
Deployment:
Deployment procedures and environments.
Any CI/CD pipelines or automation scripts.
9. Important Files & Directories
Root Directory:
README.md: General project overview.
ai-instructions.md: This file.
Source Code: Describe the structure of the source code directories.
Assets: Locations of assets like images, fonts, and stylesheets.
10. Known Limitations
Limitation 1: Description of current limitations.
Limitation 2: Potential impact on users or developers.
11. Permanent User Notes (Do Not Overwrite)
Note: This section contains permanent notes from the project owner. Do not modify or remove this section under any circumstances.

- this project is the tech branch of a broader urban forrestry initiative. This is for my neighborhood which has a mixed demographic but biased towards elderly non-technical people.
- ADLA/Website/LandingPage contains a working in-prod landingpage that was created for the purpose of supporting an event. 
- Landing page should be used as reference material only for you to spin up the site and see how it should function and look, all .js and .css files are also copied over to the current working directory
- ADLA/Website/Fullsite is the current working directory. All files and code for the functioning of the new site should be contained within it.
- the project is at a migration phase where we need to migrate what was done already into a new platform and then features will be added as we go along
- I need you to be very critical of my suggestions I don't need fluff or sugar coating, I rather you be succint, direct and assertive.
- before performing actions read through this living document to make sure that your actions align with this.
- Plan --> discuss --> execute should be our working model
- Create an offline backup of this file within the parent directory to prevent accidental deletions.

12. Instructions for AI Agents
As an AI agent working on this project, please adhere to the following guidelines:

Central Working Memory:
Use this ai-instructions.md file as your primary working memory.
Continuously update the Agent Working Memory section with:
Current tasks and progress.
Decisions made and their rationales.
Changes to plans or adjustments needed.
On Every Code Change or Decision:
Immediately document the change in the Agent Working Memory section.
Provide clear reasoning for decisions, especially if deviating from the initial plan.
Maintain Transparency:
Keep updates clear and concise.
Use bullet points or short paragraphs for readability.
Access Your Full Knowledge:
Remember that you have full visibility of the entire codebase and project context.
Avoid uncertainty; state facts confidently.
Error Handling and Learning:
When encountering errors, document them in the Failure Modes Log.
Learn from corrections and avoid repeating mistakes.
Respect Permanent Notes:
Do not modify the Permanent User Notes section.
Collaboration and Handover:
Facilitate seamless transitions by keeping the working memory up-to-date.
Utilize the Transfer Notes section when handing over tasks to another agent.
13. Agent Working Memory
This section is reserved for AI agents to document ongoing progress, plans, decisions, and insights. Continuously update this section as work progresses.

Working Plan
Current Objectives:
Objective A: Description.
Objective B: Description.
Task Breakdown:
Task 1: Details.
Task 2: Details.
Task Progress
Current Task: Describe the task being worked on.
Completed Tasks:
Task X: Summary of accomplishments.
Next Steps: Outline immediate actions to be taken.
Insights and Adjustments
Decisions Made:
Decision X: Reasoning and implications.
Challenges Encountered:
Challenge Y: How it was addressed or plans to address it.
Transfer Notes
Use this section when transitioning work to another agent or team member.

Current State: Brief overview of the project's status.
Recommendations: Suggestions or important information for the next contributor.
14. Meta-Learning Updates
This section is for documenting higher-level learning, protocols, and adjustments to AI agent behaviors.

Self-Awareness Protocol
Act Confidently: Utilize full access to the codebase without hesitation.
Avoid Redundancy: Do not ask for permissions you already have.
Maintain State: Keep track of all changes and decisions.
Error Recovery Protocol
Immediate Correction: When corrected, stop and analyze the mistake.
Documentation: Log errors in the Failure Modes Log.
Adaptation: Adjust behavior to prevent repeat mistakes.
Continuous Improvement
Learn from Feedback: Use user interactions to refine performance.
Enhance Protocols: Update guidelines based on new insights.
15. Design System Notes
Document the design system, including fonts, colors, and other styling guidelines.

Typography:
Primary Font: e.g., Inter for readability.
Monospace Font: e.g., JetBrains Mono for code elements.
Color Palette:
Primary Color: e.g., #3b82f6 (blue).
Secondary Colors: e.g., shades of gray for backgrounds.
Themes:
Support for dark and light modes.
Imagery and Icons:
Use of vector icons or ASCII art where appropriate.
Spacing and Layout:
Guidelines for margins, padding, and grid systems.
16. Failure Modes Log
Document any errors, mistakes, or failure modes encountered, along with their resolutions.

Issue: Brief description.
Cause: Root cause analysis.
Solution: How it was fixed.
Prevention: Measures to prevent recurrence.
17. Agent Brain Dump
Use this section to record detailed insights, observations, and thoughts that may not fit elsewhere.

Project Context & Evolution
Background: Notes on how the project started and its evolution.
Key Changes: Significant pivots or decisions made.
Human Interaction Model
Communication Style: Preferences observed in user interactions.
Feedback Patterns: Common themes in user feedback.
Critical Learnings
Successes: What has worked well.
Areas for Improvement: Identified weaknesses or challenges.
Current Challenges
Technical Obstacles: Any ongoing technical issues.
Process Bottlenecks: Workflow or collaboration challenges.
18. Project Structure & Development
Directory Structure
Provide an overview of the project's directory structure.

./[Project Name]/ ├── index.html # Main HTML file ├── styles.css # CSS stylesheets ├── script.js # JavaScript files ├── assets/ # Images, fonts, icons ├── ai-instructions.md # This file └── [Additional Directories]

Development Environment
Requirements:
Software and version requirements (e.g., Node.js v14+).
Local Development:
Steps to set up a local development environment.
Commands to start the development server.
Deployment
Procedures:
Steps for deploying the project to production.
Environment configurations.
19. Agent Working Memory Updates
Record chronological updates to the Agent Working Memory here.

[Date]: Summary of updates made, decisions taken, and tasks completed.
20. Appendices
A. Resources:
Links to relevant documentation, libraries, or tools.
B. Glossary:
Definitions of terms, acronyms, or abbreviations used.
C. Change Log:
Record of major changes to the project or this document.



############################################################################
Answers to questions from previous chat: Q: Which project is the canonical production target for this repo right now?
A: LandingPage must be updated as it has served it's purpose and needs to reflect Website/Fullsite is under construction. The end-goal now is to re-use the styling, modules and features already developped for landingPage unto the full-site which will have some static and some dynamic pages
Q: What is the main purpose of this repository today in one sentence?
A: today it's a repo made to support a neighborhood initiative
Q: What is Objective 1 for this project (most important measurable outcome)?
A: chronologically it would be to migrate style, features and modules from LandingPage unto FullSite
Q: List 2-5 secondary goals we should encode in ai-instructions.md.
A: Start Construction of the many different tabs the website will have | add dynamic pages for the relevant features | integrate an open-source database to use for the backend of the system | leverage the picture scrapper to enrich the content on the website | create the systems necessary for user accounts (locally) or Entra if possible and low-cost
Q: Who are the target users and stakeholders (neighbors, admins, municipality, etc.)?
A: neighbors who are on average elderly and mostly not technically inclined. However, the long term goal is to create a platform that could be replicated and presented in other communities as a turn-key solution
Q: Is automated deployment currently for LandingPage only via deploy-site workflow?
A: Yes, LandingPage only
Q: Should Infra-doc and Maintenance docs be treated as source-of-truth for production hosting?
A: Yes, but they will require constant updates to keep them relevant and useful
Q: Should the GA variant be the default public entrypoint in production?
A: unfortunately, another colaborator disregarded the naming scheme and added the smallsite.html unto index + added umami for tracking purposes
Q: Who approves content/text changes (name or role) before publishing?
A: technically anyone (small team) but most of the work has been done by me so far.
Q: How should future agents update ai-instructions.md: every code change or milestone summaries?
A: per code change in case of crashes

##########################
Q: What exact Project Name should appear in ai-instructions.md?
A: Arboles de la Antigua
Q: What 3 measurable success metrics should we track over the next 6-12 months?
A: Full site operation | at least 80% coverage of listed features | traffic engagement gains
Q: Do you want explicit phased roadmap dates in the file?
A: No dates, just phases
Q: Confirm Phase 1 scope: static FullSite pages + Google Calendar embed + no auth + manual content updates?
A: Yes, exactly
Q: Which first dynamic feature should be built after Phase 1?
A: Member accounts/auth
Q: Any concrete accessibility standards to enforce for elderly users?
A: WCAG 2.1 AA baseline


END OF Q&A

###################################
After I wrote somethings in the file I made you read and understand and these were your take aways:

Treat this file as the primary authority before implementation decisions.
Keep FullSite as the destination and LandingPage as the copy/paste-first reference source.
Keep all FullSite code strictly inside FullSite paths.
Maintain multilingual readiness through data-i18n unless explicitly exempted.
Preserve your tone requirements for user-facing content.
Keep current-vs-target architecture clearly separated in any recommendations.
Update required tracking sections during implementation:
Agent Working Memory (13)
Failure Modes Log (16)
Update Log/chronology sections when applicable
Keep analytics guidance aligned to Umami + GDPR.
Do not modify Section 11 unless you explicitly instruct it.

end of summary 


##############
Correction:

You’re right to call that out. I deviated from your instruction.

What happened:

I optimized for a fast local fix when Edge failed to render the icon, instead of first importing the known-good implementation from modal.js and related styles.
That was a judgment error on my side because your rule in ai-instructions.md Section 11 is explicit: copy/paste from LandingPage first, then adapt.
What I should have done:

Reused the existing Join Us modal/icon path from modal.js and main.css.
Only adjusted FullSite paths and selectors in app.js and styles.css.
If you want, I’ll correct this now by replacing the current FullSite Join Us implementation with the LandingPage implementation directly (copy-first, minimal adaptation), so it aligns exactly with your instruction protocol.

GPT-5.3-Codex • 5.3 credits
please do, after that migrate the rest of the files because you are not adhering to this policy. Please record this correction

End of Correction

#########################################################
