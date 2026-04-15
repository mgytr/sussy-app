import redis from "./redis";

const KEY = "app_state";
const DEFAULT = { isFree: true, tokenUsage: { free: 0, paid: 0 } };
type State = typeof DEFAULT;

export const limit = {
    free: 250_000,
    paid: 6_000_000
}

export async function getData(): Promise<State> {
    const raw = await redis.get(KEY);
    return raw ? JSON.parse(raw) : DEFAULT;
}

export async function getToken() {
    const { isFree } = await getData();
    return isFree ? process.env.GEMINI_FREE_KEY : process.env.GEMINI_PAID_KEY;
}

export async function imPaying() {
    const state = await getData();
    const envName = state.isFree ? "free" : "paid";
    return state.tokenUsage[envName] < limit[envName];
}

export async function iStillCanPay(tokens: number) {
    const state = await getData();
    const envName = state.isFree ? "free" : "paid";
    return state.tokenUsage[envName] + tokens + 258 < limit[envName];
}

async function saveData(state: State) {
    await redis.set(KEY, JSON.stringify(state));
}

export async function toggleTokenType() {
    const state = await getData();
    state.isFree = !state.isFree;
    await saveData(state);
}

export async function appendUsedTokens(tokens: number) {
    const state = await getData();
    const envName = state.isFree ? "free" : "paid";
    state.tokenUsage[envName] += tokens;
    await saveData(state);
}