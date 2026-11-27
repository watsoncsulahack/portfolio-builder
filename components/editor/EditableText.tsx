"use client";
import React, { useRef, useState, useCallback } from "react";

interface EditableTextProps {
  value: string;
  editMode: boolean;
  onCommit: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

/**
 * Renders text as a contenteditable span/div in edit mode.
 * Commits the change on blur. Shows a subtle ring when hovered/focused in edit mode.
 */
export function EditableText({
  value,
  editMode,
  onCommit,
  placeholder = "Click to edit",
  multiline = false,
  className = "",
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (ref.current) {
      const newValue = ref.current.innerText.trim();
      if (newValue !== value) {
        onCommit(newValue);
      }
    }
  }, [value, onCommit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
      }
    },
    [multiline]
  );

  if (!editMode) {
    return <span className={className}>{value || ""}</span>;
  }

  const Tag = multiline ? "div" : "span";

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLSpanElement>}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={[
        className,
        "outline-none rounded cursor-text",
        "hover:ring-2 hover:ring-blue-400/50",
        focused ? "ring-2 ring-blue-500 bg-blue-50/10" : "",
        !value ? "text-gray-400" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      dangerouslySetInnerHTML={{ __html: value || (!value && focused ? "" : `<span class="text-gray-400">${placeholder}</span>`) }}
    />
  );
}

interface EditableListProps<T> {
  items: T[];
  editMode: boolean;
  onCommit: (items: T[]) => void;
  /** Extract the editable string from an item */
  getText: (item: T) => string;
  /** Update an item with new text */
  setText: (item: T, text: string) => T;
  /** Render wrapper element (receives the editable text node as children) */
  renderWrapper: (children: React.ReactNode, index: number) => React.ReactNode;
  /** Create a blank new item */
  newItem: () => T;
}

/**
 * Renders a list of items where each item's text is directly editable.
 * In edit mode, shows Add and Remove controls.
 */
export function EditableList<T>({
  items,
  editMode,
  onCommit,
  getText,
  setText,
  renderWrapper,
  newItem,
}: EditableListProps<T>) {
  const handleChange = (index: number, newText: string) => {
    onCommit(items.map((item, i) => (i === index ? setText(item, newText) : item)));
  };

  const handleRemove = (index: number) => {
    onCommit(items.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onCommit([...items, newItem()]);
  };

  return (
    <>
      {items.map((item, i) =>
        editMode ? (
          <div key={i} className="group flex items-start gap-1">
            <div className="flex-1">
              {renderWrapper(
                <EditableText
                  value={getText(item)}
                  editMode={editMode}
                  onCommit={(v) => handleChange(i, v)}
                />,
                i
              )}
            </div>
            <button
              onClick={() => handleRemove(i)}
              className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 px-1 leading-none"
              title="Remove"
            >
              ×
            </button>
          </div>
        ) : (
          <React.Fragment key={i}>
            {renderWrapper(<span>{getText(item)}</span>, i)}
          </React.Fragment>
        )
      )}
      {editMode && (
        <button
          onClick={handleAdd}
          className="text-xs text-blue-500 hover:text-blue-700 mt-1 flex items-center gap-1"
        >
          + Add item
        </button>
      )}
    </>
  );
}
