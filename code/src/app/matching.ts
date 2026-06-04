export interface CompatibilityProfile {
  interests: string[];
  personality: string[];
}

export interface RankableProfile extends CompatibilityProfile {
  id: string;
  countryCode: "VN" | "JP";
  age: number;
}

export interface CompatibilityResult {
  commonInterests: string[];
  commonPersonality: string[];
  score: number;
}

export interface ConversationSuggestionCycle {
  suggestions: string[];
  expiresAt: number;
}

export interface MatchRateRequest {
  fromUserId: string;
  status: string;
}

const INTEREST_SUGGESTIONS: Record<string, string[]> = {
  テクノロジー: ["テクノロジーについて、最近気になるニュースはありますか？", "テクノロジーで生活が便利になったと感じることはありますか？"],
  コーヒー: ["コーヒーが好きとのことですが、おすすめのお店はありますか？", "コーヒーはどんな飲み方が好きですか？"],
  写真: ["写真が好きとのことですが、最近どんな写真を撮りましたか？", "写真を撮りに行くなら、どこがおすすめですか？"],
  旅行: ["旅行で一番印象に残っている場所はどこですか？", "次に旅行するなら、どこへ行きたいですか？"],
  読書: ["読書が好きとのことですが、最近読んだおすすめの本はありますか？", "読書をするときは、どんなジャンルを選びますか？"],
  料理: ["料理が好きとのことですが、得意料理は何ですか？", "料理で挑戦してみたいメニューはありますか？"],
  日本文化: ["日本文化で特に興味があるものは何ですか？", "日本文化について、最近新しく知ったことはありますか？"],
  カフェ: ["カフェ巡りでおすすめのお店はありますか？", "カフェではどんな時間を過ごすのが好きですか？"],
  サッカー: ["サッカーは観戦とプレーのどちらが好きですか？", "サッカーで応援しているチームはありますか？"],
  アニメ: ["アニメが好きとのことですが、おすすめの作品はありますか？", "最近見たアニメで面白かった作品は何ですか？"],
  デザイン: ["デザインで最近気になった作品はありますか？", "デザインするときに大切にしていることは何ですか？"],
  映画: ["映画が好きとのことですが、最近見たおすすめはありますか？", "映画はどんなジャンルが好きですか？"],
  音楽: ["音楽はどんなジャンルをよく聴きますか？", "最近よく聴いている曲はありますか？"],
  ランニング: ["ランニングはいつ、どこで走ることが多いですか？", "ランニングを続けるコツはありますか？"],
  ビジネス: ["ビジネスで最近関心があるテーマは何ですか？", "仕事で大切にしている考え方はありますか？"],
  海: ["海で過ごすなら、何をするのが好きですか？", "おすすめの海やビーチはありますか？"],
  ヨガ: ["ヨガを始めたきっかけは何ですか？", "ヨガで好きなポーズはありますか？"],
  スキー: ["スキーでおすすめの場所はありますか？", "スキーはいつ頃から始めましたか？"],
  茶道: ["茶道のどんなところが好きですか？", "茶道を始めたきっかけは何ですか？"],
  歴史: ["歴史で特に興味がある時代はいつですか？", "歴史に関するおすすめの場所や本はありますか？"],
  本: ["本が好きとのことですが、最近のおすすめはありますか？", "何度も読み返したくなる本はありますか？"],
  スタートアップ: ["スタートアップで注目しているサービスはありますか？", "スタートアップのどんなところに魅力を感じますか？"],
  ベトナム文化: ["ベトナム文化で特に好きなものは何ですか？", "ベトナム文化について、おすすめしたい体験はありますか？"],
};

const GENERAL_SUGGESTIONS = [
  "今どこに住んでいますか？",
  "休みの日は何をして過ごしますか？",
  "趣味は何ですか？",
  "日本語はどのくらい勉強していますか？",
  "ベトナム料理は好きですか？",
  "日本料理は好きですか？",
];

function intersection(left: string[], right: string[]) {
  const rightValues = new Set(right);
  return Array.from(new Set(left.filter((item) => rightValues.has(item))));
}

export function calculateCompatibility(
  current: CompatibilityProfile,
  candidate: CompatibilityProfile,
): CompatibilityResult {
  const commonInterests = intersection(current.interests, candidate.interests);
  const commonPersonality = intersection(current.personality, candidate.personality);
  return {
    commonInterests,
    commonPersonality,
    score: commonInterests.length * 10 + commonPersonality.length,
  };
}

export function rankCompatibleUsers<T extends RankableProfile>(
  current: RankableProfile,
  candidates: T[],
  filters: { minAge?: number; maxAge?: number; selectedCountry?: "" | "VN" | "JP" } = {},
) {
  return candidates
    .filter((candidate) => {
      if (filters.minAge !== undefined && candidate.age < filters.minAge) return false;
      if (filters.maxAge !== undefined && candidate.age > filters.maxAge) return false;
      if (filters.selectedCountry && candidate.countryCode !== filters.selectedCountry) return false;
      return true;
    })
    .map((candidate) => ({
      candidate,
      isDifferentCountry: candidate.countryCode !== current.countryCode,
      score: calculateCompatibility(current, candidate).score,
    }))
    .sort((left, right) => {
      if (left.isDifferentCountry !== right.isDifferentCountry) return left.isDifferentCountry ? -1 : 1;
      if (left.score !== right.score) return right.score - left.score;
      return left.candidate.id.localeCompare(right.candidate.id);
    })
    .map(({ candidate }) => candidate);
}

export function calculateMatchRate(
  currentUserId: string,
  requests: MatchRateRequest[],
) {
  const outboundRequests = requests.filter((request) => request.fromUserId === currentUserId);
  if (outboundRequests.length === 0) return 0;
  const acceptedRequests = outboundRequests.filter((request) => request.status === "accepted").length;
  return Math.round((acceptedRequests / outboundRequests.length) * 100);
}

export function getConversationSuggestions(
  current: CompatibilityProfile,
  contact: CompatibilityProfile,
  random: () => number = Math.random,
  excludedSuggestions: string[] = [],
) {
  const commonInterests = intersection(current.interests, contact.interests);
  const interestPool = commonInterests.flatMap((interest) => [
    ...(INTEREST_SUGGESTIONS[interest] ?? [
      `${interest}が好きとのことですが、始めたきっかけは何ですか？`,
      `${interest}について、おすすめを教えてください。`,
    ]),
    `${interest}を一緒に楽しむなら、何をしてみたいですか？`,
    `${interest}の魅力を一つ紹介するとしたら、何を選びますか？`,
  ]);
  const excluded = new Set(excludedSuggestions);
  const available = Array.from(new Set([...interestPool, ...GENERAL_SUGGESTIONS])).filter(
    (suggestion) => !excluded.has(suggestion),
  );
  const selected: string[] = [];
  while (available.length > 0 && selected.length < 2) {
    const index = Math.min(available.length - 1, Math.floor(random() * available.length));
    const [suggestion] = available.splice(index, 1);
    if (suggestion && !selected.includes(suggestion)) selected.push(suggestion);
  }
  return selected;
}

export function resolveConversationSuggestionCycle(
  current: CompatibilityProfile,
  contact: CompatibilityProfile,
  cached: ConversationSuggestionCycle | null,
  now: number,
  refreshIntervalMs: number,
  random: () => number = Math.random,
  forceRefresh = false,
): ConversationSuggestionCycle {
  if (!forceRefresh && cached && cached.expiresAt > now && cached.suggestions.length === 2) return cached;
  return {
    suggestions: getConversationSuggestions(current, contact, random, cached?.suggestions),
    expiresAt: now + refreshIntervalMs,
  };
}
