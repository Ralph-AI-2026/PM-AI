import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TopBar, StatCard, colors, fontStack } from '../components/Shared';

interface Event {
  id: string;
  name: string;
  date: string;
  maxCapacity: number;
  price: number;
  soldTickets: number;
}

export default function ClubAdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', date: '', maxCapacity: 50, price: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events/club_123');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEvents(data.events);
    } catch (err: any) {
      setError('Failed to load events.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: 'club_123',
          ...newEvent
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Reset form and refresh
      setIsCreating(false);
      setNewEvent({ name: '', date: '', maxCapacity: 50, price: 0 });
      fetchEvents();
    } catch (err: any) {
      setError(err.message || 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: fontStack }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <TopBar title="Event Management" subtitle="Create and manage tournaments and 3D shoots." />
        <button 
          onClick={() => setIsCreating(!isCreating)}
          style={{
            padding: "10px 20px", borderRadius: 8, border: "none", fontSize: 14,
            background: isCreating ? colors.sand : `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})`,
            color: isCreating ? colors.earth : colors.cream, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, fontFamily: fontStack
          }}
        >
          <Plus size={18} />
          {isCreating ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {error && (
        <div style={{ background: `${colors.redAlert}15`, border: `1px solid ${colors.redAlert}40`, color: colors.redAlert, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <AlertCircle size={20} />
          <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
        </div>
      )}

      {isCreating && (
        <div style={{ background: colors.cream, padding: 24, borderRadius: 14, border: `1px solid ${colors.sand}`, marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.forestDeep, margin: '0 0 20px' }}>Create New Event</h3>
          <form onSubmit={handleCreateEvent} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 14 }}>Event Name</label>
              <input 
                type="text" 
                required
                value={newEvent.name}
                onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.sand}`, borderRadius: 10, fontSize: 14, fontFamily: fontStack, background: colors.sandLight, outline: 'none' }}
                placeholder="e.g., Summer 3D Shoot"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 14 }}>Date & Time</label>
              <input 
                type="datetime-local" 
                required
                value={newEvent.date}
                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.sand}`, borderRadius: 10, fontSize: 14, fontFamily: fontStack, background: colors.sandLight, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 14 }}>Max Capacity</label>
              <input 
                type="number" 
                required
                min="1"
                value={newEvent.maxCapacity}
                onChange={e => setNewEvent({...newEvent, maxCapacity: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.sand}`, borderRadius: 10, fontSize: 14, fontFamily: fontStack, background: colors.sandLight, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 14 }}>Price (CAD)</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                value={newEvent.price}
                onChange={e => setNewEvent({...newEvent, price: parseFloat(e.target.value)})}
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.sand}`, borderRadius: 10, fontSize: 14, fontFamily: fontStack, background: colors.sandLight, outline: 'none' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  padding: "12px 24px", borderRadius: 10, border: "none", fontSize: 14,
                  background: isSubmitting ? colors.sand : `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})`,
                  color: isSubmitting ? colors.earth : colors.cream, fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8, fontFamily: fontStack
                }}
              >
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: colors.cream, borderRadius: 14, border: `1px solid ${colors.sand}`, overflow: 'hidden' }}>
        <div style={{ padding: 24, borderBottom: `1px solid ${colors.sand}`, background: colors.sandPale }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.forestDeep, margin: 0 }}>Upcoming Events</h3>
        </div>
        
        {isLoading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center', color: colors.slate }}>
            <Loader2 size={32} className="animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: colors.earth }}>
            No events scheduled.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {events.map((event, i) => {
              const dateObj = new Date(event.date);
              const isSoldOut = event.soldTickets >= event.maxCapacity;
              const revenue = event.soldTickets * event.price;
              
              return (
                <div key={event.id} style={{ padding: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottom: i < events.length - 1 ? `1px solid ${colors.sand}` : 'none', background: colors.cream }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 64, height: 64, background: colors.sandLight, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.forestDeep, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{dateObj.toLocaleString('default', { month: 'short' })}</span>
                      <span style={{ fontSize: 20, fontWeight: 700 }}>{dateObj.getDate()}</span>
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, color: colors.forestDeep, fontSize: 18, margin: '0 0 4px' }}>{event.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: colors.earth }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={14} /> ${event.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: colors.sandPale, padding: 12, borderRadius: 12, border: `1px solid ${colors.sand}` }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 11, color: colors.earth, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Capacity</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                        <Users size={16} color={isSoldOut ? colors.redAlert : colors.forestMid} />
                        <span style={{ color: isSoldOut ? colors.redAlert : colors.forestDeep }}>
                          {event.soldTickets} / {event.maxCapacity}
                        </span>
                      </div>
                    </div>
                    <div style={{ width: 1, height: 32, background: colors.sand }}></div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 11, color: colors.earth, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Revenue</p>
                      <p style={{ fontWeight: 700, color: colors.forestDeep, margin: 0 }}>${revenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
