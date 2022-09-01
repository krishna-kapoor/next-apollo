import { GetServerSidePropsContext, GetStaticProps, GetStaticPropsContext } from "next";
import {
    MaybeUndefined,
    ServerSidePageProps,
    StaticPageProps,
    VoidOrPromise,
} from "../createService";

// type x = GetStaticProps;

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

export type GetStaticPropsMiddleware = Middleware<GetStaticPropsContext, StaticPageProps>;

/**
 * Create a middleware function for `getServerSideProps`.
 */
function createGetServerSidePropsMiddleware(middleware: GetServerSidePropsMiddleware) {
    return middleware;
}

/**
 * Create a middleware function for `getStaticProps`.
 */
function createGetStaticPropsMiddleware(middleware: GetStaticPropsMiddleware) {
    return middleware;
}

export const createMiddleware = {
    serverSide: createGetServerSidePropsMiddleware,
    static: createGetStaticPropsMiddleware,
};
