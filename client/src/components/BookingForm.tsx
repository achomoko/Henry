import { addDays, formatISO, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { createBooking, fetchAvailableSpots } from "../api";
import type { CreateBookingPayload } from "../api";
import type { Booking, CampingSpot, VehicleSize } from "../types";

const sizeLabels: Record<VehicleSize, string> = {
  small: "Small (up to 18 ft)",
  medium: "Medium (19-26 ft)",
  large: "Large (27+ ft)",
};

interface BookingFormProps {
  onBookingCreated: (booking: Booking) => void;
  allSpots: CampingSpot[];
}

const today = formatISO(new Date(), { representation: "date" });

export const BookingForm = ({
  onBookingCreated,
  allSpots,
}: BookingFormProps) => {
  const [guestName, setGuestName] = useState("");
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>("small");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(
    formatISO(addDays(parseISO(today), 2), { representation: "date" }),
  );
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [availableSpots, setAvailableSpots] = useState<CampingSpot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [selectedSpotId, setSelectedSpotId] = useState<string>("");

  const canCheckAvailability = useMemo(() => {
    if (!startDate || !endDate) return false;
    return parseISO(startDate) <= parseISO(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    if (!canCheckAvailability) {
      setAvailableSpots([]);
      setSelectedSpotId("");
      return;
    }

    let isActive = true;
    setLoadingAvailability(true);
    setAvailabilityError(null);

    fetchAvailableSpots(vehicleSize, startDate, endDate)
      .then((spots) => {
        if (!isActive) return;
        setAvailableSpots(spots);
        if (spots.length === 1) {
          setSelectedSpotId(spots[0].id);
        } else if (!spots.find((spot) => spot.id === selectedSpotId)) {
          setSelectedSpotId("");
        }
      })
      .catch((error) => {
        if (!isActive) return;
        setAvailabilityError(
          error instanceof Error ? error.message : "Failed to load availability",
        );
      })
      .finally(() => {
        if (isActive) {
          setLoadingAvailability(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [canCheckAvailability, endDate, selectedSpotId, startDate, vehicleSize]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!selectedSpotId) {
      setSubmitError("Please choose a camping spot.");
      return;
    }

    const payload: CreateBookingPayload = {
      spotId: selectedSpotId,
      guestName: guestName.trim(),
      vehicleSize,
      startDate,
      endDate,
      notes: notes.trim() || undefined,
    };

    if (!payload.guestName) {
      setSubmitError("Guest name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const booking = await createBooking(payload);
      setSuccessMessage("Reservation created successfully.");
      setGuestName("");
      setNotes("");
      onBookingCreated(booking);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to create reservation.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <header>
        <h2>Create a Reservation</h2>
        <p>
          Choose dates and vehicle size to see which spots can host the camper.
          {allSpots.length > 0
            ? ` (${allSpots.length} total spots on the grounds)`
            : ""}
        </p>
      </header>

      <div className="field-group">
        <label htmlFor="guestName">Guest Name</label>
        <input
          id="guestName"
          type="text"
          placeholder="Jane Doe"
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          required
        />
      </div>

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="vehicleSize">Vehicle Size</label>
          <select
            id="vehicleSize"
            value={vehicleSize}
            onChange={(event) =>
              setVehicleSize(event.target.value as VehicleSize)
            }
          >
            {Object.entries(sizeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="startDate">Arrival</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="endDate">Departure</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            min={startDate}
          />
        </div>
      </div>

      <div className="availability-panel">
        <div className="availability-header">
          <h3>Available Spots</h3>
          {loadingAvailability && <span className="tag">Checking…</span>}
        </div>
        {availabilityError && (
          <div className="message error">{availabilityError}</div>
        )}
        {!availabilityError && availableSpots.length === 0 && !loadingAvailability ? (
          <div className="message muted">
            {canCheckAvailability
              ? "No spots fit this vehicle for the selected dates."
              : "Select valid dates to check availability."}
          </div>
        ) : null}

        {availableSpots.length > 0 && (
          <div className="spot-options">
            {availableSpots.map((spot) => (
              <label key={spot.id} className="spot-option">
                <input
                  type="radio"
                  name="spot"
                  value={spot.id}
                  checked={selectedSpotId === spot.id}
                  onChange={(event) => setSelectedSpotId(event.target.value)}
                  disabled={submitting}
                />
                <div>
                  <strong>{spot.name}</strong>
                  <p>
                    Max vehicle: {spot.maxVehicleSize.toUpperCase()}
                    {spot.description ? ` · ${spot.description}` : ""}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="field-group">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Special requests, celebrations, etc."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      {submitError && <div className="message error">{submitError}</div>}
      {successMessage && <div className="message success">{successMessage}</div>}

      <button type="submit" disabled={submitting || !canCheckAvailability}>
        {submitting ? "Creating..." : "Create Reservation"}
      </button>
    </form>
  );
};

