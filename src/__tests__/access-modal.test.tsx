import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccessModal } from "@/components/auth/access-modal";

const mocks = vi.hoisted(() => ({
  pathname: "/",
  replace: vi.fn(),
  searchParams: "auth=access",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
  useSearchParams: () => new URLSearchParams(mocks.searchParams),
}));

vi.mock("@/components/auth/oauth-buttons", () => ({
  OAuthButtons: () => <button type="button">Continuer avec X</button>,
}));

function renderAccessModal() {
  const container = document.createElement("div");
  document.body.append(container);
  let root: Root | null = null;

  act(() => {
    root = createRoot(container);
    root.render(<AccessModal />);
  });

  return {
    container,
    unmount: () => {
      act(() => root?.unmount());
    },
  };
}

beforeEach(() => {
  mocks.pathname = "/";
  mocks.replace.mockReset();
  mocks.searchParams = "auth=access";
  document.body.innerHTML = "";

  HTMLDialogElement.prototype.showModal = vi.fn(function showModal() {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function close() {
    this.removeAttribute("open");
  });
});

describe("AccessModal", () => {
  it("closes immediately and removes the access auth query parameter", () => {
    const { container, unmount } = renderAccessModal();
    const closeButton = container.querySelector(
      'button[aria-label="Fermer"]',
    );

    expect(container.querySelector("dialog")?.className).toContain(
      "modal-open",
    );
    expect(closeButton).toBeInstanceOf(HTMLButtonElement);

    act(() => {
      closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mocks.replace).toHaveBeenCalledWith("/", { scroll: false });
    expect(container.querySelector("dialog")?.className).not.toContain(
      "modal-open",
    );

    unmount();
  });
});
