import {
  addDays,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import { useEffect, useMemo, useRef } from "react";
import type { Booking, CampingSpot } from "../types";

const CELL_WIDTH = 48;
const ROW_HEIGHT = 44;
const LABEL_WIDTH = 200;
const HEADER_HEIGHT = 48;

const vehicleColors: Record<string, string> = {
  small: "#2b9348",
  medium: "#227c9d",
  large: "#f25c54",
};

interface ScheduleCanvasProps {
  spots: CampingSpot[];
  bookings: Booking[];
  startDate: string;
  numberOfDays: number;
}

export const ScheduleCanvas = ({
  spots,
  bookings,
  startDate,
  numberOfDays,
}: ScheduleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const rangeEnd = useMemo(
    () => addDays(parseISO(startDate), Math.max(numberOfDays - 1, 0)),
    [startDate, numberOfDays],
  );

  const days = useMemo(() => {
    return Array.from({ length: numberOfDays }, (_, index) =>
      addDays(parseISO(startDate), index),
    );
  }, [startDate, numberOfDays]);

  const relevantBookings = useMemo(() => {
    const rangeStartDate = parseISO(startDate);
    return bookings.filter((booking) => {
      const bookingStart = parseISO(booking.startDate);
      const bookingEnd = parseISO(booking.endDate);
      return !(
        isBefore(bookingEnd, rangeStartDate) || isAfter(bookingStart, rangeEnd)
      );
    });
  }, [bookings, rangeEnd, startDate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const pixelRatio = window.devicePixelRatio || 1;
    const width = LABEL_WIDTH + numberOfDays * CELL_WIDTH + 1;
    const height = HEADER_HEIGHT + spots.length * ROW_HEIGHT + 1;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (context.resetTransform) {
      context.resetTransform();
    } else {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
    context.scale(pixelRatio, pixelRatio);

    // Background
    context.fillStyle = "#f8f9fb";
    context.fillRect(0, 0, width, height);

    // Header background
    context.fillStyle = "#1f2937";
    context.fillRect(0, 0, width, HEADER_HEIGHT);

    // Column headers
    context.fillStyle = "#ffffff";
    context.font = "600 12px 'Inter', system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    days.forEach((day, index) => {
      const x = LABEL_WIDTH + index * CELL_WIDTH;
      const dateLabel = format(day, "MMM d");
      context.fillText(dateLabel, x + CELL_WIDTH / 2, HEADER_HEIGHT / 2);
    });

    // Spot labels
    context.font = "500 13px 'Inter', system-ui, sans-serif";
    context.textAlign = "left";
    context.textBaseline = "middle";
    spots.forEach((spot, index) => {
      const y = HEADER_HEIGHT + index * ROW_HEIGHT;
      context.fillStyle = index % 2 === 0 ? "#ffffff" : "#f1f5f9";
      context.fillRect(0, y, width, ROW_HEIGHT);

      context.fillStyle = "#1f2937";
      context.fillText(spot.name, 12, y + ROW_HEIGHT / 2);

      context.fillStyle = "#64748b";
      context.font = "500 11px 'Inter', system-ui, sans-serif";
      context.fillText(
        `Max: ${spot.maxVehicleSize.toUpperCase()}`,
        12,
        y + ROW_HEIGHT / 2 + 16,
      );
      context.font = "500 13px 'Inter', system-ui, sans-serif";
    });

    // Vertical lines
    context.strokeStyle = "#cbd5f5";
    context.lineWidth = 1;
    for (let i = 0; i <= numberOfDays; i += 1) {
      const x = LABEL_WIDTH + i * CELL_WIDTH;
      context.beginPath();
      context.moveTo(x, HEADER_HEIGHT);
      context.lineTo(x, height);
      context.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= spots.length; i += 1) {
      const y = HEADER_HEIGHT + i * ROW_HEIGHT;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    const drawRoundedRect = (
      x: number,
      y: number,
      widthRect: number,
      heightRect: number,
      radius: number,
    ) => {
      const limitedRadius = Math.min(radius, widthRect / 2, heightRect / 2);
      context.beginPath();
      context.moveTo(x + limitedRadius, y);
      context.lineTo(x + widthRect - limitedRadius, y);
      context.quadraticCurveTo(
        x + widthRect,
        y,
        x + widthRect,
        y + limitedRadius,
      );
      context.lineTo(x + widthRect, y + heightRect - limitedRadius);
      context.quadraticCurveTo(
        x + widthRect,
        y + heightRect,
        x + widthRect - limitedRadius,
        y + heightRect,
      );
      context.lineTo(x + limitedRadius, y + heightRect);
      context.quadraticCurveTo(
        x,
        y + heightRect,
        x,
        y + heightRect - limitedRadius,
      );
      context.lineTo(x, y + limitedRadius);
      context.quadraticCurveTo(x, y, x + limitedRadius, y);
      context.closePath();
      context.fill();
    };

    // Booking blocks
    relevantBookings.forEach((booking) => {
      const spotIndex = spots.findIndex((spot) => spot.id === booking.spotId);
      if (spotIndex === -1) return;

      const bookingStart = parseISO(booking.startDate);
      const bookingEnd = parseISO(booking.endDate);
      const clampedStart = isBefore(bookingStart, parseISO(startDate))
        ? parseISO(startDate)
        : bookingStart;
      const clampedEnd = isAfter(bookingEnd, rangeEnd) ? rangeEnd : bookingEnd;

      const startOffset = differenceInCalendarDays(
        clampedStart,
        parseISO(startDate),
      );
      const span =
        differenceInCalendarDays(clampedEnd, clampedStart) + 1;

      const rectX = LABEL_WIDTH + startOffset * CELL_WIDTH + 4;
      const rectY = HEADER_HEIGHT + spotIndex * ROW_HEIGHT + 6;
      const rectWidth = Math.max(span * CELL_WIDTH - 8, 12);
      const rectHeight = ROW_HEIGHT - 12;

      const color = vehicleColors[booking.vehicleSize] ?? "#6366f1";
      context.fillStyle = color;
      drawRoundedRect(rectX, rectY, rectWidth, rectHeight, 8);

      context.fillStyle = "#ffffff";
      context.font = "600 12px 'Inter', system-ui, sans-serif";
      context.textAlign = "left";
      context.fillText(
        booking.guestName,
        rectX + 10,
        rectY + rectHeight / 2 + 4,
      );
    });
  }, [bookings, days, numberOfDays, rangeEnd, spots, startDate]);

  return (
    <div className="schedule-canvas-wrapper">
      <canvas ref={canvasRef} />
    </div>
  );
};

