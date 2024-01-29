import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

export default function GamePage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return <></>;

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
            world: worldData
        }
    };
}
