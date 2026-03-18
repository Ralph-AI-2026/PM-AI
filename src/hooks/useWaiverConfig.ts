import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface WaiverConfig {
  facilityName: string;
  facilityType: 'A' | 'B' | 'C' | 'D' | 'E';
  country: 'CA' | 'US';
  jurisdiction: string;
  operatingModel: {
    hasUnstaffedHours: boolean;
    is24Hour: boolean;
    allowsSoloShooting: boolean;
  };
  insuranceStatus: {
    hasGeneralLiability: boolean;
    hasDoCoverage: boolean;
    affiliatedWithNationalBody: boolean;
    nationalBody: string;
  };
  legalEntity: {
    type: 'incorporated_nonprofit' | 'unincorporated_association' | 'commercial';
  };
  activitiesOffered: {
    bowhuntingPrograms: boolean;
    equipmentRental: boolean;
  };
  facilityFeatures: {
    indoorRange: boolean;
    outdoorRange: boolean;
    course3D: boolean;
  };
}

export const defaultWaiverConfig: WaiverConfig = {
  facilityName: 'Springfield Archery Club',
  facilityType: 'A',
  country: 'US',
  jurisdiction: 'IL',
  operatingModel: {
    hasUnstaffedHours: false,
    is24Hour: false,
    allowsSoloShooting: true,
  },
  insuranceStatus: {
    hasGeneralLiability: true,
    hasDoCoverage: true,
    affiliatedWithNationalBody: true,
    nationalBody: 'USA Archery',
  },
  legalEntity: {
    type: 'incorporated_nonprofit',
  },
  activitiesOffered: {
    bowhuntingPrograms: false,
    equipmentRental: true,
  },
  facilityFeatures: {
    indoorRange: true,
    outdoorRange: true,
    course3D: false,
  },
};

export function useWaiverConfig() {
  const [config, setConfig] = useState<WaiverConfig>(defaultWaiverConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('waiver_configs')
          .select('config')
          .limit(1)
          .maybeSingle();

        if (data?.config) {
          setConfig(data.config as WaiverConfig);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Supabase fetch failed, falling back to local storage', e);
      }

      // Fallback to local storage if Supabase fails or is empty
      const saved = localStorage.getItem('arc_waiver_config');
      if (saved) {
        try {
          setConfig(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
      setLoading(false);
    }
    loadConfig();
  }, []);

  const updateConfig = async (newConfig: WaiverConfig) => {
    // Optimistic UI update
    setConfig(newConfig);
    localStorage.setItem('arc_waiver_config', JSON.stringify(newConfig));

    try {
      // Try to save to Supabase
      // First, ensure we have a club to attach it to
      let { data: club } = await supabase.from('clubs').select('id').limit(1).maybeSingle();

      if (!club) {
        // Create a default club if none exists
        const { data: newClub, error: insertError } = await supabase
          .from('clubs')
          .insert({ name: newConfig.facilityName })
          .select('id')
          .single();
        
        if (insertError) throw insertError;
        club = newClub;
      }

      if (club) {
        const { data: existingConfig } = await supabase
          .from('waiver_configs')
          .select('id')
          .eq('club_id', club.id)
          .maybeSingle();

        if (existingConfig) {
          await supabase
            .from('waiver_configs')
            .update({ config: newConfig })
            .eq('id', existingConfig.id);
        } else {
          await supabase
            .from('waiver_configs')
            .insert({ club_id: club.id, config: newConfig });
        }
      }
    } catch (e) {
      console.error('Failed to save to Supabase', e);
    }
  };

  return { config, updateConfig, loading };
}
