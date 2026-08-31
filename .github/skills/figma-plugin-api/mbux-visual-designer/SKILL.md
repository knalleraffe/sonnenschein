## Design Rules

- Always use an 8px spacing system for margins, padding, and gaps between elements. The smallest spacing is 4px for tight grouping.
- Always use the defined font styles for headings, body text or labels. Do not create custom font sizes or weights.
- Never create the MB-star logo from scratch or use a placeholder. Always use the official SVG asset from the design system library to ensure brand consistency.
- Always use auto layout features in Figma to create flexible, responsive components that can adapt to different content lengths and screen sizes without manual adjustments. Never hard-code dimensions that could break when content changes. Always use the spacing variables provided by the design system for consistent gaps and padding.
- Always use the components, variables and font styles defined in the MBUX global component library. Never create new components or styles without first checking if an existing one can be used or adapted. This ensures visual consistency and reduces maintenance overhead.

**CRITICAL** Always read the json file in /assets before generating anything. Make sure there is no existing component before creating a new one.
