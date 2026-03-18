"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import type { FlightInfo } from "@/hooks/use-trip-config";
import { searchFlights, type FlightRoute } from "@/lib/data/flights";

interface FlightSectionProps {
  label: string;
  prefix: string;
  value: FlightInfo | undefined;
  onChange: (f: FlightInfo | undefined) => void;
}

export function FlightSection({ label, prefix, value, onChange }: FlightSectionProps) {
  const [open, setOpen] = useState(false);
  const [airline, setAirline] = useState(value?.airline ?? "");
  const [flightNumber, setFlightNumber] = useState(value?.flightNumber ?? "");
  const [departureAirport, setDepartureAirport] = useState(value?.departureAirport ?? "");
  const [arrivalAirport, setArrivalAirport] = useState(value?.arrivalAirport ?? "");
  const [date, setDate] = useState(value?.date ?? "");
  const [departureTime, setDepartureTime] = useState(value?.departureTime ?? "");
  const [arrivalTime, setArrivalTime] = useState(value?.arrivalTime ?? "");
  const [confirmationCode, setConfirmationCode] = useState(value?.confirmationCode ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(!value?.flightNumber);

  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return searchFlights(searchQuery).slice(0, 6);
  }, [searchQuery]);

  function buildFlightInfo(overrides: Partial<{
    airline: string; flightNumber: string; departureAirport: string;
    arrivalAirport: string; date: string; departureTime: string;
    arrivalTime: string; confirmationCode: string;
  }>): FlightInfo {
    const a = overrides.airline ?? airline;
    const fn = overrides.flightNumber ?? flightNumber;
    const dep = overrides.departureAirport ?? departureAirport;
    const arr = overrides.arrivalAirport ?? arrivalAirport;
    const d = overrides.date ?? date;
    const dt = overrides.departureTime ?? departureTime;
    const at = overrides.arrivalTime ?? arrivalTime;
    const code = overrides.confirmationCode ?? confirmationCode;
    return { airline: a, flightNumber: fn, departureAirport: dep, arrivalAirport: arr, date: d, departureTime: dt, arrivalTime: at, ...(code ? { confirmationCode: code } : {}) };
  }

  function handleSelectRoute(route: FlightRoute) {
    setAirline(route.airline);
    setFlightNumber(route.flightNumber);
    setDepartureAirport(route.departureAirport);
    setArrivalAirport(route.arrivalAirport);
    setDepartureTime(route.departureTime);
    setArrivalTime(route.arrivalTime);
    setSearchQuery("");
    setShowSearch(false);
    onChange(buildFlightInfo({
      airline: route.airline, flightNumber: route.flightNumber,
      departureAirport: route.departureAirport, arrivalAirport: route.arrivalAirport,
      departureTime: route.departureTime, arrivalTime: route.arrivalTime,
    }));
    toast.success(`${route.flightNumber} 자동 입력됨`);
  }

  function handleField<K extends "airline" | "flightNumber" | "departureAirport" | "arrivalAirport" | "date" | "departureTime" | "arrivalTime" | "confirmationCode">(field: K, val: string) {
    if (field === "airline") setAirline(val);
    else if (field === "flightNumber") setFlightNumber(val);
    else if (field === "departureAirport") setDepartureAirport(val);
    else if (field === "arrivalAirport") setArrivalAirport(val);
    else if (field === "date") setDate(val);
    else if (field === "departureTime") setDepartureTime(val);
    else if (field === "arrivalTime") setArrivalTime(val);
    else if (field === "confirmationCode") setConfirmationCode(val);
    onChange(buildFlightInfo({ [field]: val }));
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {value?.flightNumber && (
            <Badge variant="secondary" className="text-xs">
              {value.flightNumber} {value.departureAirport}→{value.arrivalAirport}
            </Badge>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 pt-2 pb-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">편명으로 검색</Label>
              {!showSearch && (
                <button type="button" onClick={() => setShowSearch(true)} className="text-xs text-primary hover:underline">
                  다시 검색
                </button>
              )}
            </div>
            {showSearch && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="편명 입력 (예: OZ111, KE723)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
                {suggestions.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {suggestions.map((route) => (
                      <button key={route.flightNumber} type="button" onClick={() => handleSelectRoute(route)} className="w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{route.flightNumber}</span>
                            <span className="text-xs text-muted-foreground">{route.airline}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{route.departureAirport} → {route.arrivalAirport} {route.departureTime}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && suggestions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-1">결과 없음. 직접 입력해주세요.</p>
                )}
              </>
            )}
          </div>
          <div className="border-t pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor={`${prefix}-airline`}>항공사</Label><Input id={`${prefix}-airline`} placeholder="아시아나항공" value={airline} onChange={(e) => handleField("airline", e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor={`${prefix}-fn`}>편명</Label><Input id={`${prefix}-fn`} placeholder="OZ123" value={flightNumber} onChange={(e) => handleField("flightNumber", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor={`${prefix}-dep`}>출발 공항</Label><Input id={`${prefix}-dep`} placeholder="ICN" value={departureAirport} onChange={(e) => handleField("departureAirport", e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor={`${prefix}-arr`}>도착 공항</Label><Input id={`${prefix}-arr`} placeholder="KIX" value={arrivalAirport} onChange={(e) => handleField("arrivalAirport", e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor={`${prefix}-date`}>날짜</Label><Input id={`${prefix}-date`} type="date" value={date} onChange={(e) => handleField("date", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor={`${prefix}-dt`}>출발 시각</Label><Input id={`${prefix}-dt`} type="time" value={departureTime} onChange={(e) => handleField("departureTime", e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor={`${prefix}-at`}>도착 시각</Label><Input id={`${prefix}-at`} type="time" value={arrivalTime} onChange={(e) => handleField("arrivalTime", e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor={`${prefix}-code`}>예약 번호 (선택)</Label><Input id={`${prefix}-code`} placeholder="ABC123" value={confirmationCode} onChange={(e) => handleField("confirmationCode", e.target.value)} /></div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
