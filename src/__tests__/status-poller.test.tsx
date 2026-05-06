import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatusPoller } from "@/components/sponsorship/status-poller";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: mocks.createClient,
}));

function mockProfileStatus(status: "pending" | "approved" | "rejected") {
  mocks.createClient.mockReturnValue({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(async () => ({
            data: { status, sponsor_approved: false },
          })),
        })),
      })),
    })),
  });
}

beforeEach(() => {
  mocks.push.mockReset();
  mocks.refresh.mockReset();
  mocks.createClient.mockReset();
  document.body.innerHTML = "";
});

describe("StatusPoller", () => {
  function renderStatusPoller() {
    const container = document.createElement("div");
    document.body.append(container);
    let root: Root | null = null;

    act(() => {
      root = createRoot(container);
      root.render(<StatusPoller userId="user-1" />);
    });

    return {
      container,
      unmount: () => {
        act(() => root?.unmount());
      },
    };
  }

  it("refreshes the waiting boundary for rejected users without routing to login or chat", async () => {
    mockProfileStatus("rejected");

    const { container, unmount } = renderStatusPoller();
    const button = container.querySelector("button");

    expect(button?.textContent).toContain("Vérifier mon statut");

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(mocks.push).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Statut mis a jour");

    unmount();
  });

  it("routes only approved users to chat", async () => {
    vi.useFakeTimers();
    mockProfileStatus("approved");

    const { container, unmount } = renderStatusPoller();
    const button = container.querySelector("button");

    expect(button?.textContent).toContain("Vérifier mon statut");

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Compte validé ! Redirection…");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mocks.push).toHaveBeenCalledWith("/chat");
    expect(mocks.refresh).not.toHaveBeenCalled();

    unmount();
    vi.useRealTimers();
  });
});
