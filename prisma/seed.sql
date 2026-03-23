-- System item types seed
-- Uses INSERT WHERE NOT EXISTS to be idempotent
INSERT INTO "ItemType" (id, name, icon, color, "isSystem", "userId")
SELECT id, name, icon, color, true, null
FROM (VALUES
  ('stype_snippet', 'Snippet', 'Code',       '#3b82f6'),
  ('stype_prompt',  'Prompt',  'Sparkles',   '#8b5cf6'),
  ('stype_command', 'Command', 'Terminal',   '#f97316'),
  ('stype_note',    'Note',    'StickyNote', '#fde047'),
  ('stype_file',    'File',    'File',       '#6b7280'),
  ('stype_image',   'Image',   'Image',      '#ec4899'),
  ('stype_link',    'Link',    'Link',       '#10b981')
) AS t(id, name, icon, color)
WHERE NOT EXISTS (SELECT 1 FROM "ItemType" WHERE "isSystem" = true);
