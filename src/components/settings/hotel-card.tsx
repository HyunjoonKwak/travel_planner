"use client";

import { useState } from "react";
import { Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HotelInfo } from "@/hooks/use-trip-config";
import { toast } from "sonner";

interface HotelCardProps {
  hotel: HotelInfo | undefined;
  onSave: (hotel: HotelInfo) => void;
}

export function HotelCard({ hotel, onSave }: HotelCardProps) {
  const [name, setName] = useState(hotel?.name ?? "");
  const [nameJa, setNameJa] = useState(hotel?.nameJa ?? "");
  const [address, setAddress] = useState(hotel?.address ?? "");
  const [checkIn, setCheckIn] = useState(hotel?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(hotel?.checkOut ?? "");
  const [confirmationCode, setConfirmationCode] = useState(
    hotel?.confirmationCode ?? "",
  );
  const [phone, setPhone] = useState(hotel?.phone ?? "");

  function handleSave() {
    if (!name || !address) {
      toast.error("호텔명과 주소를 입력해주세요");
      return;
    }
    onSave({
      name,
      ...(nameJa ? { nameJa } : {}),
      address,
      checkIn,
      checkOut,
      ...(confirmationCode ? { confirmationCode } : {}),
      ...(phone ? { phone } : {}),
    });
    toast.success("호텔 정보가 저장되었습니다");
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Hotel className="h-4 w-4 text-amber-500" />
          숙박 정보
          {hotel?.name && (
            <Badge variant="secondary" className="ml-auto text-xs font-normal">
              {hotel.name}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hotel?.name && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 space-y-1">
            <p className="text-xs text-muted-foreground">저장된 숙소</p>
            <p className="font-semibold text-sm">{hotel.name}</p>
            {hotel.nameJa && (
              <p className="text-xs text-muted-foreground">{hotel.nameJa}</p>
            )}
            <p className="text-xs text-muted-foreground">{hotel.address}</p>
            {(hotel.checkIn || hotel.checkOut) && (
              <p className="text-xs">
                체크인 {hotel.checkIn} / 체크아웃 {hotel.checkOut}
              </p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="hotel-name">호텔명</Label>
            <Input
              id="hotel-name"
              placeholder="예: 도톤보리 호텔"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hotel-name-ja">일본어 이름 (선택)</Label>
            <Input
              id="hotel-name-ja"
              placeholder="예: ドーミーイン"
              value={nameJa}
              onChange={(e) => setNameJa(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hotel-address">주소</Label>
          <Input
            id="hotel-address"
            placeholder="예: 大阪市中央区..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="hotel-checkin">체크인</Label>
            <Input
              id="hotel-checkin"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hotel-checkout">체크아웃</Label>
            <Input
              id="hotel-checkout"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="hotel-code">예약 번호 (선택)</Label>
            <Input
              id="hotel-code"
              placeholder="예: HT-12345"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hotel-phone">전화번호 (선택)</Label>
            <Input
              id="hotel-phone"
              placeholder="예: 06-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <Button className="w-full" onClick={handleSave}>
          저장
        </Button>
      </CardContent>
    </Card>
  );
}
