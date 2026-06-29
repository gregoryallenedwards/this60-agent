# This60 Primer

This repository is managed using the `.this60` format. This format extracts actionable tasks out of freeform documents and isolates them into a machine-readable, app-renderable format, while leaving reference documentation intact.

## The 5 Buckets of Content Classification

When converting a repository to This60, observe the following rules:

1. **Pure todo list**: A file that is nothing but tasks.
   - Action: Convert every item into a `.this60/<list>.md` file.
   - Archive: YES. Move the original file to `.this60/_archive/`.

2. **Mixed file**: Todos embedded in prose or notes.
   - Action: Extract only the actionable lines into `.this60` tasks. Add a `src:` pointer on the extracted task pointing back to the original file.
   - Archive: NO. Leave the original file in place as reference.

3. **Reference / spec doc**: E.g., `DESIGN.md`, a build spec, a README.
   - Action: DO NOT turn into tasks. Leave in place. Link from related tasks via the `ref:` pointer.
   - Archive: NO.

4. **Asset folder**: A task's folder of subfolders, docs, or images.
   - Action: Leave untouched. Point the task at it via the `ref:` pointer. Never inline binaries into markdown.
   - Archive: NO.

5. **Sub-project**: A folder that is itself a self-contained project with its own todos.
   - Action: Create `folder/.this60/<list>.md`. Link from the parent task via the `portal:` pointer.
   - Archive: Archive its pure todo lists into `folder/.this60/_archive/`.

## Format Additions

When generating `.this60` tasks, you may include the following optional fields inside the HTML comment:

- `src:path/to/file.md#123` - Provenance: original file path + original id. This acts as an idempotency ledger to prevent duplicate migrations.
- `ref:path/to/docs/` - Pointer to a reference doc or asset folder a task depends on (buckets 3 and 4).

Example:
`- [ ] Wire up export panel  <!-- id:UUID priority:high category:ui src:TODO.md#42 ref:designs/export/ -->`
