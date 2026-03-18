"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChecklistGroup as ChecklistGroupType } from "@/lib/data/checklist";
import { cn } from "@/lib/utils";

interface ChecklistGroupProps {
  readonly group: ChecklistGroupType;
  readonly onToggle: (groupId: string, itemId: string) => void;
}

export function ChecklistGroup({ group, onToggle }: ChecklistGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  const checkedCount = group.items.filter((item) => item.checked).length;
  const total = group.items.length;
  const allDone = checkedCount === total;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-left hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-lg">{group.icon}</span>
          <span
            className={cn(
              "font-medium text-sm",
              allDone && "line-through text-muted-foreground",
            )}
          >
            {group.title}
          </span>
          <span className="text-xs text-muted-foreground">
            {checkedCount}/{total}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-1 rounded-lg border bg-card divide-y">
          {group.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <Checkbox
                id={`${group.id}-${item.id}`}
                checked={item.checked}
                onCheckedChange={() => onToggle(group.id, item.id)}
              />
              <Label
                htmlFor={`${group.id}-${item.id}`}
                className={cn(
                  "text-sm cursor-pointer flex-1",
                  item.checked && "line-through text-muted-foreground",
                )}
              >
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
