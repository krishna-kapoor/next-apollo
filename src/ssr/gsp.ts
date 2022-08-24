import { GetStaticProps } from "next";
import { NonEmptyArray } from "./gssp";
import { GetStaticPropsMiddleware } from "./middleware";

export function gsp(...middleware: NonEmptyArray<GetStaticPropsMiddleware>): GetStaticProps {
    return async context => {
        const pageProps = { props: {} as never } as any;
        let prevIndex = -1;

        const runner = async (index: number) => {
            const middlewareToRun = middleware[index];

            if (index === prevIndex) {
                throw new Error("[gssp] next() was called multiple times.");
            }

            prevIndex = index;

            if (middleware instanceof Function) {
                await middlewareToRun(context, pageProps, () => runner(index + 1));
            }
        };

        await runner(0);

        return pageProps;
    };
}
