import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import { GetServerSidePageProps, GetStaticPageProps, VoidOrPromise } from "../createService";

export type NextFunction = () => void;

export interface MiddlewareParams<C, P> {
    context: C;
    pageProps: P;
    next: NextFunction;
}

export type Middleware<C, P> = (params: MiddlewareParams<C, P>) => VoidOrPromise | undefined;

export type GetServerSidePropsMiddleware = Middleware<
    GetServerSidePropsContext,
    GetServerSidePageProps
>;

export type GetStaticPropsMiddleware = Middleware<GetStaticPropsContext, GetStaticPageProps>;

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
