"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import type { FlightInfo } from "@/hooks/use-trip-config";
import { toast } from "sonner";

interface FlightSectionProps {
  label: string;
  flight: FlightInfo | undefined;
  onSave: (flight: FlightInfo) => void;
}

function FlightSection({ label, flight, onSave }: FlightSectionProps) {
  const [open, setOpen] = useState(false);
  const [airline, setAirline] = useState(flight?.airline ?? "");
  const [flightNumber, setFlightNumber] = useState(flight?.flightNumber ?? "");
  const [departureAirport, setDepartureAirport] = useState(
    flight?.departureAirport ?? "",
  );
  const [arrivalAirport, setArrivalAirport] = useState(
    flight?.arrivalAirport ?? "",
  );
  const [date, setDate] = useState(flight?.date ?? "");
  const [departureTime, setDepartureTime] = useState(
    flight?.departureTime ?? "",
  );
  const [arrivalTime, setArrivalTime] = useState(flight?.arrivalTime ?? "");
  const [confirmationCode, setConfirmationCode] = useState(
    flight?.confirmationCode ?? "",
  );

  function handleSave() {
    if (!airline || !flightNumber || !departureAirport || !arrivalAirport) {
      toast.error("항공사, 편명, 출발/도착 공항을 입력해주세요");
      return;
    }
    onSave({
      airline,
      flightNumber,
      departureAirport,
      arrivalAirport,
      date,
      departureTime,
      arrivalTime,
      ...(confirmationCode ? { confirmationCode } : {}),
    });
    setOpen(false);
    toast.success(`${label} 항공편이 저장되었습니다`);
  }

  const hasFlight = flight && flight.flightNumber;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {hasFlight && (
            <Badge variant="secondary" className="text-xs">
              {flight.flightNumber} {flight.departureAirport}→
              {flight.arrivalAirport} {flight.departureTime}
            </Badge>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 pt-2 pb-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-airline`}>항공사</Label>
              <Input
                id={`${label}-airline`}
                placeholder="예: 아시아나"
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-flightNumber`}>편명</Label>
              <Input
                id={`${label}-flightNumber`}
                placeholder="예: OZ123"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-dep`}>출발 공항</Label>
              <Input
                id={`${label}-dep`}
                placeholder="예: ICN"
                value={departureAirport}
                onChange={(e) => setDepartureAirport(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-arr`}>도착 공항</Label>
              <Input
                id={`${label}-arr`}
                placeholder="예: KIX"
                value={arrivalAirport}
                onChange={(e) => setArrivalAirport(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${label}-date`}>날짜</Label>
            <Input
              id={`${label}-date`}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-depTime`}>출발 시각</Label>
              <Input
                id={`${label}-depTime`}
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-arrTime`}>도착 시각</Label>
              <Input
                id={`${label}-arrTime`}
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${label}-code`}>예약 번호 (선택)</Label>
            <Input
              id={`${label}-code`}
              placeholder="예: ABC123"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSave}>
            저장
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface FlightCardProps {
  outboundFlight: FlightInfo | undefined;
  returnFlight: FlightInfo | undefined;
  onSaveOutbound: (flight: FlightInfo) => void;
  onSaveReturn: (flight: FlightInfo) => void;
}

export function FlightCard({
  outboundFlight,
  returnFlight,
  onSaveOutbound,
  onSaveReturn,
}: FlightCardProps) {
  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Plane className="h-4 w-4 text-blue-500" />
          항공편 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <FlightSection
          label="가는 편"
          flight={outboundFlight}
          onSave={onSaveOutbound}
        />
        <div className="border-t" />
        <FlightSection
          label="오는 편"
          flight={returnFlight}
          onSave={onSaveReturn}
        />
      </CardContent>
    </Card>
  );
}
