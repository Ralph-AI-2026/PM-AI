import React, { useState, useEffect } from 'react';
import { useWaiverConfig, WaiverConfig } from '../hooks/useWaiverConfig';
import { Save, ShieldCheck, AlertCircle } from 'lucide-react';
import { TopBar, colors, fontStack } from '../components/Shared';

export default function ClubAdminWaiverSettings() {
  const { config, updateConfig, loading } = useWaiverConfig();
  const [localConfig, setLocalConfig] = useState<WaiverConfig>(config);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = async () => {
    await updateConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateNested = (category: keyof WaiverConfig, field: string, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: colors.slate, fontFamily: fontStack }}>
        <div style={{ width: 32, height: 32, border: `4px solid ${colors.forestMid}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
        <p>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TopBar title="Modular Waiver Settings" subtitle="Configure the legal parameters for your dynamically generated liability waiver." />
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px", borderRadius: 8, border: "none", fontSize: 13,
            background: `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})`,
            color: colors.cream, fontWeight: 600, cursor: "pointer", fontFamily: fontStack,
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* General Info */}
        <div style={{ background: colors.cream, borderRadius: 14, padding: 28, border: `1px solid ${colors.sand}` }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: colors.forestDeep, borderBottom: `1px solid ${colors.sand}`, paddingBottom: 12 }}>General Information</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.forestDeep, marginBottom: 6 }}>Facility Name</label>
            <input 
              type="text" 
              value={localConfig.facilityName}
              onChange={e => setLocalConfig({...localConfig, facilityName: e.target.value})}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${colors.sand}`, background: colors.sandLight, fontFamily: fontStack, fontSize: 14, color: colors.forestDeep }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.forestDeep, marginBottom: 6 }}>Country</label>
              <select 
                value={localConfig.country}
                onChange={e => setLocalConfig({...localConfig, country: e.target.value as 'CA'|'US'})}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${colors.sand}`, background: colors.sandLight, fontFamily: fontStack, fontSize: 14, color: colors.forestDeep }}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.forestDeep, marginBottom: 6 }}>Jurisdiction (State/Prov)</label>
              <input 
                type="text" 
                value={localConfig.jurisdiction}
                onChange={e => setLocalConfig({...localConfig, jurisdiction: e.target.value})}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${colors.sand}`, background: colors.sandLight, fontFamily: fontStack, fontSize: 14, color: colors.forestDeep }}
                placeholder="e.g., IL, ON, BC"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.forestDeep, marginBottom: 6 }}>Legal Entity Type</label>
            <select 
              value={localConfig.legalEntity.type}
              onChange={e => updateNested('legalEntity', 'type', e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${colors.sand}`, background: colors.sandLight, fontFamily: fontStack, fontSize: 14, color: colors.forestDeep }}
            >
              <option value="incorporated_nonprofit">Incorporated Non-Profit</option>
              <option value="unincorporated_association">Unincorporated Association</option>
              <option value="commercial">Commercial Business</option>
            </select>
          </div>
        </div>

        {/* Operating Model */}
        <div style={{ background: colors.cream, borderRadius: 14, padding: 28, border: `1px solid ${colors.sand}` }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: colors.forestDeep, borderBottom: `1px solid ${colors.sand}`, paddingBottom: 12 }}>Operating Model</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={localConfig.operatingModel.hasUnstaffedHours}
                onChange={e => updateNested('operatingModel', 'hasUnstaffedHours', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: colors.forestMid }}
              />
              <span style={{ fontSize: 14, color: colors.forestDeep }}>Has Unstaffed/Unsupervised Hours</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={localConfig.operatingModel.is24Hour}
                onChange={e => updateNested('operatingModel', 'is24Hour', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: colors.forestMid }}
              />
              <span style={{ fontSize: 14, color: colors.forestDeep }}>24-Hour Access Facility</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={localConfig.operatingModel.allowsSoloShooting}
                onChange={e => updateNested('operatingModel', 'allowsSoloShooting', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: colors.forestMid }}
              />
              <span style={{ fontSize: 14, color: colors.forestDeep }}>Allows Solo Shooting</span>
            </label>
          </div>
        </div>

        {/* Insurance & Protection */}
        <div style={{ background: colors.cream, borderRadius: 14, padding: 28, border: `1px solid ${colors.sand}` }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: colors.forestDeep, borderBottom: `1px solid ${colors.sand}`, paddingBottom: 12 }}>Insurance & Protection</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={localConfig.insuranceStatus.hasGeneralLiability}
                onChange={e => updateNested('insuranceStatus', 'hasGeneralLiability', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: colors.forestMid }}
              />
              <span style={{ fontSize: 14, color: colors.forestDeep }}>Has General Liability Insurance</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={localConfig.insuranceStatus.hasDoCoverage}
                onChange={e => updateNested('insuranceStatus', 'hasDoCoverage', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: colors.forestMid }}
              />
              <span style={{ fontSize: 14, color: colors.forestDeep }}>Has Directors & Officers (D&O) Coverage</span>
            </label>

            {!localConfig.insuranceStatus.hasGeneralLiability && (
              <div style={{ padding: 16, background: `${colors.redAlert}15`, color: colors.redAlert, borderRadius: 12, display: 'flex', gap: 12, fontSize: 13, marginTop: 8, border: `1px solid ${colors.redAlert}30` }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, lineHeight: 1.5 }}>Warning: Operating without General Liability insurance is extremely high risk. A "No Insurance Disclosure" module will be added to the waiver.</p>
              </div>
            )}
          </div>
        </div>

        {/* Facilities & Activities */}
        <div style={{ background: colors.cream, borderRadius: 14, padding: 28, border: `1px solid ${colors.sand}` }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: colors.forestDeep, borderBottom: `1px solid ${colors.sand}`, paddingBottom: 12 }}>Facilities & Activities</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={localConfig.facilityFeatures.indoorRange}
                onChange={e => updateNested('facilityFeatures', 'indoorRange', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: colors.forestMid }}
              />
              <span style={{ fontSize: 14, color: colors.forestDeep }}>Indoor Range</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={localConfig.facilityFeatures.outdoorRange}
                onChange={e => updateNested('facilityFeatures', 'outdoorRange', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: colors.forestMid }}
              />
              <span style={{ fontSize: 14, color: colors.forestDeep }}>Outdoor Range</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={localConfig.activitiesOffered.bowhuntingPrograms}
                onChange={e => updateNested('activitiesOffered', 'bowhuntingPrograms', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: colors.forestMid }}
              />
              <span style={{ fontSize: 14, color: colors.forestDeep }}>Bowhunting Programs</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={localConfig.activitiesOffered.equipmentRental}
                onChange={e => updateNested('activitiesOffered', 'equipmentRental', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: colors.forestMid }}
              />
              <span style={{ fontSize: 14, color: colors.forestDeep }}>Equipment Rental</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
