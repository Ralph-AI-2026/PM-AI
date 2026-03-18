import React, { useState } from 'react';
import { FileSignature, ShieldAlert, CreditCard, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { colors, fontStack } from '../components/Shared';

export default function MembershipPurchase() {
  const [searchParams] = useSearchParams();
  const isCancelled = searchParams.get('checkout') === 'cancelled';
  
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || signature.trim().length === 0) return;
    
    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Save the Waiver
      const waiverRes = await fetch('/api/waivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_123', // Mock user ID
          clubId: 'club_123', // Mock club ID
          signature,
          agreed
        })
      });

      if (!waiverRes.ok) throw new Error('Failed to save waiver');

      // Step 2: Create Stripe Checkout Session
      const checkoutRes = await fetch('/api/memberships/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_123',
          clubId: 'club_123'
        })
      });

      const checkoutData = await checkoutRes.json();

      if (checkoutData.error) {
        throw new Error(checkoutData.error);
      }

      if (checkoutData.url) {
        // Step 3: Redirect to Stripe
        window.location.href = checkoutData.url;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ fontFamily: fontStack, maxWidth: 800, margin: '0 auto' }}>
      {isCancelled && (
        <div style={{ background: `${colors.gold}15`, border: `1px solid ${colors.gold}40`, color: colors.gold, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <AlertCircle size={20} />
          <p style={{ margin: 0, fontWeight: 600 }}>Checkout was cancelled. You can try again when you're ready.</p>
        </div>
      )}

      {error && (
        <div style={{ background: `${colors.redAlert}15`, border: `1px solid ${colors.redAlert}40`, color: colors.redAlert, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <AlertCircle size={20} />
          <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
        </div>
      )}

      <div style={{ background: colors.cream, borderRadius: 16, border: `1px solid ${colors.sand}`, overflow: 'hidden', boxShadow: `0 4px 20px ${colors.neon}06` }}>
        {/* Header */}
        <div style={{ padding: 32, borderBottom: `1px solid ${colors.sand}`, background: colors.sandPale, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, background: `${colors.forestMid}15`, color: colors.forestMid, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CreditCard size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.forestDeep, margin: '0 0 4px' }}>Buy Annual Membership</h2>
              <p style={{ fontSize: 14, color: colors.earth, margin: 0 }}>Step 1 of 2: Sign Liability Waiver</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: colors.forestDeep, margin: 0 }}>$120.00</p>
            <p style={{ fontSize: 14, color: colors.earth, margin: 0 }}>/ year</p>
          </div>
        </div>

        {/* Waiver Content */}
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: colors.redAlert, fontWeight: 600 }}>
            <ShieldAlert size={20} />
            <span>Mandatory Safety Waiver</span>
          </div>
          
          <div style={{ background: colors.sandLight, border: `1px solid ${colors.sand}`, borderRadius: 12, padding: 24, height: 250, overflowY: 'auto', marginBottom: 32, fontSize: 14, color: colors.charcoal, lineHeight: 1.6 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: colors.forestDeep, margin: '0 0 16px' }}>RELEASE OF LIABILITY, WAIVER OF CLAIMS, AND ASSUMPTION OF RISKS</h3>
            <p style={{ marginBottom: 12 }}><strong>1. ASSUMPTION OF RISKS:</strong> I am aware that archery involves inherent risks, dangers, and hazards, including but not limited to: being hit by an arrow, equipment failure, tripping or falling, and negligence of other participants. I freely accept and fully assume all such risks.</p>
            <p style={{ marginBottom: 12 }}><strong>2. RELEASE OF LIABILITY:</strong> In consideration of being permitted to use the facilities of the Archery Club, I hereby release, waive, and discharge the Club, its directors, officers, employees, volunteers, and agents from any and all liability for any loss, damage, injury, or expense that I may suffer as a result of my participation in archery activities.</p>
            <p style={{ marginBottom: 12 }}><strong>3. SAFETY RULES:</strong> I agree to abide by all safety rules and regulations established by the Club. I understand that failure to follow these rules may result in immediate revocation of my shooting privileges without refund.</p>
            <p style={{ fontWeight: 600, marginTop: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}>By signing below, I acknowledge that I have read this agreement, fully understand its terms, and sign it freely and voluntarily.</p>
          </div>

          <form onSubmit={handleProceed} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 16, border: `1px solid ${colors.sand}`, borderRadius: 12, cursor: 'pointer', background: agreed ? `${colors.forestMid}05` : 'transparent', transition: 'background 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', height: 24 }}>
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ width: 20, height: 20, accentColor: colors.forestMid, cursor: 'pointer' }}
                  required
                />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: colors.forestDeep, margin: '0 0 4px' }}>I agree to the terms and release of liability</p>
                <p style={{ fontSize: 14, color: colors.earth, margin: 0 }}>I confirm that I am at least 18 years of age or am the legal guardian of the participant.</p>
              </div>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="signature" style={{ fontWeight: 600, color: colors.forestDeep }}>
                Electronic Signature
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: 16, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <FileSignature color={colors.slate} size={20} />
                </div>
                <input
                  type="text"
                  id="signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Type your full legal name"
                  style={{ width: '100%', padding: '14px 16px 14px 48px', border: `1px solid ${colors.sand}`, borderRadius: 12, fontSize: 15, fontFamily: fontStack, background: colors.sandLight, outline: 'none', color: colors.forestDeep, fontWeight: 500 }}
                  required
                />
              </div>
            </div>

            <div style={{ paddingTop: 24, borderTop: `1px solid ${colors.sand}`, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={!agreed || signature.trim().length === 0 || isProcessing}
                style={{
                  padding: '14px 32px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 600, cursor: (!agreed || signature.trim().length === 0 || isProcessing) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, fontFamily: fontStack,
                  background: (!agreed || signature.trim().length === 0 || isProcessing) ? colors.sand : `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})`,
                  color: (!agreed || signature.trim().length === 0 || isProcessing) ? colors.earth : colors.cream,
                  transition: 'opacity 0.2s'
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
