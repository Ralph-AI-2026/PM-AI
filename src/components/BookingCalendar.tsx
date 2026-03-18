import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2, User } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { colors, fontStack } from './Shared';

interface Lane {
  id: string;
  name: string;
  type: string;
}

interface TimeSlot {
  time: string;
  slotStart: string;
  slotEnd: string;
  availableLanes: Lane[];
}

export default function BookingCalendar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCancelled = searchParams.get('booking') === 'cancelled';
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedLane, setSelectedLane] = useState<Lane | null>(null);
  const [isMember, setIsMember] = useState(true); // Toggle for demo purposes
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate]);

  const fetchAvailability = async (date: Date) => {
    setIsLoading(true);
    setError('');
    setSelectedSlot(null);
    setSelectedLane(null);
    try {
      const dateString = date.toISOString().split('T')[0];
      const res = await fetch(`/api/availability/club_123?date=${dateString}`);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      setAvailability(data.availability);
    } catch (err: any) {
      setError('Failed to load availability. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleBook = async () => {
    if (!selectedSlot || !selectedLane) return;
    
    setIsBooking(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_123',
          clubId: 'club_123',
          laneId: selectedLane.id,
          startTime: selectedSlot.slotStart,
          endTime: selectedSlot.slotEnd,
          isMember
        })
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      if (data.requiresPayment && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.success) {
        navigate('/member?booking=success');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking.');
      setIsBooking(false);
    }
  };

  return (
    <div style={{ fontFamily: fontStack, maxWidth: 900, margin: '0 auto' }}>
      {isCancelled && (
        <div style={{ background: `${colors.gold}15`, border: `1px solid ${colors.gold}40`, color: colors.gold, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <AlertCircle size={20} />
          <p style={{ margin: 0, fontWeight: 600 }}>Booking payment was cancelled. Your slot has not been reserved.</p>
        </div>
      )}

      {error && (
        <div style={{ background: `${colors.redAlert}15`, border: `1px solid ${colors.redAlert}40`, color: colors.redAlert, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <AlertCircle size={20} />
          <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
        </div>
      )}

      {/* Demo Toggle */}
      <div style={{ background: colors.sandLight, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${colors.sand}`, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: colors.earth }}>
          <User size={18} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Demo Mode: Simulate User Type</span>
        </div>
        <div style={{ display: 'flex', background: colors.cream, borderRadius: 8, padding: 4, border: `1px solid ${colors.sand}` }}>
          <button 
            onClick={() => setIsMember(true)}
            style={{
              padding: '6px 12px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: fontStack,
              background: isMember ? `${colors.forestMid}20` : 'transparent',
              color: isMember ? colors.forestDeep : colors.earth,
              transition: 'all 0.2s'
            }}
          >
            Active Member (Free)
          </button>
          <button 
            onClick={() => setIsMember(false)}
            style={{
              padding: '6px 12px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: fontStack,
              background: !isMember ? `${colors.gold}20` : 'transparent',
              color: !isMember ? colors.gold : colors.earth,
              transition: 'all 0.2s'
            }}
          >
            Non-Member ($25 Drop-in)
          </button>
        </div>
      </div>

      <div style={{ background: colors.cream, borderRadius: 16, border: `1px solid ${colors.sand}`, overflow: 'hidden', boxShadow: `0 4px 20px ${colors.neon}06` }}>
        {/* Header */}
        <div style={{ padding: 24, borderBottom: `1px solid ${colors.sand}`, background: colors.sandPale, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.forestDeep, margin: '0 0 4px' }}>Book a Lane</h2>
            <p style={{ fontSize: 14, color: colors.earth, margin: 0 }}>Select a date and time to practice.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: colors.cream, padding: '8px 16px', borderRadius: 12, border: `1px solid ${colors.sand}`, boxShadow: `0 2px 8px ${colors.neon}06` }}>
            <button onClick={handlePrevDay} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.earth, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 6 }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: colors.forestDeep, minWidth: 140, justifyContent: 'center' }}>
              <CalendarIcon size={18} color={colors.forestMid} />
              {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <button onClick={handleNextDay} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.earth, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 6 }}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* Time Slots */}
          <div style={{ flex: '1 1 300px', padding: 32, borderRight: `1px solid ${colors.sand}` }}>
            <h3 style={{ fontWeight: 600, color: colors.forestDeep, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
              <Clock size={18} /> Available Times
            </h3>
            
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, color: colors.slate }}>
                <Loader2 size={32} className="animate-spin" style={{ marginBottom: 16 }} />
                <p style={{ margin: 0, fontWeight: 500 }}>Loading availability...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
                {availability.map((slot) => {
                  const isSelected = selectedSlot?.slotStart === slot.slotStart;
                  const hasLanes = slot.availableLanes.length > 0;
                  
                  return (
                    <button
                      key={slot.slotStart}
                      disabled={!hasLanes}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setSelectedLane(null); // Reset lane selection when time changes
                      }}
                      style={{
                        padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600, fontFamily: fontStack, cursor: hasLanes ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        background: !hasLanes ? colors.sandLight : isSelected ? `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})` : colors.cream,
                        border: `1px solid ${!hasLanes ? colors.sand : isSelected ? colors.forestMid : colors.sand}`,
                        color: !hasLanes ? colors.slate : isSelected ? colors.cream : colors.forestDeep,
                        boxShadow: isSelected ? `0 4px 12px ${colors.neon}15` : 'none'
                      }}
                    >
                      {slot.time}
                      {!hasLanes && <span style={{ display: 'block', fontSize: 11, fontWeight: 500, marginTop: 4, opacity: 0.7 }}>Full</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lane Selection & Checkout */}
          <div style={{ flex: '1 1 300px', maxWidth: 400, background: colors.sandPale, padding: 32, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontWeight: 600, color: colors.forestDeep, marginBottom: 24, fontSize: 16 }}>Select Lane</h3>
            
            {!selectedSlot ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: colors.earth, fontSize: 14, padding: 24, border: `2px dashed ${colors.sand}`, borderRadius: 12 }}>
                Please select a time slot first to see available lanes.
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, flex: 1 }}>
                  {selectedSlot.availableLanes.map((lane) => {
                    const isSelected = selectedLane?.id === lane.id;
                    return (
                      <button
                        key={lane.id}
                        onClick={() => setSelectedLane(lane)}
                        style={{
                          width: '100%', textAlign: 'left', padding: 16, borderRadius: 12, border: `1px solid ${isSelected ? colors.forestMid : colors.sand}`,
                          background: isSelected ? `${colors.forestMid}05` : colors.cream,
                          cursor: 'pointer', transition: 'all 0.2s', fontFamily: fontStack,
                          boxShadow: isSelected ? `0 0 0 1px ${colors.forestMid}` : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 15 }}>{lane.name}</span>
                          {isSelected && <CheckCircle2 size={18} color={colors.forestMid} />}
                        </div>
                        <span style={{ fontSize: 13, color: colors.earth }}>{lane.type}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ paddingTop: 24, borderTop: `1px solid ${colors.sand}`, marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ color: colors.earth, fontWeight: 600 }}>Total</span>
                    <span style={{ fontSize: 24, fontWeight: 700, color: colors.forestDeep }}>
                      {isMember ? 'Free' : '$25.00'}
                    </span>
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={!selectedLane || isBooking}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 600, cursor: (!selectedLane || isBooking) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: fontStack,
                      background: (!selectedLane || isBooking) ? colors.sand : `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})`,
                      color: (!selectedLane || isBooking) ? colors.earth : colors.cream,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {isBooking ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : (
                      isMember ? 'Confirm Booking' : 'Proceed to Payment'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
