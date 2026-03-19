"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ChecklistGroup } from "@/components/checklist/checklist-group";
import { useTripChecklist, type ChecklistGroupData } from "@/hooks/use-trip-data";
import {
  ChecklistGroup as ChecklistGroupType,
  getDefaultChecklist,
} from "@/lib/data/checklist";
import { generateId } from "@/lib/utils/date";
import { useActiveTrip } from "@/hooks/use-trip";

export default function ChecklistPage() {
  const { activeTrip, loading: tripLoading } = useActiveTrip();
  const tripId = activeTrip?.id ?? "";
  const tripCountry = activeTrip?.country ?? undefined;

  const { data: dbGroups, loading: checklistLoading, save } = useTripChecklist(tripId);
  const [newItemText, setNewItemText] = useState("");

  const defaultChecklist = getDefaultChecklist(tripCountry);
  const groups: ChecklistGroupType[] = (dbGroups ?? defaultChecklist) as ChecklistGroupType[];

  if (tripLoading || checklistLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
  const checkedItems = groups.reduce(
    (sum, g) => sum + g.items.filter((i) => i.checked).length,
    0,
  );
  const progress = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  function handleToggle(groupId: string, itemId: string) {
    const updated = groups.map((group) =>
      group.id !== groupId
        ? group
        : {
            ...group,
            items: group.items.map((item) =>
              item.id !== itemId ? item : { ...item, checked: !item.checked },
            ),
          },
    );
    save(updated as ChecklistGroupData[]);
  }

  function handleAddCustomItem() {
    const text = newItemText.trim();
    if (!text) return;

    const customGroupId = "custom";
    const newItem = {
      id: generateId(),
      label: text,
      checked: false,
    };

    let updated: ChecklistGroupType[];
    const existingCustom = groups.find((g) => g.id === customGroupId);
    if (existingCustom) {
      updated = groups.map((g) =>
        g.id !== customGroupId
          ? g
          : { ...g, items: [...g.items, newItem] },
      );
    } else {
      updated = [
        ...groups,
        {
          id: customGroupId,
          title: "직접 추가",
          icon: "✏️",
          items: [newItem],
        },
      ];
    }

    save(updated as ChecklistGroupData[]);
    setNewItemText("");
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">준비물 체크리스트</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {checkedItems}/{totalItems} 완료
        </p>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-6 space-y-2">
        <Progress value={progress} className="h-3" />
        <p className="text-right text-xs text-muted-foreground">{progress}%</p>
      </div>

      {/* Groups */}
      <div className="px-4 space-y-2">
        {groups.map((group) => (
          <ChecklistGroup
            key={group.id}
            group={group}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Add custom item */}
      <div className="px-4 mt-6">
        <div className="flex gap-2">
          <Input
            placeholder="항목 직접 추가..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCustomItem();
            }}
          />
          <Button
            size="icon"
            onClick={handleAddCustomItem}
            disabled={!newItemText.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
