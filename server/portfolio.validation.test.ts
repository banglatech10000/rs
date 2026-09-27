import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { demoPortfolio } from "../shared/portfolio";
import type { TrpcContext } from "./_core/context";

function createContext(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("portfolio contract", () => {
  it("ships clearly marked demo content without fabricated personal claims", () => {
    expect(demoPortfolio.settings.siteName).toBe("ROBIUL");
    expect(demoPortfolio.projects.every((project) => project.title.includes("Signal") || project.title.includes("Archive") || project.title.includes("Quiet"))).toBe(true);
    expect(demoPortfolio.experiences[0]?.title).toBe("YOUR EXPERIENCE");
  });

  it("rejects invalid contact payloads at the API boundary", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.contact.submit({ name: "A", email: "not-an-email", subject: "", message: "short", honeypot: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("protects admin overview from regular users", async () => {
    const caller = appRouter.createCaller(createContext({ id: 11, openId: "regular-user", name: "Regular", email: "regular@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
    await expect(caller.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
