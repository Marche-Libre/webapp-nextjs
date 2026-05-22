export const ONBOARDING_REMINDER_THRESHOLD_PERCENT = 30;

const ONBOARDING_REMINDER_STORAGE_KEY_PREFIX =
  "ml-onboarding-reminder-dismissed";
const ONBOARDING_REMINDER_DISMISSED_VALUE = "1";

type ReminderStorageReader = Pick<Storage, "getItem"> | null | undefined;
type ReminderStorageWriter = Pick<Storage, "setItem"> | null | undefined;

export function getOnboardingReminderStorageKey(userId: string) {
  return `${ONBOARDING_REMINDER_STORAGE_KEY_PREFIX}:${userId}`;
}

export function isProfileBelowOnboardingReminderThreshold(profilePercent: number) {
  return profilePercent < ONBOARDING_REMINDER_THRESHOLD_PERCENT;
}

export function readOnboardingReminderDismissed(
  storage: ReminderStorageReader,
  userId: string,
) {
  if (!storage) {
    return false;
  }

  const storageKey = getOnboardingReminderStorageKey(userId);

  try {
    return storage.getItem(storageKey) === ONBOARDING_REMINDER_DISMISSED_VALUE;
  } catch {
    return false;
  }
}

export function markOnboardingReminderDismissed(
  storage: ReminderStorageWriter,
  userId: string,
) {
  if (!storage) {
    return;
  }

  const storageKey = getOnboardingReminderStorageKey(userId);

  try {
    storage.setItem(storageKey, ONBOARDING_REMINDER_DISMISSED_VALUE);
  } catch {
    // Ignore storage write failures in restricted browsing contexts.
  }
}

export function shouldShowOnboardingReminder(
  profilePercent: number,
  dismissed: boolean,
) {
  return isProfileBelowOnboardingReminderThreshold(profilePercent) && !dismissed;
}
