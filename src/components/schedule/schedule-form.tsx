"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ScheduleItem, ScheduleCategory } from "@/types/schedule";
import { SCHEDULE_CATEGORY_CONFIG } from "@/types/schedule";
import { generateId } from "@/lib/utils/date";

const scheduleSchema = z.object({
  date: z.string().min(1, "날짜를 선택하세요"),
  startTime: z.string().min(1, "시작 시간을 입력하세요"),
  endTime: z.string().min(1, "종료 시간을 입력하세요"),
  title: z.string().min(1, "제목을 입력하세요").max(50),
  titleJa: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  category: z.enum([
    "sightseeing",
    "food",
    "shopping",
    "transport",
    "accommodation",
    "other",
  ] as const),
  transport: z.string().max(100).optional(),
  transportDuration: z.string().max(20).optional(),
  memo: z.string().max(500).optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
  initialData?: ScheduleItem;
  onSubmit: (data: ScheduleItem) => void;
  onCancel: () => void;
}

interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

const CATEGORY_OPTIONS = Object.entries(SCHEDULE_CATEGORY_CONFIG) as [
  ScheduleCategory,
  (typeof SCHEDULE_CATEGORY_CONFIG)[ScheduleCategory],
][];

export function ScheduleForm({ initialData, onSubmit, onCancel }: ScheduleFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      date: initialData?.date ?? "",
      startTime: initialData?.startTime ?? "",
      endTime: initialData?.endTime ?? "",
      title: initialData?.title ?? "",
      titleJa: initialData?.titleJa ?? "",
      location: initialData?.location ?? "",
      category: initialData?.category ?? "sightseeing",
      transport: initialData?.transport ?? "",
      transportDuration: initialData?.transportDuration ?? "",
      memo: initialData?.memo ?? "",
    },
  });

  const categoryValue = watch("category");

  function handleFormSubmit(values: ScheduleFormValues) {
    const now = new Date().toISOString();
    const result: ScheduleItem = {
      id: initialData?.id ?? generateId(),
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      title: values.title,
      titleJa: values.titleJa || undefined,
      location: values.location || undefined,
      category: values.category,
      transport: values.transport || undefined,
      transportDuration: values.transportDuration || undefined,
      memo: values.memo || undefined,
      createdAt: initialData?.createdAt ?? now,
      updatedAt: now,
    };
    onSubmit(result);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="date">날짜 *</Label>
          <Input
            id="date"
            type="date"
            className={cn(errors.date && "border-destructive")}
            {...register("date")}
          />
          <FieldError message={errors.date?.message} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startTime">시작 시간 *</Label>
            <Input
              id="startTime"
              type="time"
              className={cn(errors.startTime && "border-destructive")}
              {...register("startTime")}
            />
            <FieldError message={errors.startTime?.message} />
          </div>
          <div>
            <Label htmlFor="endTime">종료 시간 *</Label>
            <Input
              id="endTime"
              type="time"
              className={cn(errors.endTime && "border-destructive")}
              {...register("endTime")}
            />
            <FieldError message={errors.endTime?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="category">카테고리 *</Label>
          <Select
            value={categoryValue}
            onValueChange={(val) =>
              setValue("category", val as ScheduleCategory, { shouldValidate: true })
            }
          >
            <SelectTrigger className={cn(errors.category && "border-destructive")}>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.category?.message} />
        </div>

        <div>
          <Label htmlFor="title">제목 (한국어) *</Label>
          <Input
            id="title"
            placeholder="예: 도톤보리 관광"
            className={cn(errors.title && "border-destructive")}
            {...register("title")}
          />
          <FieldError message={errors.title?.message} />
        </div>

        <div>
          <Label htmlFor="titleJa">제목 (일본어)</Label>
          <Input
            id="titleJa"
            placeholder="예: 道頓堀観光"
            {...register("titleJa")}
          />
        </div>

        <div>
          <Label htmlFor="location">장소</Label>
          <Input
            id="location"
            placeholder="예: 도톤보리"
            {...register("location")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="transport">교통수단</Label>
            <Input
              id="transport"
              placeholder="예: 지하철 미도스지선"
              {...register("transport")}
            />
          </div>
          <div>
            <Label htmlFor="transportDuration">소요시간</Label>
            <Input
              id="transportDuration"
              placeholder="예: 20분"
              {...register("transportDuration")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="memo">메모</Label>
          <Textarea
            id="memo"
            placeholder="추가 메모를 입력하세요"
            rows={3}
            {...register("memo")}
          />
          <FieldError message={errors.memo?.message} />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {initialData ? "수정" : "추가"}
        </Button>
      </div>
    </form>
  );
}
