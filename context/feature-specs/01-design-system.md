Read AGENTS.md before starting.

Unit: Design System Foundation

Tasks

1. Install and configure shadcn/ui.
2. Install lucide-react.
3. Install every dependency required by the selected shadcn components.
4. Generate the following shadcn components:

- Button
- Card
- Dialog
- Input
- Label
- Tabs
- Textarea
- Scroll Area
- Sheet
- Dropdown Menu
- Avatar
- Badge
- Separator
- Skeleton
- Tooltip
- Sonner (toast)

5. Create lib/utils.ts with the standard cn() helper.
6. Configure the components to use the design tokens defined in ui-context.md.
7. Ensure both light and dark themes are supported.
8. Do not modify generated components in components/ui/.
9. If customization is required, wrap or compose components outside components/ui/.


Acceptance Criteria
- All components imprt wihhout erros.
- `cn()` works properly
- All components compile successfully.
- No TypeScript errors.
- No Tailwind errors.
- Light mode and dark mode both work. 
- All generated components import successfully.