import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { AvatarPortrait } from '../components/AvatarPortrait';
import { PixelButton } from '../components/PixelButton';
import { PixelFrame } from '../components/PixelFrame';
import { PixelInput } from '../components/PixelInput';
import { PixelPanel } from '../components/PixelPanel';
import { PixelText } from '../components/PixelText';
import { RoomScene } from '../components/RoomScene';
import { getProfile, saveProfile } from '../lib/db';
import {
  ACTIVITY_LEVELS,
  assessGoal,
  bmi,
  bmiBand,
  GOALS,
  targetsFor,
  type ActivityLevel,
  type Goal,
  type Profile,
  type Sex,
} from '../lib/nutrition';
import { colors } from '../theme';

const GLASS = 'rgba(18,14,36,0.8)';
const STEPS = ['About you', 'Your body', 'Activity', 'Goal', 'Your plan'] as const;
const BAND_LABEL = { underweight: 'Underweight range', healthy: 'Healthy range', overweight: 'Overweight range', obese: 'Obese range' };

const num = (v: string) => Number(v.replace(',', '.'));
const inRange = (v: string, lo: number, hi: number) => v.trim() !== '' && num(v) >= lo && num(v) <= hi;

function Choice({ selected, onPress, children }: { selected: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress}>
      <PixelFrame fill={selected ? '#1f4a47' : colors.panel} edge={selected ? colors.teal : colors.border} step={3}>
        {children}
      </PixelFrame>
    </Pressable>
  );
}

export default function Setup() {
  const db = useSQLiteContext();
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(0);
  const [sex, setSex] = useState<Sex | null>(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<ActivityLevel>('light');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProfile(db).then((p) => {
      if (cancelled) return;
      if (p) {
        setEditing(true);
        setSex(p.sex);
        setAge(String(p.age));
        setHeight(String(p.heightCm));
        setWeight(String(p.weightKg));
        setActivity(p.activity);
        setGoal(p.goal);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  const validBody = inRange(height, 120, 230) && inRange(weight, 30, 300);
  const assessment = useMemo(() => (validBody ? assessGoal(num(height), num(weight)) : null), [validBody, height, weight]);
  const chosenGoal: Goal = goal ?? assessment?.suggested ?? 'maintain';

  const profile: Profile | null =
    sex && inRange(age, 14, 90) && validBody
      ? { sex, age: Math.round(num(age)), heightCm: num(height), weightKg: num(weight), activity, goal: chosenGoal }
      : null;
  const targets = profile ? targetsFor(profile) : null;

  const canNext = [sex !== null && inRange(age, 14, 90), validBody, true, true, profile !== null][step];

  function leave() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  async function finish() {
    if (!profile || saving) return;
    setSaving(true);
    try {
      await saveProfile(db, profile);
      router.replace('/');
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <View style={styles.screen} />;

  const heroGender = sex ?? 'female';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <RoomScene mood="thriving" gender={heroGender} compact>
        <View style={styles.caption}>
          <PixelFrame fill={GLASS} edge={colors.border} step={2}>
            <View style={styles.captionInner}>
              <PixelText variant="label" size={10} color={colors.amber}>
                {editing ? 'Edit profile' : 'Welcome'} - step {step + 1} of {STEPS.length}
              </PixelText>
              <PixelText variant="bold" size={18}>{STEPS[step]}</PixelText>
            </View>
          </PixelFrame>
        </View>
      </RoomScene>

      <View style={styles.body}>
        <View style={styles.progress}>
          {STEPS.map((s, i) => (
            <View key={s} style={[styles.segment, { backgroundColor: i <= step ? colors.amber : colors.border }]} />
          ))}
        </View>

        {step === 0 && (
          <>
            <View style={styles.cards}>
              {(['female', 'male'] as const).map((s) => (
                <View key={s} style={{ flex: 1 }}>
                  <Choice selected={sex === s} onPress={() => setSex(s)}>
                    <View style={styles.sexCard}>
                      <AvatarPortrait gender={s} px={3} />
                      <PixelText variant="bold" size={18}>{s === 'female' ? 'Female' : 'Male'}</PixelText>
                    </View>
                  </Choice>
                </View>
              ))}
            </View>
            <PixelPanel label="Age">
              <PixelInput placeholder="25" keyboardType="number-pad" value={age} onChangeText={setAge} />
              <PixelText size={13} color={colors.textFaint}>
                Sex and age feed the calorie formula (Mifflin-St Jeor). Your avatar follows the sex you pick.
              </PixelText>
            </PixelPanel>
          </>
        )}

        {step === 1 && (
          <>
            <PixelPanel label="Height and weight">
              <View style={styles.row}>
                <PixelInput label="Height (cm)" placeholder="170" keyboardType="decimal-pad" value={height} onChangeText={setHeight} />
                <PixelInput label="Weight (kg)" placeholder="70" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
              </View>
            </PixelPanel>
            {validBody ? (
              <PixelPanel label="Body mass index">
                <View style={styles.bmiRow}>
                  <PixelText variant="bold" size={32}>{bmi(num(height), num(weight)).toFixed(1)}</PixelText>
                  <PixelText color={colors.amber}>{BAND_LABEL[bmiBand(bmi(num(height), num(weight)))]}</PixelText>
                </View>
                <PixelText size={13} color={colors.textFaint}>
                  BMI can&apos;t tell muscle from fat, so treat it as a rough guide, not a verdict.
                </PixelText>
              </PixelPanel>
            ) : (
              <PixelText size={13} color={colors.textFaint}>Height 120-230 cm, weight 30-300 kg.</PixelText>
            )}
          </>
        )}

        {step === 2 && (
          <View style={{ gap: 10 }}>
            {ACTIVITY_LEVELS.map((a) => (
              <Choice key={a.id} selected={activity === a.id} onPress={() => setActivity(a.id)}>
                <View style={styles.option}>
                  <PixelText variant="bold" size={17}>{a.title}</PixelText>
                  <PixelText size={13} color={colors.textDim}>{a.hint}</PixelText>
                </View>
              </Choice>
            ))}
          </View>
        )}

        {step === 3 && assessment && (
          <>
            <PixelPanel label="Our read">
              <PixelText>{assessment.reason}</PixelText>
            </PixelPanel>
            <View style={{ gap: 10 }}>
              {GOALS.map((g) => (
                <Choice key={g.id} selected={chosenGoal === g.id} onPress={() => setGoal(g.id)}>
                  <View style={styles.option}>
                    <View style={styles.goalTitle}>
                      <PixelText variant="bold" size={18}>{g.title}</PixelText>
                      {assessment.suggested === g.id ? (
                        <PixelText variant="label" size={9} color={colors.amber}>Suggested</PixelText>
                      ) : null}
                    </View>
                    <PixelText size={13} color={colors.textDim}>{g.hint}</PixelText>
                  </View>
                </Choice>
              ))}
            </View>
            {assessment.caution(chosenGoal) ? (
              <PixelText color={colors.danger} size={14}>{assessment.caution(chosenGoal)}</PixelText>
            ) : null}
          </>
        )}

        {step === 4 && targets && profile && (
          <>
            <PixelPanel label={`Daily target - ${GOALS.find((g) => g.id === profile.goal)?.title}`}>
              <View style={styles.bmiRow}>
                <PixelText variant="bold" size={40} color={colors.amber}>{targets.energy}</PixelText>
                <PixelText color={colors.textDim}>kcal / day</PixelText>
              </View>
              <PixelText size={13} color={colors.textDim}>
                Resting {targets.bmr} + activity = {targets.tdee} to maintain
                {targets.adjustment === 0 ? '.' : `, ${targets.adjustment > 0 ? '+' : ''}${targets.adjustment} for your goal.`}
              </PixelText>
              {targets.flooredAtMinimum ? (
                <PixelText size={13} color={colors.danger}>
                  The deficit was limited so you don&apos;t eat below a safe minimum.
                </PixelText>
              ) : null}
            </PixelPanel>

            <PixelPanel label="Macros">
              <View style={styles.macroRow}>
                {[
                  { label: 'Protein', value: targets.protein, color: colors.rose },
                  { label: 'Carbs', value: targets.carbs, color: colors.teal },
                  { label: 'Fat', value: targets.fat, color: colors.amber },
                ].map((m) => (
                  <View key={m.label} style={styles.macro}>
                    <PixelText variant="label" size={10}>{m.label}</PixelText>
                    <PixelText variant="bold" size={26} color={m.color}>{m.value}g</PixelText>
                  </View>
                ))}
              </View>
            </PixelPanel>

            <PixelText size={13} color={colors.textFaint}>
              These are estimates (about 10% either way). Track your weight for 2-3 weeks and nudge calories if it isn&apos;t
              moving the way you want. Not medical advice.
            </PixelText>
          </>
        )}

        <View style={styles.nav}>
          {step > 0 ? (
            <PixelButton label="Back" tone="ghost" onPress={() => setStep(step - 1)} style={{ flex: 1 }} />
          ) : editing ? (
            <PixelButton label="Cancel" tone="ghost" onPress={leave} style={{ flex: 1 }} />
          ) : null}
          {step < STEPS.length - 1 ? (
            <PixelButton label="Next" tone="amber" disabled={!canNext} onPress={() => setStep(step + 1)} style={{ flex: 2 }} />
          ) : (
            <PixelButton label={saving ? 'Saving...' : editing ? 'Save changes' : 'Start LevelUp'} tone="teal" disabled={!canNext || saving} onPress={finish} style={{ flex: 2 }} />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 48 },
  caption: { position: 'absolute', left: 10, right: 10, bottom: 10 },
  captionInner: { padding: 10, gap: 2 },
  body: { padding: 16, paddingTop: 18, gap: 18 },
  progress: { flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 6 },
  cards: { flexDirection: 'row', gap: 12 },
  sexCard: { alignItems: 'center', gap: 6, paddingVertical: 14 },
  row: { flexDirection: 'row', gap: 12 },
  bmiRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  option: { padding: 14, gap: 2 },
  goalTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macro: { flex: 1, gap: 4 },
  nav: { flexDirection: 'row', gap: 12, marginTop: 6 },
});
