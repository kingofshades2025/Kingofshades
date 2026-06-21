"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getBlockedDatesForMonth, getBookingCalendarSettings } from "@/app/actions/availability";
import { isClosedWeekday, toDateIso } from "@/lib/booking/availability";
import { DEFAULT_BOOKING_SETTINGS } from "@/lib/booking/defaults";
import type { BookingSettings } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function BookingCalendar({
  selectedIso,
  onSelect,
}: {
  selectedIso: string | null;
  onSelect: (iso: string) => void;
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [blocked, setBlocked] = useState<string[]>([]);
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>(DEFAULT_BOOKING_SETTINGS);

  useEffect(() => {
    getBlockedDatesForMonth(viewYear, viewMonth).then(setBlocked);
  }, [viewYear, viewMonth]);

  useEffect(() => {
    getBookingCalendarSettings().then(({ closedWeekdays, sundayClosed }) => {
      setBookingSettings((prev) => ({ ...prev, closedWeekdays, sundayClosed }));
    });
  }, []);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const todayIso = toDateIso(now.getFullYear(), now.getMonth(), now.getDate());

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function isClosedDay(day: number) {
    const date = new Date(viewYear, viewMonth, day);
    return isClosedWeekday(date, bookingSettings);
  }

  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-mist hover:text-gold"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-display text-sm font-semibold text-white">{monthLabel}</p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-mist hover:text-gold"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-mist">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="py-1 font-medium">
            {d}
          </span>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const iso = toDateIso(viewYear, viewMonth, day);
          const isPast = iso < todayIso;
          const isBlocked = blocked.includes(iso);
          const isClosed = isClosedDay(day);
          const isSelected = selectedIso === iso;
          const disabled = isPast || isBlocked || isClosed;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(iso)}
              className={cn(
                "aspect-square rounded-lg text-sm transition-colors",
                disabled && "cursor-not-allowed text-mist/30",
                !disabled && !isSelected && "text-snow hover:bg-gold/10 hover:text-gold",
                isSelected && "bg-gold font-semibold text-ink",
                iso === todayIso && !isSelected && "ring-1 ring-gold/40",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
