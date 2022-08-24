import {
    ApolloClient,
    ApolloClientOptions,
    DocumentNode,
    InMemoryCache,
    NormalizedCacheObject,
} from "@apollo/client";
import deepmerge from "deepmerge";
import { Redirect } from "next";
import { ParsedUrlQuery } from "querystring";
import { useMemo } from "react";
import { __DEV__ } from "./constants";
import { createMiddleware } from "./ssr/middleware";

export interface GetServerSidePageProps {
    props: {
        initialApolloState: NormalizedCacheObject;
        [key: string]: any;
    };
    redirect: Redirect;
    notFound: true;
}

export interface GetStaticPageProps extends GetServerSidePageProps {
    revalidate: number | false;
}

export type VoidOrPromise = void | Promise<void>;

export type MiddlewareType = keyof typeof createMiddleware;

type Maybe<T> = MaybeUndefined<T> | null;

type MaybeUndefined<T> = T | undefined;

type CacheShape = NormalizedCacheObject;

export type ServiceOptions = Omit<ApolloClientOptions<CacheShape>, "ssrMode" | "cache">;

export type ValueOrCallback<V, P> = V | ((param: P) => V);

export interface OnErrorResponse {
    discontinue?: true;
}

export interface SSRFetchOptions<Query, Variables = any> {
    query: DocumentNode;
    variables?: ValueOrCallback<Variables, MaybeUndefined<ParsedUrlQuery>>;
    onCompleted?(data: Query, pageProps: GetServerSidePageProps): VoidOrPromise;
    onError?(
        pageProps: GetServerSidePageProps
    ): MaybeUndefined<OnErrorResponse> | Promise<MaybeUndefined<OnErrorResponse>>;
}

let apolloClient: ApolloClient<CacheShape>;

/**
 * A function that returns all utility to be able to use `ApolloClient` in your NextJS project. **v1.0.5** uses `InMemoryCache` by default, so that you do not need to pass it explicitly in `options`.
 * @param options (ServiceOptions) - All options to be passed into `ApolloClient` except for `cache` and `ssrMode`
 */
export function createService(options: ServiceOptions) {
    /**
     * A function that returns a new instance of `ApolloClient`. You may not have to ever use this in your project.
     * @returns `ApolloClient`
     */
    function createApolloClient() {
        return new ApolloClient({
            ssrMode: typeof window === "undefined",
            cache: new InMemoryCache(),
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
            const previousCacheState = _apolloClient.extract();
            const mergedState = deepmerge(previousCacheState, initialState);
            _apolloClient.cache.restore(mergedState);
        }

        if (typeof window === "undefined") {
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
    function useNextApollo(pageProps: any) {
        return useMemo(
            () => initializeApolloClient(pageProps.initialApolloState),
            [pageProps.initialApolloState]
        );
    }

    /**
     * A fetcher that runs server-side to perform query fetches for Apollo. It can be used to generate server-side or static pages.
     * @param options `query` and `variables` options to be passed into `ApolloClient#query`.
     * @param type - Either `serverSide` or `static` depending on how you want NextJS to render your page. Defaults to `serverSide`.
     * @returns A middleware function that can be passed into `gssp` or `gsp`.
     */
    function apolloFetch<Query = any, Variables = any>(
        options: SSRFetchOptions<Query, Variables>,
        type: MiddlewareType = "serverSide"
    ) {
        const middleware = createMiddleware[type];

        return middleware(async ({ context: ctx, pageProps, next }) => {
            const { query, variables, onCompleted, onError } = options;

            const client = initializeApolloClient();

            const { data, error, errors } = await client.query<Query, Variables>({
                query,
                variables: variables instanceof Function ? variables(ctx.params) : variables,
            });

            if (error || errors) {
                if (__DEV__) {
                    console.error("ApolloError", error);
                    console.error("GraphQLErrors", errors);
                }

                const errorResponse = await onError?.(pageProps);

                if (errorResponse?.discontinue) return;
            }

            if (data) {
                await onCompleted?.(data, pageProps);
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
