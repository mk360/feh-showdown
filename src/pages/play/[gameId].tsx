import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

export default function GamePage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    return {
        props: {
            id: ctx.query.gameId?.toString()
        }
    };
}