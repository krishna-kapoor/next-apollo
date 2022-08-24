import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import { GetServerSidePageProps, GetStaticPageProps, VoidOrPromise } from "../createService";

export type NextFunction = () => void;

export type Middleware<C, P> = (
    context: C,
    pageProps: P,
    next: NextFunction
) => VoidOrPromise | undefined;

export type GetServerSidePropsMiddleware = Middleware<
    GetServerSidePropsContext,
    GetServerSidePageProps
>;

export type GetStaticPropsMiddleware = Middleware<GetStaticPropsContext, GetStaticPageProps>;

function createGetServerSidePropsMiddleware(middleware: GetServerSidePropsMiddleware) {
    return middleware;
}

function createGetStaticPropsMiddleware(middleware: GetStaticPropsMiddleware) {
    return middleware;
}

export const createMiddleware = {
    serverSide: createGetServerSidePropsMiddleware,
    static: createGetStaticPropsMiddleware,
};
