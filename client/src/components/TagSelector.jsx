import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const TAG_COLORS = [
  "#6366f1",
  "#f97316",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
];

function TagSelector({ token, selectedTagIds, onChange }) {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/tags`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTags(data);
        }
      } catch {
        // ignore
      }
    };
    fetchTags();
  }, [token]);

  const handleToggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleDeleteTag = async (e, tagId) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_BASE}/api/tags/${tagId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setTags((prev) => prev.filter((t) => t.id !== tagId));
        onChange(selectedTagIds.filter((id) => id !== tagId));
      }
    } catch {
      // ignore
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    setIsAdding(true);
    try {
      const response = await fetch(`${API_BASE}/api/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
      });
      if (response.ok) {
        const tag = await response.json();
        setTags((prev) => {
          if (prev.find((t) => t.id === tag.id)) return prev;
          return [...prev, tag].sort((a, b) => a.name.localeCompare(b.name));
        });
        onChange([...selectedTagIds, tag.id]);
        setNewTagName("");
      }
    } catch {
      // ignore
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="tag-selector">
      <p className="tag-selector-label">Tags</p>

      {/* Existing tags */}
      <div className="tag-list">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <span
              key={tag.id}
              className={`tag-badge ${isSelected ? "tag-selected" : ""}`}
              style={{
                backgroundColor: isSelected ? tag.color : "transparent",
                borderColor: tag.color,
                color: isSelected ? "#fff" : tag.color,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  padding: "0",
                  font: "inherit",
                }}
                onClick={() => handleToggleTag(tag.id)}
              >
                {tag.name}
              </button>
              <button
                type="button"
                aria-label={`Delete tag ${tag.name}`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  padding: "0 2px",
                  fontSize: "12px",
                  lineHeight: 1,
                  opacity: 0.7,
                }}
                onClick={(e) => handleDeleteTag(e, tag.id)}
              >
                ✕
              </button>
            </span>
          );
        })}
      </div>

      {/* Add new tag — div instead of form to avoid nested <form> */}
      <div className="tag-add-form">
        <input
          type="text"
          placeholder="New tag name..."
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={50}
        />
        <div className="tag-color-picker">
          {TAG_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`tag-color-swatch ${newTagColor === color ? "selected" : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => setNewTagColor(color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="secondary-button"
          disabled={isAdding || !newTagName.trim()}
          onClick={handleAddTag}
        >
          {isAdding ? "Adding..." : "+ Add Tag"}
        </button>
      </div>
    </div>
  );
}

export default TagSelector;
