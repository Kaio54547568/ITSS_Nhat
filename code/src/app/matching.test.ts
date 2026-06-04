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

  it("filters candidates by the selected country", () => {
    const ranked = rankCompatibleUsers(
      currentUser,
      [
        { ...currentUser, id: "vietnam", countryCode: "VN" as const },
        { ...currentUser, id: "japan", countryCode: "JP" as const },
      ],
      { selectedCountry: "JP" },
    );

    expect(ranked.map((user) => user.id)).toEqual(["japan"]);
  });
});

describe("calculateMatchRate", () => {
  it("counts accepted outbound requests over every outbound request, including pending requests", () => {
    expect(
      calculateMatchRate("current", [
        { fromUserId: "current", status: "accepted" },
        { fromUserId: "current", status: "pending" },
        { fromUserId: "current", status: "rejected" },
        { fromUserId: "other", status: "accepted" },
      ]),
    ).toBe(33);
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

  it("generates a different pair immediately after a message is sent", () => {
    const previous = {
      suggestions: [
        "写真が好きとのことですが、最近どんな写真を撮りましたか？",
        "写真を撮りに行くなら、どこがおすすめですか？",
      ],
      expiresAt: 610_000,
    };

    const result = resolveConversationSuggestionCycle(
      currentUser,
      { interests: ["写真"], personality: [] },
      previous,
      10_000,
      600_000,
      () => 0,
      true,
    );

    expect(result.suggestions).toHaveLength(2);
    expect(result.suggestions).not.toEqual(previous.suggestions);
    expect(result.suggestions.every((suggestion) => !previous.suggestions.includes(suggestion))).toBe(true);
  });
});
