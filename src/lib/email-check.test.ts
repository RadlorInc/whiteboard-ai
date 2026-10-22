import { expect, it } from "vitest";
import { emailProblem } from "./email-check";

it("refuses + aliases and throwaway inboxes, keeps ordinary addresses", () => {
  expect(emailProblem("ali+1@gmail.com")).toBe("alias");
  expect(emailProblem(" Ali+x@Outlook.com ")).toBe("alias");
  expect(emailProblem("someone@mailinator.com")).toBe("throwaway");
  expect(emailProblem("x@YOPMAIL.com")).toBe("throwaway");
  expect(emailProblem("ali@gmail.com")).toBeNull();
  expect(emailProblem("a.li@radlor.com")).toBeNull();
  expect(emailProblem("someone@hotmail.co.uk")).toBeNull(); // a real Outlook address must pass (22 Oct 2026 report)
});
