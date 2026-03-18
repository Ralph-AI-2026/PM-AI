import React, { useState } from 'react';
import { FileSignature, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useWaiverConfig } from '../hooks/useWaiverConfig';
import { supabase } from '../lib/supabase';
import { colors, fontStack } from './Shared';

export default function WaiverForm() {
  const { config, loading } = useWaiverConfig();
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (agreed && signature.trim().length > 0) {
      setIsSubmitting(true);
      try {
        // Try to save to Supabase
        let { data: club } = await supabase.from('clubs').select('id').limit(1).maybeSingle();
        
        if (club) {
          await supabase.from('signed_waivers').insert({
            club_id: club.id,
            signature_name: signature,
            agreed_to_terms: agreed,
            config_snapshot: config
          });
        }
      } catch (err) {
        console.error('Failed to save waiver to Supabase', err);
      } finally {
        setIsSubmitting(false);
        setSubmitted(true);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: colors.slate, fontFamily: fontStack }}>
        <div style={{ width: 32, height: 32, border: `4px solid ${colors.forestMid}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
        <p>Loading waiver document...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', background: colors.cream, borderRadius: 14, border: `1px solid ${colors.greenGood}40`, padding: 48, textAlign: 'center', fontFamily: fontStack }}>
        <div style={{ width: 80, height: 80, background: `${colors.greenGood}15`, color: colors.greenGood, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle2 size={40} />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: colors.forestDeep, margin: '0 0 16px' }}>Waiver Signed Successfully</h2>
        <p style={{ color: colors.earth, marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          Thank you for completing your annual safety waiver. You are now cleared to book lanes and participate in club events.
        </p>
        <button 
          onClick={() => window.location.href = '/member'}
          style={{
            padding: "12px 24px", borderRadius: 8, border: "none", fontSize: 14,
            background: `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})`,
            color: colors.cream, fontWeight: 600, cursor: "pointer"
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const getApplicableParties = () => {
    switch (config.legalEntity.type) {
      case 'incorporated_nonprofit':
        return 'directors, officers, board members, volunteers, coaches, instructors, agents, and assigns';
      case 'commercial':
        return 'owners, operators, managers, employees, instructors, coaches, independent contractors, agents, successors, and assigns';
      default:
        return 'directors, officers, board members, volunteers, coaches, instructors, agents, and assigns';
    }
  };

  const getLegalEntityDesc = () => {
    switch (config.legalEntity.type) {
      case 'incorporated_nonprofit':
        return 'a not-for-profit organization';
      case 'commercial':
        return 'a commercial entity';
      default:
        return 'an unincorporated association';
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', background: colors.cream, borderRadius: 14, border: `1px solid ${colors.sand}`, overflow: 'hidden', fontFamily: fontStack }}>
      <div style={{ padding: 32, borderBottom: `1px solid ${colors.sand}`, background: colors.sandPale, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, background: `${colors.redAlert}15`, color: colors.redAlert, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.forestDeep, margin: 0 }}>Annual Liability Waiver</h2>
          <p style={{ color: colors.earth, margin: '4px 0 0', fontSize: 14 }}>Please read carefully before signing. This is a legally binding document.</p>
        </div>
      </div>

      <div style={{ padding: 32 }}>
        <div style={{ background: colors.sandPale, border: `1px solid ${colors.sand}`, borderRadius: 12, padding: 24, height: 400, overflowY: 'auto', marginBottom: 32, fontSize: 14, color: colors.forestDeep, lineHeight: 1.6 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, textAlign: 'center', margin: '0 0 8px' }}>RELEASE OF LIABILITY, WAIVER OF CLAIMS,<br/>ASSUMPTION OF RISKS, AND INDEMNITY AGREEMENT</h3>
          <p style={{ textAlign: 'center', fontStyle: 'italic', margin: '0 0 16px' }}>(Applicable to all Canadian Provinces, Territories, and United States Jurisdictions)</p>
          
          <p style={{ fontWeight: 700, textTransform: 'uppercase', marginTop: 16 }}>PLEASE READ CAREFULLY BEFORE SIGNING. THIS IS A LEGALLY BINDING DOCUMENT THAT AFFECTS YOUR LEGAL RIGHTS.</p>
          
          <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>DEFINITIONS</h4>
          <p>In this agreement:</p>
          <p>"{config.facilityName}" refers to {config.facilityName}, {getLegalEntityDesc()}, including its {getApplicableParties()}.</p>
          <p>"Participant" refers to the individual named below (and, where applicable, the parent or legal guardian signing on behalf of a minor).</p>
          <p>"Activities" refers to all archery-related activities offered by the {config.facilityName}, including but not limited to: target shooting, field archery, 3D archery, leagues, tournaments, competitions, classes, lessons, coaching sessions, equipment rental and use, open practice sessions, social events held at the facility, and any other programs or services offered by the Club.</p>
          
          {config.operatingModel.hasUnstaffedHours && (
            <p>"Unsupervised Access" refers to any period during which no {config.facilityName} staff, volunteers, or designated range officers are present at the facility.</p>
          )}

          {config.operatingModel.is24Hour && (
            <p>"24-Hour Access Period" refers to access to the facility outside of posted staffed hours, made available through the {config.facilityName}'s electronic access control system.</p>
          )}

          <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>1. ACKNOWLEDGMENT AND ASSUMPTION OF RISKS</h4>
          <p>I acknowledge that archery and related Activities involve inherent risks, dangers, and hazards that may result in serious personal injury, permanent disability, or death. These risks include but are not limited to:</p>
          <ul style={{ listStyleType: 'lower-alpha', paddingLeft: 32, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Being struck by an arrow, whether shot by myself, another participant, or resulting from ricochet or deflection;</li>
            <li>Equipment malfunction or failure, including but not limited to bow limb breakage, string failure, arrow breakage or splintering, broadhead injuries, and release aid malfunction;</li>
            <li>Muscular, skeletal, or soft tissue injuries including strains, sprains, tendonitis, rotator cuff injuries, and repetitive stress injuries;</li>
            <li>Eye injuries from debris, fragments, broken arrows, or other projectiles;</li>
            <li>Tripping, slipping, or falling on the premises;</li>
            <li>Injuries caused by the actions of other participants, spectators, or third parties present on the premises;</li>
            <li>Allergic reactions to materials used in equipment, targets, or the facility;</li>
            
            {config.facilityFeatures.indoorRange && (
              <>
                <li>Hearing damage from sustained exposure to indoor range noise levels;</li>
                <li>Exposure to communicable diseases in shared indoor spaces and through shared equipment;</li>
              </>
            )}

            {(config.facilityFeatures.outdoorRange || config.facilityFeatures.course3D) && (
              <>
                <li>Adverse weather conditions including lightning, extreme heat, cold, or wind;</li>
                <li>Uneven terrain, wet surfaces, obstacles, and natural hazards;</li>
                <li>Wildlife encounters on or near the property;</li>
              </>
            )}

            {config.activitiesOffered.bowhuntingPrograms && (
              <li>Injuries related to broadhead handling, treestand use, and field conditions;</li>
            )}

            {config.activitiesOffered.equipmentRental && (
              <li>Injuries resulting from the use of rented or borrowed equipment, including equipment that may not be optimally suited to my size, strength, or skill level;</li>
            )}

            {config.operatingModel.hasUnstaffedHours && (
              <li>Increased risk during periods when no staff, range officers, or other participants are present, including delayed emergency response;</li>
            )}

            {config.operatingModel.allowsSoloShooting && (
              <li>The risk of shooting alone without any other person present to provide assistance in the event of injury, medical emergency, or equipment failure;</li>
            )}

            <li>Injuries sustained while retrieving arrows from targets or surrounding areas;</li>
            <li>Any other risks inherent to the sport of archery or the use of archery facilities and equipment.</li>
          </ul>
          <p>I freely, voluntarily, and without inducement accept and fully assume all such risks, both known and unknown, and I assume full responsibility for my participation in the Activities.</p>

          <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>2. RELEASE OF LIABILITY AND WAIVER OF CLAIMS</h4>
          <p>In consideration of being permitted to participate in the Activities and to use the {config.facilityName}'s facilities, equipment, and services, I hereby release, waive, and discharge the {config.facilityName} from any and all liability, claims, demands, actions, causes of action, costs, expenses (including legal fees), and damages of whatever kind, whether known or unknown, that I now have or may hereafter have against the {config.facilityName} arising out of or in connection with my participation in the Activities, including but not limited to claims based on:</p>
          <ul style={{ listStyleType: 'lower-alpha', paddingLeft: 32, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>The negligence, carelessness, or omission of the {config.facilityName};</li>
            <li>Breach of any statutory or other duty of care, including {config.country === 'CA' ? `occupier's liability legislation in the province of ${config.jurisdiction}` : `premises liability statutes in the state of ${config.jurisdiction}`};</li>
            <li>Defective or dangerous conditions of any equipment, premises, or facilities;</li>
            <li>Failure to adequately warn, supervise, or instruct.</li>
          </ul>
          <p style={{ fontWeight: 700, marginTop: 16 }}>This release applies to claims arising from the ordinary negligence of the {config.facilityName}. This release does NOT apply to claims arising from the gross negligence, willful misconduct, or intentional acts of the {config.facilityName}.</p>
          <p>This release applies to personal injury, property damage, wrongful death, and any other loss or damage however caused, except to the extent that such release is prohibited by applicable law.</p>

          {config.operatingModel.hasUnstaffedHours && (
            <>
              <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>3. UNSUPERVISED ACCESS ACKNOWLEDGMENT</h4>
              <p>I acknowledge and understand that:</p>
              <ul style={{ listStyleType: 'lower-alpha', paddingLeft: 32, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>The {config.facilityName} operates with periods during which no staff, range officers, instructors, volunteers, or other authorized representatives are present at the facility ("Unsupervised Access Periods");</li>
                <li>During Unsupervised Access Periods, I am solely and entirely responsible for my own safety and the safety of any guests I have been authorized to bring to the facility;</li>
                <li>No person will be present to enforce safety rules, conduct equipment inspections, call cease-fires, administer first aid, or call emergency services on my behalf;</li>
                <li>I accept the facility in "as-is" condition during Unsupervised Access Periods and acknowledge that conditions including but not limited to lighting, ventilation, temperature, target condition, and general cleanliness may differ from conditions during staffed hours;</li>
                <li>I am solely responsible for contacting emergency services (911 or local equivalent) in the event of any emergency, injury, or medical event;</li>
                <li>I have been informed of and can locate: the facility's first aid kit, AED (if available), emergency contact numbers, and all emergency exits;</li>
                <li>I will not prop open, bypass, or tamper with any access control mechanisms including but not limited to doors, locks, key fob readers, or surveillance equipment;</li>
                <li>I will report any unsafe conditions, equipment damage, or facility issues to the {config.facilityName} at the earliest opportunity.</li>
              </ul>
            </>
          )}

          {config.operatingModel.is24Hour && (
            <>
              <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>4. 24-HOUR ACCESS AGREEMENT</h4>
              <p>In addition to the Unsupervised Access Acknowledgment above, I further acknowledge and agree that:</p>
              <ul style={{ listStyleType: 'lower-alpha', paddingLeft: 32, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>I have been issued an access credential that is personal to me and non-transferable. I will not share, loan, duplicate, or allow any other person to use my access credential;</li>
                <li>I will not allow any person to enter the facility using my access credential, whether by holding the door, sharing my code, or any other means ("tailgating"), unless that person holds their own valid access credential and current membership;</li>
                <li>I am responsible for any unauthorized access that results from my failure to secure my access credential or my facilitation of entry by non-members;</li>
                <li>I self-certify that upon each entry to the facility, I am not under the influence of alcohol, cannabis, controlled substances, prescription medications that impair coordination or judgment, or any other substance that may affect my ability to safely engage in archery activities;</li>
                <li>I understand that the {config.facilityName} has no ability to verify my sobriety or fitness to participate during Unsupervised Access Periods and that I bear full responsibility for this determination;</li>
                <li>I consent to the {config.facilityName}'s electronic access control system recording my entry and exit times, and I understand these records may be used for security, safety, insurance, or legal purposes;</li>
                <li>My 24-Hour Access privileges may be revoked immediately and without refund for any violation of this agreement, the facility's safety rules, or any conduct that the {config.facilityName}'s board/management determines poses a risk to the safety of other members or the facility;</li>
                <li>Lost, stolen, or damaged access credentials must be reported to the {config.facilityName} immediately. I am responsible for any replacement costs. The {config.facilityName} will deactivate the lost credential as soon as reasonably possible upon notification.</li>
              </ul>
            </>
          )}

          {!config.insuranceStatus.hasGeneralLiability && (
            <>
              <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>5. IMPORTANT DISCLOSURE: ABSENCE OF LIABILITY INSURANCE</h4>
              <p style={{ fontWeight: 700, textTransform: 'uppercase' }}>I ACKNOWLEDGE AND UNDERSTAND THAT THE {config.facilityName} DOES NOT CARRY GENERAL LIABILITY INSURANCE. This means:</p>
              <ul style={{ listStyleType: 'lower-alpha', paddingLeft: 32, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>There is no insurance policy in place to pay claims for personal injury, property damage, or any other loss arising from my participation in the Activities or my presence on the premises;</li>
                <li>In the event of injury or loss, there is no insured party against whom to make a claim;</li>
                <li>I am assuming all risk of participation with full knowledge that no insurance safety net exists;</li>
                <li>I am encouraged to maintain my own personal health insurance, accident insurance, and/or liability insurance to cover any losses I may sustain;</li>
                <li>My decision to participate in the Activities is made with full knowledge of this lack of insurance coverage.</li>
              </ul>
            </>
          )}

          {(config.legalEntity.type === 'incorporated_nonprofit' || config.legalEntity.type === 'unincorporated_association') && (
            <>
              <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>6. ORGANIZATIONAL STRUCTURE DISCLOSURE</h4>
              {config.legalEntity.type === 'incorporated_nonprofit' ? (
                <p>I acknowledge and understand that the {config.facilityName} is a not-for-profit organization governed by a volunteer board of directors. The {config.facilityName} is operated entirely by volunteers who receive no compensation for their service, has limited financial assets and resources, relies on membership dues, fundraising, and community support to maintain its facilities and operations, and does not operate for commercial profit.</p>
              ) : (
                <p>I acknowledge and understand that the {config.facilityName} is an unincorporated voluntary association of individuals who share an interest in the sport of archery. As an unincorporated association, the {config.facilityName} is not a separately incorporated legal entity, is organized and operated by volunteers, and has limited financial assets and no corporate liability protections.</p>
              )}
            </>
          )}

          {(config.legalEntity.type === 'incorporated_nonprofit' || config.legalEntity.type === 'unincorporated_association') && !config.insuranceStatus.hasDoCoverage && (
            <>
              <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>7. DIRECTOR, OFFICER, AND VOLUNTEER PROTECTION</h4>
              <p>I agree that I will not bring any claim, action, or legal proceeding personally against any individual director, officer, board member, committee member, or volunteer of the {config.facilityName} in their personal capacity for any matter arising out of or in connection with my participation in the Activities or my use of the {config.facilityName}'s facilities, except in cases of willful misconduct or criminal activity by such individual.</p>
              <p>I understand that the individuals who govern and operate the {config.facilityName} do so on a volunteer basis for the benefit of the archery community, and that personal liability exposure may discourage their continued service to the detriment of the sport and community.</p>
            </>
          )}

          {config.country === 'CA' && (
            <>
              <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>8. PRIVACY AND PERSONAL INFORMATION (CANADA)</h4>
              <p>The {config.facilityName} collects personal information including your name, contact information, emergency contact details, medical conditions, and (if applicable) access log data and video surveillance footage. This information is collected for the administration of membership and facility access, emergency response and medical treatment authorization, communication regarding club activities, safety notices, and membership, compliance with insurance requirements, security and safety monitoring of the facility, and legal compliance and defense of legal claims.</p>
              <p>Your personal information will be stored securely and retained for a period of 7 years. You have the right to access, correct, and request deletion of your personal information, subject to legal retention requirements.</p>
              <p>The {config.facilityName} will not sell, rent, or disclose your personal information to third parties except as required by law, for insurance purposes, or for emergency medical treatment.</p>
            </>
          )}

          <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>9. PROPERTY DAMAGE AND FACILITY RESPONSIBILITY</h4>
          <p>I agree that I am financially responsible for any damage I cause to the {config.facilityName}'s property, equipment, targets, facilities, or premises through negligence, misuse, or failure to follow established safety rules and procedures.</p>
          <p>I agree to:</p>
          <ul style={{ listStyleType: 'lower-alpha', paddingLeft: 32, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Use all equipment and facilities only for their intended purpose;</li>
            <li>Report any damage I cause or observe to the {config.facilityName} promptly;</li>
            <li>Not remove, borrow, or use any equipment or property belonging to the {config.facilityName} or other members without express permission;</li>
            <li>Leave the facility in the condition I found it or better, including removing my arrows from targets and cleaning my shooting area.</li>
            {config.operatingModel.hasUnstaffedHours && (
              <li>During Unsupervised Access Periods, I accept additional responsibility for the care and condition of the facility, understanding that no staff is present to monitor usage.</li>
            )}
          </ul>

          <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>10. DISPUTE RESOLUTION</h4>
          <p>In the event of any dispute arising out of or in connection with this agreement, my participation in the Activities, or my use of the {config.facilityName}'s facilities, the parties agree to first attempt to resolve the dispute through good faith negotiation. If the dispute cannot be resolved through negotiation within thirty (30) days, the parties agree to submit the dispute to mediation before a qualified mediator in {config.jurisdiction}.</p>

          <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 24, marginBottom: 8 }}>11. ACKNOWLEDGMENT AND AGREEMENT</h4>
          <p style={{ fontWeight: 700, textTransform: 'uppercase' }}>BY SIGNING BELOW, I ACKNOWLEDGE THAT I HAVE CAREFULLY READ THIS AGREEMENT IN ITS ENTIRETY, THAT I FULLY UNDERSTAND ALL OF ITS TERMS AND CONDITIONS, AND THAT I AM SIGNING IT FREELY AND VOLUNTARILY. I UNDERSTAND THAT THIS IS A LEGALLY BINDING RELEASE OF LIABILITY AND A CONTRACT BETWEEN MYSELF AND THE {config.facilityName.toUpperCase()}, AND I SIGN IT OF MY OWN FREE WILL.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 16, border: `1px solid ${colors.sand}`, borderRadius: 12, cursor: 'pointer', background: colors.sandPale }}>
            <div style={{ display: 'flex', alignItems: 'center', height: 24 }}>
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: 20, height: 20, accentColor: colors.forestMid }}
                required
              />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: colors.forestDeep }}>I agree to the terms and conditions</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.earth }}>I confirm that I am at least 18 years of age or am the legal guardian of the participant.</p>
            </div>
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="signature" style={{ fontWeight: 600, color: colors.forestDeep }}>
              Electronic Signature
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: colors.slate }}>
                <FileSignature size={20} />
              </div>
              <input
                type="text"
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your full legal name"
                style={{
                  width: '100%', padding: '12px 16px 12px 48px', border: `1px solid ${colors.sand}`, borderRadius: 12,
                  fontSize: 15, fontWeight: 500, color: colors.forestDeep, fontFamily: fontStack, background: colors.cream,
                  outline: 'none'
                }}
                required
              />
            </div>
            <p style={{ margin: 0, fontSize: 12, color: colors.earth }}>
              By typing your name, you are signing this document electronically. You agree that your electronic signature is the legal equivalent of your manual signature.
            </p>
          </div>

          <div style={{ paddingTop: 16, borderTop: `1px solid ${colors.sand}`, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={!agreed || signature.trim().length === 0 || isSubmitting}
              style={{
                padding: "12px 32px", borderRadius: 12, border: "none", fontSize: 15,
                background: (!agreed || signature.trim().length === 0 || isSubmitting) ? colors.sand : `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})`,
                color: (!agreed || signature.trim().length === 0 || isSubmitting) ? colors.earth : colors.cream, 
                fontWeight: 600, cursor: (!agreed || signature.trim().length === 0 || isSubmitting) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8, transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{ width: 20, height: 20, border: `2px solid ${colors.cream}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Submitting...
                </>
              ) : (
                'Sign & Submit Waiver'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
