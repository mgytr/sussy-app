import { toggleTokenType } from "@/lib/rate_limit";
import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth/next";

export async function POST() {
    const session = await getServerSession()
    const isOwner = session?.user?.email == process.env.OWNER_EMAIL
    if (!isOwner) return new Response("what authority are YOU on?", { status: 401 })
    await toggleTokenType()
    redirect("/admin")
}

export async function GET() {
    redirect("/")
}