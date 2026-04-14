import {readFileSync} from "fs";
import path from "path";
import {writeFileSync} from "node:fs";

export const limit = {
    free: 250_000,
    paid: 6_000_000
}

export function getData() {
    // @ts-ignore
    const state = (globalThis.state ||  { isFree: true, tokenUsage: { free: 0, paid: 0 } }) as { isFree: boolean, tokenUsage: { free: number, paid: number } }
    return state
}

export function getToken() {
    const isFree = getData().isFree
    return isFree ? process.env.GEMINI_FREE_KEY : process.env.GEMINI_PAID_KEY
}

export function imPaying() {
    const state = getData()
    const tokenUsage = state.tokenUsage
    const envName = state.isFree ? "free" : "paid"
    return tokenUsage[envName] < (limit[envName])
}

export function iStillCanPay(tokens: number) {
    const state = getData()
    const tokenUsage = state.tokenUsage
    const envName = state.isFree ? "free" : "paid"
    return (tokenUsage[envName] + tokens + 258) < (limit[envName])

}

export function toggleTokenType() {
    const state = {...getData()}
    state.isFree = !state.isFree
    // @ts-ignore
    globalThis.state = state
}

export function appendUsedTokens(tokens: number) {
    const state = {...getData()}
    const envName = state.isFree ? "free" : "paid"
    state.tokenUsage[envName] += tokens
    // @ts-ignore
    globalThis.state = state
}