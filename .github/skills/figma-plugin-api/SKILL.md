---
name: figma-plugin-api
description: Figma plugin, plugin API, createInstance, importStyle, importVariable, shared library, component set, text style, font, variable binding, setBoundVariable.
---

# Figma Plugin API Skill

This skill covers how to interact with Figma design files using the Figma Plugin API from within a
plugin context (i.e. code running inside Figma where the `figma` global object is available).

---

## ⚠️ MANDATORY PRE-FLIGHT — Read before writing any plugin code

Whenever a task requires loading a shared library style, component, or variable, follow this
exact sequence **before writing any plugin code**:

### Step 1 — Identify all required keys

List every style, component, and variable key the plugin will need.

### Step 2 — Any key missing from the lookup file → go to Section 4

Do **not** attempt to discover missing keys at runtime. Go directly to Section 4 and complete the
full lookup sequence before writing any code.

---

**Do not — ever — do any of these to discover keys:**

- Guess or hard-code keys.
- Call `figma.getLocalTextStyles()`, `figma.variables.getLocalVariablesAsync()`, or any
  similar local-document API — these return nothing unless the library is already embedded.
- Call `figma.root.findOne()`, `page.findAll()`, or any tree traversal to locate assets.
- Scan `node.boundVariables` on existing nodes in the working file.
  > ⚠️ `boundVariables` returns **VariableID** refs in the format
  > `VariableID:<libraryHash>/<localNumericId>` — these are **not** variable keys.
  > `importVariableByKeyAsync` requires the bare key string (`<libraryHash>` only, no prefix,
  > no `/<localNumericId>` suffix). Stripping the prefix will produce an invalid key and the
  > call will throw.
- Probe numeric ID suffixes (e.g. `1210:609`, `1210:610`) to find neighbouring tokens — the
  local numeric IDs are file-internal and change across library versions.
- Proceed to write or run plugin code until all required keys are confirmed.

**Always:**

1. Check `.github/skills/figma-plugin-api/assets` for already-known keys.
2. Any unknown key → go to **Section 4** and extract it from the library file.
3. Save newly extracted keys to the lookup file (see Section 4).
4. Only after all keys are confirmed → return here and write the plugin code.

---

## 1. Loading Font Styles from a Shared Library

> **Key required.** If you do not have the style key, complete **Section 4** before continuing.

Shared text styles are imported by their **style key** using `figma.importStyleByKeyAsync`.
The returned style object exposes an `.id` which can be assigned to a text node's `textStyleId`.

```javascript
// Import a named text style from a shared library by its key
const style = await figma.importStyleByKeyAsync("<STYLE_KEY>");

// Create the text node first, then immediately load the style's font.
const textNode = figma.createText();
await figma.loadFontAsync(style.fontName);

// Apply the style BEFORE setting characters — this switches the node's active
// font away from the default Inter Regular, so only style.fontName needs to be loaded.
textNode.textStyleId = style.id;
textNode.characters = "Hello World";
```

> **Why set `textStyleId` before `characters`?**
>
> The Figma Plugin API requires that **every font currently on the node is loaded before
> `text.characters` can be written**. `figma.createText()` sets the node font to
> **Inter Regular** by default. The order of operations matters:
>
> - ❌ Wrong order: `characters` → `textStyleId`
>   Figma checks the node's current font (Inter Regular) when `characters` is written —
>   throws unless Inter Regular is also loaded.
> - ✅ Correct order: `textStyleId` → `characters`
>   Setting `textStyleId` first switches the node font to the style's font. When
>   `characters` is then written, Figma checks the style's font — which is already loaded.
>
> Load the font **immediately after `createText()`**, before any other writes to the node.
>
> Reference: [Working with Text – Figma Plugin Docs](https://www.figma.com/plugin-docs/working-with-text/)

---

## 2. Creating Instances of Components from a Shared Library

> **Key required.** If you do not have the component or component set key, complete **Section 4** before continuing.

Shared components are imported by their **component set key** (for multi-variant components)
or **component key** (for single components).

### Multi-variant component (Component Set)

```javascript
// Import the component set (e.g. a Button with variants)
const componentSet = await figma.importComponentSetByKeyAsync(
  "<COMPONENT_SET_KEY>",
);

// Use the default variant
const instance = componentSet.defaultVariant.createInstance();

// Or iterate children to find a specific variant by name
const primaryVariant = componentSet.children.find(
  (c) => c.name.includes("type=primary") && c.name.includes("state=default"),
);
const instance = primaryVariant.createInstance();

// Position and add to the current page
instance.x = 100;
instance.y = 100;
figma.currentPage.appendChild(instance);
```

### Single component

```javascript
const component = await figma.importComponentByKeyAsync("<COMPONENT_KEY>");
const instance = component.createInstance();
figma.currentPage.appendChild(instance);
```

### Selecting the right variant

Component variant names are stored as comma-separated `property=value` pairs, e.g.
`"size=large, state=default, type=primary"`. Use `.find()` with `.includes()` checks or
match the full name string to target the right variant.

### Setting component properties with `setProperties` (booleans, text, instance swaps)

Use `instance.setProperties({})` to change exposed component properties after creation.

**Property key format:** `"<property name>#<nodeId>"` — inspect with
`Object.entries(instance.componentProperties)` to get the exact keys.

```javascript
// Boolean property (e.g. show/hide a slot)
instance.setProperties({ "show left icon#2444:340": true });

// Text property
instance.setProperties({ "label text#512:13": "My Label" });

// ⚠️ INSTANCE SWAP — pass the component's .id string, NOT the component object itself.
// Passing the object directly throws a validation error.
const iconComponent = await figma.importComponentByKeyAsync(
  "<ICON_COMPONENT_KEY>",
);
instance.setProperties({ "left icon#1093:0": iconComponent.id }); // ✅ correct
// instance.setProperties({ "left icon#1093:0": iconComponent }); // ❌ throws error

// Multiple properties can be set in one call
instance.setProperties({
  "show left icon#2444:340": true,
  "left icon#1093:0": iconComponent.id,
  "label text#512:13": "Import to Figma…",
});
```

---

## 3. Applying Variables from a Shared Library to a Layer

> **Key required.** If you do not have the variable key, complete **Section 4** before continuing.

Shared design variables (colors, spacing, radii, etc.) are imported by their **variable key**
using `figma.variables.importVariableByKeyAsync`. Once imported, they are bound to specific
node fields using `node.setBoundVariable(field, variable)`.

```javascript
// Import a variable (e.g. a background color token)
const bgVariable =
  await figma.variables.importVariableByKeyAsync("<VARIABLE_KEY>");

// Apply as a fill
// For fills/strokes, use setBoundVariable on a fill object with 'color'
const fills = JSON.parse(JSON.stringify(node.fills)); // clone fills array
fills[0] = figma.util.solidPaint("#ffffff"); // set a base solid fill first
node.fills = fills;
node.setBoundVariable("fills", bgVariable); // bind the variable to fills

// Apply to a numeric property (e.g. padding, corner radius)
const spacingVariable =
  await figma.variables.importVariableByKeyAsync("<SPACING_KEY>");
node.setBoundVariable("paddingLeft", spacingVariable);
node.setBoundVariable("paddingRight", spacingVariable);
node.setBoundVariable("paddingTop", spacingVariable);
node.setBoundVariable("paddingBottom", spacingVariable);

// Apply to corner radius
const radiusVariable =
  await figma.variables.importVariableByKeyAsync("<RADIUS_KEY>");
node.setBoundVariable("topLeftRadius", radiusVariable);
node.setBoundVariable("topRightRadius", radiusVariable);
node.setBoundVariable("bottomLeftRadius", radiusVariable);
node.setBoundVariable("bottomRightRadius", radiusVariable);
```

### Bindable fields reference

| Node type     | Field names available for `setBoundVariable`                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame / Group | `fills`, `strokes`, `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`, `itemSpacing`, `counterAxisSpacing`, `topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius` |
| Text          | `fills`, `strokes`                                                                                                                                                                                |
| Any node      | `opacity`, `width`, `height`                                                                                                                                                                      |

---

## 4. Key Lookup

> Only reach this section when a required key is **not** present in
> `.github/skills/figma-plugin-api/vds-spacing-keys.json`.

1. **STOP — user action required before proceeding.**

   Send the user **exactly this message** and wait for their explicit confirmation before
   doing anything else:

   > "Please open the library file in your browser.
   > Once it has fully loaded, reply **'ready'** and I will extract the keys."

   Do **not** attempt step 2 until the user has replied. Do **not** call `navigate_page`,
   `evaluate_script`, or any other tool while waiting — the browser context will not have
   a valid `figma` object until the user opens the file.

2. Extract the keys via the Plugin API

Call `evaluate_script` with the following script, matching the asset type you need:

**Text style keys:**

```javascript
async () => {
  const styles = figma.getLocalTextStyles();
  return JSON.stringify(
    styles.map((s) => ({ name: s.name, key: s.key })),
    null,
    2,
  );
};
```

**Component / component set keys:**

```javascript
async () => {
  const components = figma.currentPage.findAllWithCriteria({
    types: ["COMPONENT_SET", "COMPONENT"],
  });
  return JSON.stringify(
    components.map((c) => ({ name: c.name, key: c.key, type: c.type })),
    null,
    2,
  );
};
```

**Variable collection keys:**

```javascript
async () => {
  const collections = figma.variables.getLocalVariableCollections();
  return JSON.stringify(
    collections.map((c) => ({ name: c.name, key: c.key })),
    null,
    2,
  );
};
```

**Variable keys (per collection):**

```javascript
async () => {
  const variables = figma.variables.getLocalVariables();
  return JSON.stringify(
    variables.map((v) => ({
      name: v.name,
      key: v.key,
      resolvedType: v.resolvedType,
    })),
    null,
    2,
  );
};
```

3. **Save the extracted keys to the lookup file**

   Append any newly discovered keys to `.github/skills/figma-plugin-api/vds-spacing-keys.json`
   so they are available immediately in future sessions without repeating this process.

4. Switch back to the working file
   Call `navigate_page` with the working file URL to switch context back to the file where
   you want to run your plugin.

---

## 5. Additional Documentation

| Resource                       | URL                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------- |
| Plugin API – Global objects    | https://developers.figma.com/docs/plugins/api/global-objects/                   |
| Plugin API – Full reference    | https://www.figma.com/plugin-docs/                                              |
| `importStyleByKeyAsync`        | https://www.figma.com/plugin-docs/api/figma/#importstylebykeyasync              |
| `importComponentSetByKeyAsync` | https://www.figma.com/plugin-docs/api/figma/#importcomponentsetbykeyasync       |
| `importComponentByKeyAsync`    | https://www.figma.com/plugin-docs/api/figma/#importcomponentbykeyasync          |
| `importVariableByKeyAsync`     | https://www.figma.com/plugin-docs/api/figma-variables/#importvariablebykeyasync |
| `setBoundVariable`             | https://www.figma.com/plugin-docs/api/properties/nodes-setboundvariable/        |
| Variables overview             | https://www.figma.com/plugin-docs/working-with-variables/                       |
| Working with text              | https://www.figma.com/plugin-docs/working-with-text/                            |
