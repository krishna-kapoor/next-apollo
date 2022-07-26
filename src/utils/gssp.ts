import { GetServerSideProps } from "next";
import { GSSPMiddleware, NonEmptyArray } from "..";

export function gssp(...middlewares: NonEmptyArray<GSSPMiddleware>): GetServerSideProps {
    return async context => {
        let pageProps = { props: {} } as any;
        let prevIndex = -1;

        const runner = async (index: number) => {
            const middleware = middlewares[index];

            if (index === prevIndex) {
                throw new Error("[next-apollo-ssr] next() was called multiple times");
            }

            if (typeof middleware === "function") {
                await middleware(context, pageProps, () => runner(index + 1));
            }
        };

        await runner(0);

        return pageProps;
    };
}
