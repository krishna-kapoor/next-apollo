import { GetServerSideProps } from "next";
import { GetServerSidePropsMiddleware } from "./middleware";

export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Pass in middleware to run them one-by-one to populate `pageProps` with necessary properties and return the results for `getServerSideProps`.
 */
export function gssp(
    ...middleware: NonEmptyArray<GetServerSidePropsMiddleware>
): GetServerSideProps {
    return async context => {
        const pageProps = { props: {} as never } as any;
        let prevIndex = -1;

        const runner = async (index: number) => {
            const currentMiddleware = middleware[index];

            if (index === prevIndex) {
                throw new Error("[gssp] next() was called multiple times.");
            }

            prevIndex = index;

            if (middleware instanceof Function) {
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
