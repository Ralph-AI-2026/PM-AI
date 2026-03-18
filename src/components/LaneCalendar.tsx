import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { colors, fontStack } from './Shared';

export default function LaneCalendar({ isAdmin = false }: { isAdmin?: boolean }) {
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  
  // Mock data for lanes and bookings
  const lanes = [
    { id: '1', name: 'Lane 1 (20yd)' },
    { id: '2', name: 'Lane 2 (20yd)' },
    { id: '3', name: 'Lane 3 (20yd)' },
    { id: '4', name: 'Lane 4 (20yd)' },
    { id: '5', name: 'Lane 5 (20yd)' },
    { id: '6', name: 'Lane 6 (20yd)' },
  ];

  const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM

  // Mock bookings
  const bookings = [
    { id: 'b1', laneId: '2', hour: 10, duration: 2, type: 'member', name: 'John Doe' },
    { id: 'b2', laneId: '4', hour: 14, duration: 1, type: 'class', name: 'Beginner Class' },
    { id: 'b3', laneId: '1', hour: 17, duration: 2, type: 'maintenance', name: 'Maintenance' },
  ];

  const getBookingForSlot = (laneId: string, hour: number) => {
    return bookings.find(b => b.laneId === laneId && hour >= b.hour && hour < b.hour + b.duration);
  };

  const handleSlotClick = (laneId: string, hour: number) => {
    if (isAdmin) {
      alert(`Admin: Manage slot for Lane ${laneId} at ${hour}:00`);
    } else {
      alert(`Member: Book Lane ${laneId} at ${hour}:00`);
    }
  };

  return (
    <div style={{ background: colors.cream, borderRadius: 16, border: `1px solid ${colors.sand}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 800, fontFamily: fontStack, boxShadow: `0 4px 20px ${colors.neon}06` }}>
      {/* Calendar Header */}
      <div style={{ padding: 24, borderBottom: `1px solid ${colors.sand}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: colors.sandPale, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, background: `${colors.forestMid}15`, color: colors.forestMid, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.forestDeep, margin: '0 0 4px' }}>Lane Availability</h2>
            <p style={{ fontSize: 14, color: colors.earth, margin: 0 }}>Select a time slot to book</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: colors.cream, border: `1px solid ${colors.sand}`, borderRadius: 12, padding: 4, boxShadow: `0 2px 8px ${colors.neon}06` }}>
            <button 
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: colors.earth, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = colors.sandLight}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ChevronLeft size={20} />
            </button>
            <div style={{ padding: '0 16px', fontWeight: 600, color: colors.forestDeep, minWidth: 140, textAlign: 'center', fontSize: 14 }}>
              {format(selectedDate, 'EEEE, MMM d')}
            </div>
            <button 
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: colors.earth, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = colors.sandLight}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {isAdmin && (
            <button style={{
              padding: '10px 20px', background: colors.forestDeep, color: colors.cream, borderRadius: 10, fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: fontStack
            }}>
              Block Lanes
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ minWidth: 800 }}>
          {/* Lanes Header */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${colors.sand}`, position: 'sticky', top: 0, background: colors.cream, zIndex: 10 }}>
            <div style={{ width: 96, flexShrink: 0, borderRight: `1px solid ${colors.sand}`, background: colors.sandPale, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color={colors.slate} />
            </div>
            {lanes.map(lane => (
              <div key={lane.id} style={{ flex: 1, padding: 16, textAlign: 'center', fontWeight: 600, color: colors.forestDeep, borderRight: `1px solid ${colors.sand}`, fontSize: 14 }}>
                {lane.name}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {hours.map((hour, i) => (
              <div key={hour} style={{ display: 'flex', height: 80, borderBottom: i < hours.length - 1 ? `1px solid ${colors.sand}` : 'none' }}>
                {/* Time Label */}
                <div style={{ width: 96, flexShrink: 0, borderRight: `1px solid ${colors.sand}`, background: colors.sandPale, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: colors.earth }}>
                  {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 ${hour === 12 ? 'PM' : 'AM'}`}
                </div>
                
                {/* Lane Slots */}
                {lanes.map((lane, j) => {
                  const booking = getBookingForSlot(lane.id, hour);
                  const isStart = booking && booking.hour === hour;
                  
                  return (
                    <div 
                      key={`${lane.id}-${hour}`} 
                      style={{ flex: 1, borderRight: j < lanes.length - 1 ? `1px solid ${colors.sand}` : 'none', padding: 4, position: 'relative', cursor: booking ? 'default' : 'pointer' }}
                      onClick={() => !booking && handleSlotClick(lane.id, hour)}
                      onMouseEnter={e => { if (!booking) e.currentTarget.style.background = colors.sandLight; }}
                      onMouseLeave={e => { if (!booking) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {booking ? (
                        isStart && (
                          <div 
                            style={{
                              position: 'absolute', top: 4, left: 4, right: 4, borderRadius: 8, padding: 8, fontSize: 13, zIndex: 10, overflow: 'hidden', boxShadow: `0 2px 8px ${colors.neon}06`,
                              background: booking.type === 'maintenance' ? colors.border : booking.type === 'class' ? `${colors.amber}15` : `${colors.neon}15`,
                              color: booking.type === 'maintenance' ? colors.charcoal : booking.type === 'class' ? colors.amber : colors.forestDeep,
                              border: `1px solid ${booking.type === 'maintenance' ? colors.textMuted : booking.type === 'class' ? `${colors.amber}40` : `${colors.neon}40`}`,
                              height: `calc(${booking.duration * 100}% - 8px)`
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isAdmin) alert(`Manage booking: ${booking.name}`);
                            }}
                          >
                            <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{booking.name}</div>
                            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                              {booking.duration} hr{booking.duration > 1 ? 's' : ''}
                            </div>
                          </div>
                        )
                      ) : (
                        <div style={{ width: '100%', height: '100%', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                        >
                          <span style={{ color: colors.forestMid, fontWeight: 600, fontSize: 13 }}>+ Book</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
