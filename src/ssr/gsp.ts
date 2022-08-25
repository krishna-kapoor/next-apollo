import { GetStaticProps } from "next";
import { StaticPageProps } from "../createService";
import { NonEmptyArray } from "./gssp";
import { GetStaticPropsMiddleware } from "./middleware";

/**
 * Pass in middleware to run them one-by-one to populate `pageProps` with necessary properties and return the results for `getStaticProps`.
 */
export function gsp(...middleware: NonEmptyArray<GetStaticPropsMiddleware>): GetStaticProps {
    return async context => {
        let pageProps = { props: {} } as StaticPageProps;
        let prevIndex = -1;

        const runner = async (index: number) => {
            const currentMiddleware = middleware[index];

            if (index === prevIndex) {
                throw new Error("[gsp] next() was called multiple times.");
            }

            prevIndex = index;

            if (currentMiddleware instanceof Function) {
                await currentMiddleware({
                    context,
                    pageProps,
                    next: () => runner(index + 1),
                });
            }
        };

        await runner(0);

        return pageProps;
    };
}
