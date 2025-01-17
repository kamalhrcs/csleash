/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * The project's [collaboration mode](https://docs.getunleash.io/reference/project-collaboration-mode).
 */
export type ProjectSettingsSchemaMode =
    typeof ProjectSettingsSchemaMode[keyof typeof ProjectSettingsSchemaMode];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ProjectSettingsSchemaMode = {
    open: 'open',
    protected: 'protected',
    null: null,
} as const;
