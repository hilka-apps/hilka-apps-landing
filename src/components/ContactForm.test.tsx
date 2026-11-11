import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContactForm from "./ContactForm";

const strings = {
  tabs: { suggestion: "Suggestion", complaint: "Complaint" },
  form: {
    name: "Name", namePlaceholder: "Your name",
    email: "Email", emailPlaceholder: "you@example.com",
    subject: "Subject", subjectPlaceholder: "Subject",
    app: "App", appPlaceholder: "General",
    message: "Message", messagePlaceholder: "Write here",
    submit: "Send",
    required: "This field is required",
    invalidEmail: "Enter a valid email",
  },
  success: "Thanks, message sent",
  error: "Something went wrong",
  emailLine: "Or email us at",
  sendAnother: "Send another",
};

function setup(defaultApp?: string) {
  const user = userEvent.setup();
  render(
    <ContactForm strings={strings} email="hello@x.com" appOptions={["Arttick"]} defaultApp={defaultApp} />
  );
  return user;
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
    await user.click(screen.getByRole("tab", { name: "Complaint" }));
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
});
