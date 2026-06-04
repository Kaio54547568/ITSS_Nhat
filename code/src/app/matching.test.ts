import { describe, expect, it } from "vitest";
import {
  calculateCompatibility,
  calculateMatchRate,
  getConversationSuggestions,
  resolveConversationSuggestionCycle,
  rankCompatibleUsers,
} from "./matching";

const currentUser = {
  id: "current",
  countryCode: "VN" as const,
  age: 25,
  interests: ["旅行", "写真"],
  personality: ["好奇心旺盛", "聞き上手"],
};

describe("calculateCompatibility", () => {
  it("weights each common interest by ten and each common personality by one", () => {
    expect(
      calculateCompatibility(currentUser, {
        interests: ["旅行", "料理"],
        personality: ["聞き上手", "真面目"],
      }),
    ).toEqual({ commonInterests: ["旅行"], commonPersonality: ["聞き上手"], score: 11 });
  });
});

describe("rankCompatibleUsers", () => {
  it("prioritizes another country, applies the age range, then sorts by score descending", () => {
    const ranked = rankCompatibleUsers(
      currentUser,
      [
        { ...currentUser, id: "same-country-high", interests: ["旅行", "写真"], personality: ["聞き上手"] },
        { ...currentUser, id: "other-country-low", countryCode: "JP" as const, interests: ["旅行"], personality: [] },
        { ...currentUser, id: "other-country-high", countryCode: "JP" as const, interests: ["旅行", "写真"], personality: ["聞き上手"] },
        { ...currentUser, id: "outside-age", countryCode: "JP" as const, age: 40 },
      ],
      { minAge: 20, maxAge: 30 },
    );

    expect(ranked.map((user) => user.id)).toEqual([
      "other-country-high",
      "other-country-low",
      "same-country-high",
    ]);
  });
});

describe("calculateMatchRate", () => {
  it("returns zero for a new account without interests or personality", () => {
    expect(calculateMatchRate({ interests: [], personality: [] }, [])).toBe(0);
  });
});

describe("getConversationSuggestions", () => {
  it("returns two suggestions based on common interests", () => {
    const suggestions = getConversationSuggestions(
      currentUser,
      { interests: ["写真", "料理"], personality: [] },
      () => 0,
    );

    expect(suggestions).toHaveLength(2);
    expect(suggestions.every((suggestion) => suggestion.includes("写真"))).toBe(true);
  });
});

describe("resolveConversationSuggestionCycle", () => {
  it("keeps the same suggestions until the refresh period expires", () => {
    let randomCalls = 0;
    const cached = {
      suggestions: ["保存された提案1", "保存された提案2"],
      expiresAt: 11_000,
    };

    const result = resolveConversationSuggestionCycle(
      currentUser,
      { interests: ["写真"], personality: [] },
      cached,
      10_000,
      600_000,
      () => {
        randomCalls += 1;
        return 0;
      },
    );

    expect(result).toEqual(cached);
    expect(randomCalls).toBe(0);
  });

  it("generates a new pair after the refresh period expires", () => {
    const result = resolveConversationSuggestionCycle(
      currentUser,
      { interests: ["写真"], personality: [] },
      { suggestions: ["期限切れ1", "期限切れ2"], expiresAt: 10_000 },
      10_000,
      600_000,
      () => 0,
    );

    expect(result.suggestions).not.toEqual(["期限切れ1", "期限切れ2"]);
    expect(result.expiresAt).toBe(610_000);
  });
});
