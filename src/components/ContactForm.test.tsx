import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContactForm from "./ContactForm";

const strings = {
  tabs: { label: "Type of message", suggestion: "Idea", complaint: "Problem" },
  form: {
    name: "Name", namePlaceholder: "Your name",
    email: "Email", emailPlaceholder: "you@example.com",
    subject: "Subject", subjectPlaceholder: "Subject",
    app: "App", appPlaceholder: "General",
    message: "Message", messagePlaceholder: "Write here",
    submit: "Send",
    sending: "Sending…",
    required: "This field is required",
    invalidEmail: "Enter a valid email",
  },
  success: "Thanks, message sent",
  error: "Something went wrong",
  emailLine: "Or email us at",
  sendAnother: "Send another",
};

function setup(defaultApp?: string, defaultIntent?: "suggestion" | "complaint") {
  const user = userEvent.setup();
  render(
    <ContactForm
      strings={strings}
      email="hello@x.com"
      appOptions={["Arttick"]}
      defaultApp={defaultApp}
      defaultIntent={defaultIntent}
    />
  );
  return user;
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Name/), "Mila");
  await user.type(screen.getByLabelText(/Email/), "mila@example.com");
  await user.type(screen.getByLabelText(/Message/), "Hi");
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("ContactForm", () => {
  it("shows a required error on each required field when submitted empty", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getAllByText(strings.form.required)).toHaveLength(3);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats whitespace-only name and message as missing", async () => {
    const user = setup();
    await user.type(screen.getByLabelText(/Name/), "   ");
    await user.type(screen.getByLabelText(/Email/), "mila@example.com");
    await user.type(screen.getByLabelText(/Message/), "   ");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getAllByText(strings.form.required)).toHaveLength(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the invalid-email error for a malformed address", async () => {
    const user = setup();
    await user.type(screen.getByLabelText(/Name/), "Mila");
    await user.type(screen.getByLabelText(/Email/), "bad");
    await user.type(screen.getByLabelText(/Message/), "Hi");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByText(strings.form.invalidEmail)).toBeInTheDocument();
    expect(screen.queryByText(strings.form.required)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the payload with the selected intent and shows success", async () => {
    const user = setup();
    await user.click(screen.getByRole("radio", { name: "Problem" }));
    await user.type(screen.getByLabelText(/Name/), "Mila");
    await user.type(screen.getByLabelText(/Email/), "mila@example.com");
    await user.selectOptions(screen.getByLabelText("App"), "Arttick");
    await user.type(screen.getByLabelText(/Message/), "Crash on launch");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(init.body)).toMatchObject({
      type: "complaint",
      name: "Mila",
      email: "mila@example.com",
      app: "Arttick",
      message: "Crash on launch",
    });
    expect(await screen.findByText(strings.success)).toBeInTheDocument();
  });

  it("shows the error state when the API fails", async () => {
    fetchMock.mockResolvedValue({ ok: false });
    const user = setup();
    await user.type(screen.getByLabelText(/Name/), "Mila");
    await user.type(screen.getByLabelText(/Email/), "mila@example.com");
    await user.type(screen.getByLabelText(/Message/), "Hi");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText(strings.error)).toBeInTheDocument();
  });

  it("preselects the app it was opened for (support page)", () => {
    setup("Arttick");
    expect(screen.getByLabelText("App")).toHaveValue("Arttick");
  });

  it("falls back to General when the preselected app is not an option", () => {
    setup("Ghost");
    expect(screen.getByLabelText("App")).toHaveValue("");
  });

  it("caps the message at 500 characters", () => {
    setup();
    expect(screen.getByLabelText(/Message/)).toHaveAttribute("maxlength", "500");
    expect(screen.getByText("0/500")).toBeInTheDocument();
  });

  describe("accessibility", () => {
    it("offers the intent as a labelled radio group, Idea by default", () => {
      setup();
      const group = screen.getByRole("radiogroup", { name: "Type of message" });
      expect(group).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "Idea" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Problem" })).not.toBeChecked();
    });

    it("moves the intent with the arrow keys", async () => {
      const user = setup();
      await user.click(screen.getByRole("radio", { name: "Idea" }));
      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("radio", { name: "Problem" })).toBeChecked();
    });

    it("starts on Problem when opened from a support page", async () => {
      const user = setup(undefined, "complaint");
      expect(screen.getByRole("radio", { name: "Problem" })).toBeChecked();
      await fillValid(user);
      await user.click(screen.getByRole("button", { name: "Send" }));
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).type).toBe("complaint");
    });

    it("links each error to its field and marks the field invalid", async () => {
      const user = setup();
      await user.click(screen.getByRole("button", { name: "Send" }));
      for (const label of [/Name/, /Email/, /Message/]) {
        const field = screen.getByLabelText(label);
        expect(field).toHaveAttribute("aria-invalid", "true");
        expect(field).toHaveAccessibleDescription(strings.form.required);
      }
    });

    it("focuses the first invalid field on an invalid submit", async () => {
      const user = setup();
      await user.type(screen.getByLabelText(/Name/), "Mila");
      await user.type(screen.getByLabelText(/Email/), "bad");
      await user.click(screen.getByRole("button", { name: "Send" }));
      expect(screen.getByLabelText(/Email/)).toHaveFocus();
    });

    it("shows a translated sending label and marks the form busy", async () => {
      let resolve!: (v: { ok: boolean }) => void;
      fetchMock.mockReturnValue(new Promise((r) => (resolve = r)));
      const user = setup();
      await fillValid(user);
      await user.click(screen.getByRole("button", { name: "Send" }));
      expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Sending…" }).closest("form")).toHaveAttribute("aria-busy", "true");
      resolve({ ok: true });
      await screen.findByRole("status");
    });

    it("announces success in a status region and moves focus to it", async () => {
      const user = setup();
      await fillValid(user);
      await user.click(screen.getByRole("button", { name: "Send" }));
      const status = await screen.findByRole("status");
      expect(status).toHaveTextContent(strings.success);
      expect(status).toHaveFocus();
    });

    it("announces a failure as an alert", async () => {
      fetchMock.mockResolvedValue({ ok: false });
      const user = setup();
      await fillValid(user);
      await user.click(screen.getByRole("button", { name: "Send" }));
      expect(await screen.findByRole("alert")).toHaveTextContent(strings.error);
    });

    it("Send another restores the default intent", async () => {
      const user = setup();
      await user.click(screen.getByRole("radio", { name: "Problem" }));
      await fillValid(user);
      await user.click(screen.getByRole("button", { name: "Send" }));
      await user.click(await screen.findByRole("button", { name: strings.sendAnother }));
      expect(screen.getByRole("radio", { name: "Idea" })).toBeChecked();
      expect(screen.getByLabelText(/Name/)).toHaveFocus();
    });
  });
});
