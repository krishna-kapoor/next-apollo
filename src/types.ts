import { ApolloClientOptions, NormalizedCacheObject } from '@apollo/client';
import { DocumentNode } from 'graphql';
import {
    GetServerSideProps,
    GetServerSidePropsContext,
    GetStaticProps,
    GetStaticPropsContext,
    Redirect,
} from 'next';
import { AppProps } from 'next/app';
import { ParsedUrlQuery } from 'querystring';
import { createMiddleware } from './ssr';

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

export type Maybe<T> = MaybeUndefined<T> | null;

export type MaybeUndefined<T> = T | undefined;

export type CacheShape = NormalizedCacheObject;

export type ServiceOptions = Omit<ApolloClientOptions<CacheShape>, 'ssrMode'>;

export type MaybePromise<T> = T | Promise<T>;

export type ValueOrCallback<V, P> = V | ((param: P) => V);

export interface OnErrorResponse {
    discontinue?: true;
}

export interface ApolloFetchOptionsBase<Query = any, Variables = any> {
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
    dataKey: Exclude<keyof Query, '__typename'>;
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
    ):
        | MaybeUndefined<OnErrorResponse>
        | Promise<MaybeUndefined<OnErrorResponse>>;
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
    ):
        | MaybeUndefined<OnErrorResponse>
        | Promise<MaybeUndefined<OnErrorResponse>>;
    /**
     * Called when `onError` does not fire and your query returns a `null` or `undefined` value.
     * @param pageProps Static page props, which can be changed within this method.
     */
    onNotFound?(pageProps: StaticPageProps): VoidOrPromise;
}

export type NextFunction = () => void;

/**
 * @deprecated Since version 1.0.5-beta.6
 */
export interface MiddlewareParams<C, P> {
    context: C;
    pageProps: P;
    next: NextFunction;
}

export type Middleware<C, P> = (
    context: C,
    pageProps: P,
    next: NextFunction
) => MaybeUndefined<VoidOrPromise | undefined>;

export type GetServerSidePropsMiddleware = Middleware<
    GetServerSidePropsContext,
    ServerSidePageProps
>;

export type GetStaticPropsMiddleware = Middleware<
    GetStaticPropsContext,
    StaticPageProps
>;

export type Wrapper<T, R> = (...middleware: T[]) => R;

export type GSPWrapper = Wrapper<GetStaticPropsMiddleware, GetStaticProps>;

export type GSSPWrapper = Wrapper<
    GetServerSidePropsMiddleware,
    GetServerSideProps
>;

export type WithInitialApolloState<P = {}> = P & {
    initialApolloState: CacheShape;
};

export type AppPropsWithInitialApolloState<P = {}> = AppProps<
    WithInitialApolloState<P>
>;
