import {getData, limit} from "@/lib/rate_limit";
import {useSession} from "next-auth/react";
import {permanentRedirect} from "next/navigation";
import {getServerSession} from "next-auth/next";

export default async function Admin() {
    const session = await getServerSession()
    const isOwner = session?.user?.email == process.env.OWNER_EMAIL
    if (!isOwner) return "No access"

    const state = getData()
    return <div className="text-4xl">
        <ul>
            <li className={"*:mr-4 mb-10"}>
                <span>Token type: {state.isFree ? "Free" : "Paid"}</span>
                <form action={"/admin/toggleTokenType"} method={"POST"}>
                    <input type={"submit"} value={"I can change that"} className={"bg-primary text-white px-2 rounded-full"}/>
                </form>
            </li>
            <li>Free
                Usage: {state.tokenUsage.free} / {limit.free} ({Math.round((state.tokenUsage.free / limit.free) * 10000) / 100}%)
            </li>
            <li>Paid
                Usage: {state.tokenUsage.paid} / {limit.paid} ({Math.round((state.tokenUsage.paid / limit.paid) * 10000) / 100}%)
            </li>
            <li>Financial damage: S${Math.round((state.tokenUsage.paid / 1_000_000) * 25000)/10000}</li>

        </ul>
    </div>
}