import {
  addDays,
  format,
  formatISO,
  parseISO,
  startOfDay,
} from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { fetchBookings, fetchSpots } from "./api";
import type { Booking, CampingSpot } from "./types";
import { BookingForm } from "./components/BookingForm";
import { ScheduleCanvas } from "./components/ScheduleCanvas";

const today = formatISO(startOfDay(new Date()), { representation: "date" });

const vehicleLegend = [
  { label: "Small vehicles", color: "#2b9348" },
  { label: "Medium vehicles", color: "#227c9d" },
  { label: "Large vehicles", color: "#f25c54" },
];

function App() {
  const [spots, setSpots] = useState<CampingSpot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [spotsLoading, setSpotsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [spotsError, setSpotsError] = useState<string | null>(null);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(today);
  const [dayCount, setDayCount] = useState(21);

  const endDate = useMemo(
    () =>
      formatISO(addDays(parseISO(startDate), Math.max(dayCount - 1, 0)), {
        representation: "date",
      }),
    [dayCount, startDate],
  );

  const loadSpots = useCallback(async () => {
    setSpotsLoading(true);
    setSpotsError(null);
    try {
      const data = await fetchSpots();
      setSpots(data);
    } catch (error) {
      setSpotsError(
        error instanceof Error ? error.message : "Unable to load campsite spots.",
      );
    } finally {
      setSpotsLoading(false);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const data = await fetchBookings({
        startDate,
        endDate,
      });
      setBookings(data);
    } catch (error) {
      setBookingsError(
        error instanceof Error
          ? error.message
          : "Unable to load bookings for the selected range.",
      );
    } finally {
      setBookingsLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    loadSpots();
  }, [loadSpots]);

  useEffect(() => {
    if (spots.length > 0) {
      loadBookings();
    }
  }, [loadBookings, spots.length]);

  const handleBookingCreated = useCallback(
    (_booking: Booking) => {
      loadBookings();
    },
    [loadBookings],
  );

  const formattedRangeLabel = useMemo(() => {
    const startLabel = format(parseISO(startDate), "MMM d, yyyy");
    const endLabel = format(parseISO(endDate), "MMM d, yyyy");
    return `${startLabel} → ${endLabel}`;
  }, [endDate, startDate]);

  const handleDayCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    const clamped = Math.min(Math.max(value, 7), 90);
    setDayCount(clamped);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Cedar Springs Campsite Scheduler</h1>
          <p>
            Manage reservations with vehicle-size filtering and a canvas view of
            every camping spot by day.
          </p>
        </div>
        <button
          className="ghost-button"
          type="button"
          onClick={() => {
            loadSpots();
            loadBookings();
          }}
          disabled={spotsLoading || bookingsLoading}
        >
          Refresh Data
        </button>
      </header>

      <section className="dashboard">
        <div className="left-column">
          <div className="panel">
            <h2>Calendar Range</h2>
            <div className="field-group">
              <label htmlFor="calendarStart">Start Date</label>
              <input
                id="calendarStart"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="field-group">
              <label htmlFor="dayCount">
                Days Shown <span className="hint">(7-90)</span>
              </label>
              <input
                id="dayCount"
                type="number"
                min={7}
                max={90}
                value={dayCount}
                onChange={handleDayCountChange}
              />
            </div>
            <div className="summary">
              <strong>{formattedRangeLabel}</strong>
              <span>{spots.length} spots tracked</span>
            </div>
            <div className="legend">
              {vehicleLegend.map((entry) => (
                <span key={entry.label}>
                  <i style={{ backgroundColor: entry.color }} />
                  {entry.label}
                </span>
              ))}
            </div>
          </div>

          <div className="panel">
            <BookingForm
              onBookingCreated={handleBookingCreated}
              allSpots={spots}
            />
          </div>
        </div>

        <div className="right-column">
          <div className="panel schedule-panel">
            <header className="panel-header">
              <div>
                <h2>Owner&apos;s Canvas View</h2>
                <p>
                  Each row is a camping spot; each column represents a day in
                  the selected range.
                </p>
              </div>
              {bookingsLoading && <span className="tag">Loading bookings…</span>}
            </header>

            {spotsError && (
              <div className="message error">
                {spotsError} Try refreshing data.
              </div>
            )}

            {bookingsError && (
              <div className="message error">
                {bookingsError} Try refreshing data.
              </div>
            )}

            {!spotsLoading && spots.length === 0 && (
              <div className="message muted">
                No camping spots configured yet.
              </div>
            )}

            {spots.length > 0 && (
              <div className="canvas-container">
                <ScheduleCanvas
                  spots={spots}
                  bookings={bookings}
                  startDate={startDate}
                  numberOfDays={dayCount}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
