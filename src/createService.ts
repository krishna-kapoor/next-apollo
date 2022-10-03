import { ApolloClient } from '@apollo/client';
import deepmerge from 'deepmerge';
import isEqual from 'lodash/isEqual';
import { useMemo } from 'react';
import { __DEV__ } from './constants';
import { dehydrate } from './ssr/dehydrate';
import { createMiddleware } from './ssr/middleware';
import {
    ApolloServerSideFetchOptions,
    ApolloStaticFetchOptions,
    CacheShape,
    GetServerSidePropsMiddleware,
    GetStaticPropsMiddleware,
    Maybe,
    ServiceOptions,
    WithInitialApolloState,
} from './types';

let apolloClient: ApolloClient<CacheShape>;

/**
 * A function that returns all utility to be able to use `ApolloClient` in your NextJS project.
 * @param options (ServiceOptions) - All options to be passed into `ApolloClient` except for `cache` and `ssrMode`
 * @version 1.1.0
 */
export function createService(options: ServiceOptions) {
    /**
     * A function that returns a new instance of `ApolloClient`. You may not have to ever use this in your project.
     * @returns `ApolloClient`
     */
    function createApolloClient() {
        return new ApolloClient({
            ssrMode: typeof window === 'undefined',
            ...options,
        });
    }

    /**
     * A function to initialize `ApolloClient`, which makes sure that a new instance of `ApolloClient` is always created during server-side rendering, while using only the global instance during client-side rendering.
     * @param initialState The initial cache state of `ApolloClient`. During SSR, this **needs** to be undefined.
     * @returns `ApolloClient`
     */
    function initializeApolloClient(initialState: Maybe<CacheShape> = null) {
        const _apolloClient = apolloClient ?? createApolloClient();

        if (initialState) {
            const existingCache = _apolloClient.extract();

            const merged = deepmerge(initialState, existingCache, {
                arrayMerge(target, source) {
                    return [
                        ...source,
                        ...target.filter((d) =>
                            source.every((s) => !isEqual(s, d))
                        ),
                    ];
                },
            });

            _apolloClient.cache.restore(merged);
        }

        if (typeof window === 'undefined') {
            return _apolloClient;
        }

        if (!apolloClient) apolloClient = _apolloClient;

        return _apolloClient;
    }

    /**
     * A React hook to return the correct instance of ApolloClient while using it within React. You will need a custom `_app.js` page for this.
     * @param pageProps The `pageProps` that the custom app provides every component.
     * @returns `ApolloClient`
     */
    function useNextApollo<P>(pageProps: WithInitialApolloState<P>) {
        return useMemo(
            () => initializeApolloClient(pageProps.initialApolloState),
            [pageProps.initialApolloState]
        );
    }

    function apolloFetch<Query = any, Variables = any>(
        options: ApolloServerSideFetchOptions<Query, Variables>
    ): GetServerSidePropsMiddleware;
    function apolloFetch<Query = any, Variables = any>(
        options: ApolloStaticFetchOptions<Query, Variables>,
        isStatic: true
    ): GetStaticPropsMiddleware;

    /**
     * A fetcher that runs server-side to perform query fetches for Apollo. It can be used to generate server-side or static pages.
     * @param options `query` and `variables` options to be passed into `ApolloClient#query`.
     * @param isStatic - Whether to use `apolloFetch` for `getStaticProps`.
     * @returns A middleware function that can be passed into `gssp` or `gsp`.
     */
    function apolloFetch<Query = any, Variables = any>(
        options:
            | ApolloServerSideFetchOptions<Query, Variables>
            | ApolloStaticFetchOptions<Query, Variables>,
        isStatic = false
    ) {
        const middleware = createMiddleware[isStatic ? 'static' : 'serverSide'];

        return middleware(async (context, pageProps, next) => {
            const {
                query,
                variables,
                onCompleted,
                onError,
                onNotFound,
                dataKey,
            } = options;

            const client = initializeApolloClient();

            const { data, error, errors } = await client.query<
                Query,
                Variables
            >({
                query,
                variables:
                    variables instanceof Function
                        ? variables({
                              params: context.params,
                              query:
                                  'query' in context
                                      ? context.query
                                      : undefined,
                          })
                        : variables,
            });

            pageProps.props.initialApolloState = dehydrate(client);

            if (error || errors) {
                if (__DEV__) {
                    console.error('ApolloError', error);
                    console.error('GraphQLErrors', errors);
                }

                const errorResponse = await onError?.(pageProps as any);

                if (errorResponse?.discontinue) return;
            }

            if (data) {
                await onCompleted?.(data, pageProps as any);

                const realData = data[dataKey];

                if (!realData) {
                    await onNotFound?.(pageProps as any);
                }
            }

            return next();
        });
    }

    return {
        createApolloClient,
        useNextApollo,
        initializeApolloClient,
        apolloFetch,
    };
}
