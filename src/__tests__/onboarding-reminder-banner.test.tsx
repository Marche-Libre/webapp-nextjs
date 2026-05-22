import { act } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingReminderBanner } from "@/components/onboarding/onboarding-reminder-banner";
import { getOnboardingReminderStorageKey } from "@/lib/onboarding-reminder";
import type { Profile } from "@/lib/types/database";

type MockedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
};

vi.mock("next/link", () => ({
  default: function MockedNextLink({ children, href, ...props }: MockedLinkProps) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

const LOW_COMPLETENESS_PROFILE_OVERRIDES: Partial<Profile> = {
  first_name: "Jane",
  last_name: "Doe",
  specialty_ids: [],
  location: null,
  bio: null,
  years_experience: null,
  country_code: null,
  skills: [],
  website: null,
  daily_rate: null,
  avatar_url: null,
};

const ABOVE_THRESHOLD_PROFILE_OVERRIDES: Partial<Profile> = {
  ...LOW_COMPLETENESS_PROFILE_OVERRIDES,
  specialty_ids: ["specialty-1"],
  location: "Paris",
  bio: "Je construis des produits numeriques.",
};

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "user-1",
    email: "jane@example.com",
    full_name: "Jane Doe",
    first_name: "Jane",
    last_name: "Doe",
    specialty_ids: [],
    specialty_category_id: null,
    specialty_category_ids: [],
    location: null,
    bio: null,
    x_handle: "janedoe",
    avatar_url: null,
    phone: null,
    years_experience: null,
    country_code: null,
    availability_status: "available",
    skills: [],
    daily_rate: null,
    website: null,
    visibility: {
      first_name: true,
      last_name: true,
      phone: true,
      email: true,
      location: true,
      specialty: true,
      bio: true,
      years_experience: true,
      links: true,
      daily_rate: true,
      website: true,
      skills: true,
    },
    status: "approved",
    is_admin: false,
    links: null,
    accept_referrals: true,
    accept_sponsorship: true,
    accept_dms: true,
    sponsored_by: null,
    sponsor_approved: false,
    onboarding_completed: true,
    looking_for: null,
    hidden_channel_ids: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function renderBanner(profile: Profile) {
  const container = document.createElement("div");
  document.body.append(container);
  let root: Root | null = null;

  act(() => {
    root = createRoot(container);
    root.render(<OnboardingReminderBanner profile={profile} />);
  });

  function unmount() {
    act(() => root?.unmount());
    container.remove();
  }

  return { container, unmount };
}

function getDismissButton(container: HTMLElement) {
  const dismissButton = container.querySelector(
    'button[aria-label="Fermer le rappel de profil"]',
  );

  if (dismissButton instanceof HTMLButtonElement) {
    return dismissButton;
  }

  return null;
}

function dismissReminder(container: HTMLElement) {
  const dismissButton = getDismissButton(container);
  if (!(dismissButton instanceof HTMLButtonElement)) {
    throw new Error("Dismiss button was not rendered");
  }

  act(() => {
    dismissButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

beforeEach(() => {
  document.body.innerHTML = "";
  window.localStorage.clear();
});

describe("OnboardingReminderBanner", () => {
  it("renders below the 30 percent threshold when not dismissed", () => {
    const profile = makeProfile(LOW_COMPLETENESS_PROFILE_OVERRIDES);
    const { container, unmount } = renderBanner(profile);

    expect(container.textContent).toContain("Profil incomplet");
    expect(container.querySelector('a[href="/onboarding"]')).not.toBeNull();
    expect(getDismissButton(container)).not.toBeNull();

    unmount();
  });

  it("can be dismissed and persists dismissal in localStorage", () => {
    const profile = makeProfile(LOW_COMPLETENESS_PROFILE_OVERRIDES);
    const { container, unmount } = renderBanner(profile);

    dismissReminder(container);

    const storageKey = getOnboardingReminderStorageKey(profile.id);
    expect(window.localStorage.getItem(storageKey)).toBe("1");
    expect(getDismissButton(container)).toBeNull();
    expect(container.textContent).not.toContain("Profil incomplet");

    unmount();
  });

  it("does not reappear after remount once dismissed", () => {
    const profile = makeProfile(LOW_COMPLETENESS_PROFILE_OVERRIDES);
    const firstRender = renderBanner(profile);

    dismissReminder(firstRender.container);
    firstRender.unmount();

    const secondRender = renderBanner(profile);

    expect(getDismissButton(secondRender.container)).toBeNull();
    expect(secondRender.container.textContent).not.toContain("Profil incomplet");

    secondRender.unmount();
  });

  it("does not render at or above 30 percent profile completeness", () => {
    const profile = makeProfile(ABOVE_THRESHOLD_PROFILE_OVERRIDES);
    const { container, unmount } = renderBanner(profile);

    expect(getDismissButton(container)).toBeNull();
    expect(container.textContent).not.toContain("Profil incomplet");

    unmount();
  });
});
