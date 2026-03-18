"use client";

import { useState, useRef, ChangeEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin, Camera, Image, X, Loader2, Calendar, Sparkles, ChevronDown, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useActiveTrip } from "@/hooks/use-trip";
import { useTripJournal, useTripSchedules, useTripExpenses } from "@/hooks/use-trip-data";
import { usePhotos } from "@/hooks/use-photos";
import { Mood, MOOD_CONFIG } from "@/types/journal";
import { formatDateKo } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { PhotoThumbnail } from "@/components/journal/photo-thumbnail";

const MOOD_KEYS = Object.keys(MOOD_CONFIG) as Mood[];
const EXPENSE_EMOJI: Record<string, string> = { food: "🍽", transport: "🚇", shopping: "🛍", accommodation: "🏨", activity: "🎡", other: "💳" };

interface PendingPhoto { readonly id: string; readonly previewUrl: string; }

function JournalWriteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // All hooks before any conditional returns
  const { activeTrip, loading: tripLoading } = useActiveTrip();
  const { items, create, update } = useTripJournal(activeTrip?.id ?? "");
  const { items: scheduleItems } = useTripSchedules(activeTrip?.id ?? "");
  const { items: expenseItems } = useTripExpenses(activeTrip?.id ?? "");
  const { upload } = usePhotos();

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState<Mood>("happy");
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [existingPhotoIds, setExistingPhotoIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [expensesOpen, setExpensesOpen] = useState(false);
  const [includeExpenses, setIncludeExpenses] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [polishedContent, setPolishedContent] = useState<string | null>(null);

  useEffect(() => {
    if (initialized) return;
    if (editId && items.length > 0) {
      const target = items.find((e) => e.id === editId);
      if (target) {
        setDate(target.date);
        setContent(target.content);
        setLocation(target.location ?? "");
        setMood((target.mood as Mood) ?? "neutral");
        if (target.photoIds) {
          try { const p = JSON.parse(target.photoIds); setExistingPhotoIds(Array.isArray(p) ? p : []); } catch { setExistingPhotoIds([]); }
        }
        setInitialized(true);
      }
    } else if (!editId) { setInitialized(true); }
  }, [editId, items, initialized]);

  const dayLocations = scheduleItems
    .filter((s) => s.date === date && s.location)
    .map((s) => s.location as string)
    .filter((loc, i, arr) => arr.indexOf(loc) === i);

  const dayExpenses = expenseItems.filter((e) => e.date === date);
  const dayExpenseTotal = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const dayCurrency = dayExpenses[0]?.currency ?? "JPY";

  function buildExpenseText() {
    return `\n\n💰 오늘의 지출\n${dayExpenses.map((e) => `${EXPENSE_EMOJI[e.category] ?? "💳"} ${e.description} ${formatCurrency(Number(e.amount), e.currency)}`).join("\n")}`;
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.map(async (f) => ({ id: (await upload(f)).id, previewUrl: URL.createObjectURL(f) })));
      setPendingPhotos((prev) => [...prev, ...results]);
    } finally { setUploading(false); e.target.value = ""; }
  }

  function removeNewPhoto(id: string) {
    setPendingPhotos((prev) => { const r = prev.find((p) => p.id === id); if (r) URL.revokeObjectURL(r.previewUrl); return prev.filter((p) => p.id !== id); });
  }

  async function handleSave() {
    if (!content.trim() || !activeTrip) return;
    setSaving(true);
    const payload = { date, content: content.trim(), location: location.trim() || null, mood, photoIds: JSON.stringify([...existingPhotoIds, ...pendingPhotos.map((p) => p.id)]) };
    try {
      if (editId) { await update(editId, payload); router.push(`/journal/${editId}`); }
      else { await create(payload); router.push("/journal"); }
      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    } finally { setSaving(false); }
  }

  function handleCancel() {
    pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    router.push(editId ? `/journal/${editId}` : "/journal");
  }

  async function handleAiPolish() {
    if (!content.trim()) return;
    setAiLoading(true);
    setPolishedContent(null);
    try {
      const expenseSummary = dayExpenses.length ? dayExpenses.map((e) => `${e.description} ${formatCurrency(Number(e.amount), e.currency)}`).join(", ") : undefined;
      const res = await fetch("/api/ai/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, location: location.trim() || undefined, mood: MOOD_CONFIG[mood]?.label, expenses: expenseSummary }) });
      const json = (await res.json()) as { polished?: string };
      if (json.polished) setPolishedContent(json.polished);
    } finally { setAiLoading(false); }
  }

  function handleIncludeExpenses(checked: boolean) {
    setIncludeExpenses(checked);
    const text = buildExpenseText();
    setContent((prev) => checked ? prev + text : prev.replace(text, ""));
  }

  const isBusy = uploading || saving;

  if (tripLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!activeTrip) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <p className="text-muted-foreground text-sm">활성화된 여행이 없어요.</p>
      <Button variant="outline" onClick={() => router.push("/settings")}>여행 설정하기</Button>
    </div>
  );

  return (
    <div className="min-h-screen pb-10">
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-lg font-semibold">{editId ? "일기 수정" : "일기 쓰기"}</h1>
        <Button size="sm" onClick={handleSave} disabled={!content.trim() || isBusy}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "저장"}
        </Button>
      </div>

      <div className="px-4 space-y-4">
        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">날짜</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-9" />
          </div>
          <p className="text-xs text-muted-foreground">{formatDateKo(date)}</p>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <Label>기분</Label>
          <div className="flex gap-2">
            {MOOD_KEYS.map((m) => (
              <button key={m} onClick={() => setMood(m)} className={cn("flex flex-col items-center gap-1 rounded-xl border p-2 flex-1 transition-colors", mood === m ? "border-primary bg-primary/10" : "border-border bg-transparent")}>
                <span className="text-xl">{MOOD_CONFIG[m].emoji}</span>
                <span className="text-xs text-muted-foreground">{MOOD_CONFIG[m].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location + schedule chips */}
        <div className="space-y-2">
          <Label htmlFor="location">장소</Label>
          {dayLocations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dayLocations.map((loc) => (
                <Badge key={loc} variant="secondary" className="cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setLocation(loc)}>
                  <MapPin className="h-3 w-3 mr-1" />{loc}
                </Badge>
              ))}
            </div>
          )}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="location" placeholder="방문한 장소를 입력하세요" value={location} onChange={(e) => setLocation(e.target.value)} className="pl-9" />
          </div>
        </div>

        {/* Content + AI */}
        <div className="space-y-2">
          <Label htmlFor="content">기록</Label>
          <Textarea id="content" placeholder="오늘 하루를 기록해보세요..." value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="resize-none" />
          <Button variant="outline" size="sm" onClick={handleAiPolish} disabled={!content.trim() || aiLoading} className="w-full">
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {aiLoading ? "다듬는 중..." : "✨ AI로 다듬기"}
          </Button>
          {polishedContent && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">✨ AI가 다듬은 버전</p>
              <p className="text-sm whitespace-pre-wrap">{polishedContent}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { setContent(polishedContent); setPolishedContent(null); }}>적용</Button>
                <Button size="sm" variant="outline" onClick={() => setPolishedContent(null)}>취소</Button>
              </div>
            </div>
          )}
        </div>

        {/* Expenses */}
        {dayExpenses.length > 0 && (
          <Collapsible open={expensesOpen} onOpenChange={setExpensesOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full rounded-lg border px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
              <span className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">💰 오늘의 지출</span>
                <span className="text-muted-foreground">({dayExpenses.length}건 / {formatCurrency(dayExpenseTotal, dayCurrency)})</span>
              </span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expensesOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="rounded-lg border border-t-0 rounded-t-none px-3 py-2 space-y-2">
                {dayExpenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span>{EXPENSE_EMOJI[e.category] ?? "💳"} {e.description}</span>
                    <span className="text-muted-foreground">{formatCurrency(Number(e.amount), e.currency)}</span>
                  </div>
                ))}
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input type="checkbox" checked={includeExpenses} onChange={(e) => handleIncludeExpenses(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  <span className="text-sm text-muted-foreground">일기에 포함</span>
                </label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Photos */}
        <div className="space-y-2">
          <Label>사진</Label>
          {existingPhotoIds.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {existingPhotoIds.map((id, i) => (
                <div key={id} className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  <PhotoThumbnail photoRef={id} alt={`기존 사진 ${i + 1}`} className="h-full w-full object-cover" />
                  <button onClick={(e) => { e.stopPropagation(); setExistingPhotoIds((prev) => prev.filter((p) => p !== id)); }} className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5" aria-label={`사진 ${i + 1} 삭제`}>
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Card className="border-dashed cursor-pointer" onClick={() => cameraRef.current?.click()}>
              <CardContent className="flex flex-col items-center justify-center py-4 gap-1">
                <Camera className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">카메라 촬영</p>
              </CardContent>
            </Card>
            <Card className="border-dashed cursor-pointer" onClick={() => galleryRef.current?.click()}>
              <CardContent className="flex flex-col items-center justify-center py-4 gap-1">
                <Image className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">갤러리</p>
              </CardContent>
            </Card>
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
          <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
          {uploading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />사진 업로드 중...</div>}
          {pendingPhotos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pendingPhotos.map((photo, i) => (
                <div key={photo.id} className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.previewUrl} alt={`새 사진 ${i + 1}`} className="h-full w-full object-cover" />
                  <button onClick={(e) => { e.stopPropagation(); removeNewPhoto(photo.id); }} className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5" aria-label={`사진 ${i + 1} 삭제`}>
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button variant="outline" className="w-full" onClick={handleCancel}>취소</Button>
      </div>
    </div>
  );
}

export default function JournalWritePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <JournalWriteForm />
    </Suspense>
  );
}
