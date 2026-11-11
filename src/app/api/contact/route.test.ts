// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

import { POST } from "./route";

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );

const valid = { name: "Mila", email: "mila@example.com", message: "Hi", type: "suggestion" };

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "re_test");
  send.mockReset().mockResolvedValue({ error: null });
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/contact", () => {
  it("rejects missing required fields with 400", async () => {
    const res = await post({ ...valid, message: "   " });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing required fields" });
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects a malformed email with 400", async () => {
    const res = await post({ ...valid, email: "nope" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid email address" });
  });

  it("returns 503 when Resend is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await post(valid);
    expect(res.status).toBe(503);
  });

  it("sends a trimmed reply-to and tagged subject", async () => {
    const res = await post({ ...valid, email: "  mila@example.com ", type: "complaint", app: "Arttick" });
    expect(res.status).toBe(200);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: "mila@example.com",
        subject: "[Complaint · Arttick] from Mila",
      })
    );
  });

  it("does not crash on a non-string name", async () => {
    const res = await post({ ...valid, name: 42 });
    expect(res.status).toBe(200);
  });

  it("returns 500 when Resend reports an error", async () => {
    send.mockResolvedValue({ error: { message: "boom" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(valid);
    expect(res.status).toBe(500);
  });
});
