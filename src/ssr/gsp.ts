import { GetStaticProps } from 'next';
import { GetStaticPropsMiddleware, StaticPageProps } from '../types';
import { NonEmptyArray } from './gssp';

/**
 * Pass in middleware to run them one-by-one to populate `pageProps` with necessary properties and return the results for `getStaticProps`.
 */
export function gsp(
    ...middleware: NonEmptyArray<GetStaticPropsMiddleware>
): GetStaticProps {
    return async (context) => {
        let pageProps = { props: {} } as StaticPageProps;
        let prevIndex = -1;

        const runner = async (index: number) => {
            const currentMiddleware = middleware[index];

            if (index === prevIndex) {
                throw new Error('[gsp] next() was called multiple times.');
            }

            prevIndex = index;

            if (typeof currentMiddleware === 'function') {
                await currentMiddleware(context, pageProps, () =>
                    runner(index + 1)
                );
            }
        };

        await runner(0);

        return pageProps;
    };
}
