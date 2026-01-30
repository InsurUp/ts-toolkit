import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Header } from "@tanstack/react-table";
import { TableHead } from "@/components/ui/table";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableTableHeaderProps<TData> {
  header: Header<TData, unknown>;
  children: React.ReactNode;
  className?: string;
  onClick?: (event: unknown) => void;
}

export function DraggableTableHeader<TData>({
  header,
  children,
  className,
  onClick,
}: DraggableTableHeaderProps<TData>): React.ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.column.id,
  });

  // Calculate percentage width relative to total table size
  const totalSize = header.getContext().table.getTotalSize();
  const percentWidth = (header.getSize() / totalSize) * 100;

  // Dynamic styles that must be inline (transform/transition from DnD, calculated width)
  const dynamicStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    width: `${percentWidth}%`,
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={dynamicStyle}
      className={cn(
        "group relative select-none",
        isDragging ? "z-10 bg-muted opacity-80 shadow-lg" : "z-0 opacity-100",
        className
      )}
    >
      <div className="flex items-center">
        {/* Drag handle */}
        <button
          type="button"
          className="mr-1 cursor-grab touch-none opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Header content */}
        <div
          className={cn("flex flex-1 items-center overflow-hidden", onClick && "cursor-pointer")}
          onClick={onClick}
        >
          {children}
        </div>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        onDoubleClick={() => header.column.resetSize()}
        className={cn(
          "absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize select-none touch-none",
          "bg-border hover:bg-primary",
          header.column.getIsResizing() && "bg-primary w-1"
        )}
      />
    </TableHead>
  );
}
