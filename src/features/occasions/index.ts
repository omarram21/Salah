// Friday and Ramadan rules (pure) and the settings-aware hook. UI lives in the screens that use it.
export { useOccasions } from './hooks/use-occasions';
export { eidOf, fastPhase, isFriday, isRamadanDay, kahfEndsAt, prayerNameKey, wallHourAt, type Eid, type FastPhase } from './logic/occasions';
