import {
    ApolloClient,
    ApolloClientOptions,
    DocumentNode,
    NormalizedCacheObject,
} from "@apollo/client";
import deepmerge from "deepmerge";
import { Redirect } from "next";
import { ParsedUrlQuery } from "querystring";
import { useMemo } from "react";
import { __DEV__ } from "./constants";
import {
    createMiddleware,
    GetServerSidePropsMiddleware,
    GetStaticPropsMiddleware,
} from "./ssr/middleware";

export interface ServerSidePageProps {
    props: {
        initialApolloState: NormalizedCacheObject;
        [key: string]: any;
    };
    redirect: Redirect;
    notFound: true;
}

export interface StaticPageProps extends ServerSidePageProps {
    revalidate: number | false;
}

export type VoidOrPromise = void | Promise<void>;

export type MiddlewareType = keyof typeof createMiddleware;

type Maybe<T> = MaybeUndefined<T> | null;

export type MaybeUndefined<T> = T | undefined;

type CacheShape = NormalizedCacheObject;

export type ServiceOptions = Omit<ApolloClientOptions<CacheShape>, "ssrMode">;

export type MaybePromise<T> = T | Promise<T>;

export type ValueOrCallback<V, P> = V | ((param: P) => V);

export interface OnErrorResponse {
    discontinue?: true;
}

export interface ApolloFetchOptionsBase<Query, Variables = any> {
    /**
     * The GraphQL query to run.
     */
    query: DocumentNode;
    /**
     * GraphQL query variables, if required.
     */
    variables?: ValueOrCallback<Variables, ParamsAndQuery>;
    /**
     * The key of the data that will be returned from the query. This may be used to call `onNotFound` this `data[dataKey]` is undefined.
     */
    dataKay: Exclude<keyof Query, "__typename">;
}

export interface ParamsAndQuery {
    params?: MaybeUndefined<ParsedUrlQuery>;
    query?: MaybeUndefined<ParsedUrlQuery>;
}

export interface ApolloServerSideFetchOptions<Query, Variables = any>
    extends ApolloFetchOptionsBase<Query, Variables> {
    /**
     * Do something with `data` or change `pageProps` based on what data was returned.
     * @param data Data returned after a successful fetch.
     * @param pageProps Server-side page props, which can be changed within this method.
     */
    onCompleted?(data: Query, pageProps: ServerSidePageProps): VoidOrPromise;
    /**
     * Handle errors resulting from fetching.
     * @param pageProps Server-side page props, which can be changed within this method.
     */
    onError?(
        pageProps: ServerSidePageProps
    ): MaybeUndefined<OnErrorResponse> | Promise<MaybeUndefined<OnErrorResponse>>;
    /**
     * Called when `onError` does not fire and your query returns a `null` or `undefined` value.
     * @param pageProps Server-side page props, which can be changed within this method.
     */
    onNotFound?(pageProps: ServerSidePageProps): VoidOrPromise;
}

export interface ApolloStaticFetchOptions<Query, Variables = any>
    extends ApolloFetchOptionsBase<Query, Variables> {
    /**
     * Do something with `data` or change `pageProps` based on what data was returned.
     * @param data Data returned after a successful fetch.
     * @param pageProps Static page props, which can be changed within this method.
     */
    onCompleted?(data: Query, pageProps: StaticPageProps): VoidOrPromise;
    /**
     * Handle errors resulting from fetching.
     * @param pageProps Static page props, which can be changed within this method.
     */
    onError?(
        pageProps: StaticPageProps
    ): MaybeUndefined<OnErrorResponse> | Promise<MaybeUndefined<OnErrorResponse>>;
    /**
     * Called when `onError` does not fire and your query returns a `null` or `undefined` value.
     * @param pageProps Static page props, which can be changed within this method.
     */
    onNotFound?(pageProps: StaticPageProps): VoidOrPromise;
}

let apolloClient: ApolloClient<CacheShape>;

/**
 * A function that returns all utility to be able to use `ApolloClient` in your NextJS project.
 * @param options (ServiceOptions) - All options to be passed into `ApolloClient` except for `cache` and `ssrMode`
 * @version 1.0.7-beta
 */
export function createService(options: ServiceOptions) {
    /**
     * A function that returns a new instance of `ApolloClient`. You may not have to ever use this in your project.
     * @returns `ApolloClient`
     */
    function createApolloClient() {
        return new ApolloClient({
            ssrMode: typeof window === "undefined",
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
        const middleware = createMiddleware[isStatic ? "static" : "serverSide"];

        return middleware(async (context, pageProps, next) => {
            const { query, variables, onCompleted, onError, onNotFound, dataKay } = options;

            const client = initializeApolloClient();

            const { data, error, errors } = await client.query<Query, Variables>({
                query,
                variables:
                    variables instanceof Function
                        ? variables({
                              params: context.params,
                              query: "query" in context ? context.query : undefined,
                          })
                        : variables,
            });

            pageProps.props.initialApolloState = client.cache.extract();

            if (error || errors) {
                if (__DEV__) {
                    console.error("ApolloError", error);
                    console.error("GraphQLErrors", errors);
                }

                const errorResponse = await onError?.(pageProps as any);

                if (errorResponse?.discontinue) return;
            }

            if (data) {
                await onCompleted?.(data, pageProps as any);

                const realData = data[dataKay];

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
