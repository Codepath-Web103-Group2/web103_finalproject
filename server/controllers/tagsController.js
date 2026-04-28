import { query } from "../config/database.js";

export async function getTags(request, response) {
  const result = await query(
    `SELECT id, name, color FROM tags ORDER BY name ASC`
  );
  response.json(result.rows);
}

export async function createTag(request, response) {
  const name = request.body?.name?.trim().toLowerCase();
  const color = request.body?.color?.trim() || "#6366f1";

  if (!name) {
    response.status(400).json({ error: "Tag name is required." });
    return;
  }

  const existing = await query(`SELECT id, name, color FROM tags WHERE name = $1`, [name]);
  if (existing.rowCount > 0) {
    response.json(existing.rows[0]);
    return;
  }

  const result = await query(
    `INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING id, name, color`,
    [name, color]
  );
  response.status(201).json(result.rows[0]);
}

export async function deleteTag(request, response) {
  const tagId = Number(request.params.id);
  if (!Number.isInteger(tagId) || tagId <= 0) {
    response.status(400).json({ error: "Tag id must be a valid number." });
    return;
  }
  await query(`DELETE FROM tags WHERE id = $1`, [tagId]);
  response.status(204).send();
}
