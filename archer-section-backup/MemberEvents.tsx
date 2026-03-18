import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { TopBar, colors, fontStack } from '../components/Shared';

interface Event {
  id: string;
  name: string;
  date: string;
  maxCapacity: number;
  price: number;
  soldTickets: number;
}

export default function MemberEvents() {
  const [searchParams] = useSearchParams();
  const checkoutSuccess = searchParams.get('checkout') === 'success';
  const isCancelled = searchParams.get('checkout') === 'cancelled';

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handlePurchase = async (eventId: string, isWaitlist: boolean) => {
    setProcessingId(eventId);
    setError('');

    try {
      if (isWaitlist) {
        const res = await fetch('/api/events/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, userId: 'user_123' })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        alert('You have been added to the waitlist!');
      } else {
        const res = await fetch('/api/events/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, userId: 'user_123', clubId: 'club_123' })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ fontFamily: fontStack }}>
      <div style={{ marginBottom: 32 }}>
        <TopBar title="Upcoming Events & Tournaments" subtitle="Join 3D shoots, target tournaments, and special club events." />
      </div>

      {checkoutSuccess && (
        <div style={{ background: `${colors.forestMid}15`, border: `1px solid ${colors.forestMid}40`, color: colors.forestDeep, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <CheckCircle2 size={24} color={colors.forestMid} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Ticket Purchased Successfully!</p>
            <p style={{ margin: 0, fontSize: 14 }}>We have emailed you the receipt and event details.</p>
          </div>
        </div>
      )}

      {isCancelled && (
        <div style={{ background: `${colors.gold}15`, border: `1px solid ${colors.gold}40`, color: colors.gold, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <AlertCircle size={20} />
          <p style={{ margin: 0, fontWeight: 600 }}>Checkout was cancelled. Your ticket was not purchased.</p>
        </div>
      )}

      {error && (
        <div style={{ background: `${colors.redAlert}15`, border: `1px solid ${colors.redAlert}40`, color: colors.redAlert, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <AlertCircle size={20} />
          <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: 48, color: colors.slate }}>
            <Loader2 size={32} className="animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 48, color: colors.earth, background: colors.cream, borderRadius: 14, border: `1px solid ${colors.sand}` }}>
            No upcoming events at this time.
          </div>
        ) : (
          events.map(event => {
            const dateObj = new Date(event.date);
            const isSoldOut = event.soldTickets >= event.maxCapacity;
            const spotsLeft = event.maxCapacity - event.soldTickets;
            const isProcessing = processingId === event.id;

            return (
              <div key={event.id} style={{ background: colors.cream, borderRadius: 14, border: `1px solid ${colors.sand}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${colors.neon}06`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ padding: 24, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ width: 64, height: 64, background: colors.sandLight, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.forestDeep, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{dateObj.toLocaleString('default', { month: 'short' })}</span>
                      <span style={{ fontSize: 20, fontWeight: 700 }}>{dateObj.getDate()}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 24, fontWeight: 700, color: colors.forestDeep, margin: 0 }}>${event.price.toFixed(2)}</p>
                      <p style={{ fontSize: 13, color: colors.earth, margin: 0 }}>per ticket</p>
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.forestDeep, margin: '0 0 12px' }}>{event.name}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: colors.earth, marginBottom: 24 }}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><Calendar size={16} /> {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                      <Users size={16} color={isSoldOut ? colors.redAlert : colors.earth} /> 
                      {isSoldOut ? (
                        <span style={{ color: colors.redAlert, fontWeight: 600 }}>Sold Out</span>
                      ) : (
                        <span>{spotsLeft} spots remaining</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div style={{ padding: 24, borderTop: `1px solid ${colors.sand}`, background: colors.sandPale }}>
                  <button
                    onClick={() => handlePurchase(event.id, isSoldOut)}
                    disabled={isProcessing}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: fontStack,
                      background: isSoldOut ? colors.sand : `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})`,
                      color: isSoldOut ? colors.earth : colors.cream,
                      opacity: isProcessing ? 0.7 : 1,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {isProcessing ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : isSoldOut ? (
                      'Join Waitlist'
                    ) : (
                      <>Buy Ticket <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
