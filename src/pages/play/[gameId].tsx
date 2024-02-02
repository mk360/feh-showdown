import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { useGameContext } from "@/context/game-context";
const Test = dynamic(() => import("@/components/test"), { ssr: false });

export default function GameSession(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [loading, setLoading] = useState(false);
    const { setGame } = useGameContext();

    useEffect(() => {
        setGame!(props.world);
        setLoading(true);
    }, []);

    return <>
        <div id="game" />
        {loading && <Test />}
    </>;
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const resp = await fetch(`http://localhost:3600/worlds/${ctx.query.gameId!}`);
    if (!resp.ok && resp.status === 404) {
        return {
            notFound: true,
        };
    }
    const worldData = await resp.json();
    return {
        props: {
            id: ctx.query.gameId?.toString(),
            world: worldData as JSONEntity[]
        }
    };
}
