import { GetServerSideProps, GetStaticProps } from "next";
import { gsp } from "./gsp";
import { gssp } from "./gssp";
import { GetServerSidePropsMiddleware, GetStaticPropsMiddleware } from "./middleware";

export type Wrapper<T, R> = (...middleware: T[]) => R;

export type GSPWrapper = Wrapper<GetStaticPropsMiddleware, GetStaticProps>;

/**
 * This creates a function that wraps other middleware for `getStaticProps`.
 * @param wrapper A middleware function to wrap other middleware
 */
function createGSPWrapper(wrapper: GetStaticPropsMiddleware): GSPWrapper {
    return (...middleware) => gsp(wrapper, ...middleware);
}

export type GSSPWrapper = Wrapper<GetServerSidePropsMiddleware, GetServerSideProps>;

/**
 * This creates a function that wraps other middleware for `getServerSideProps`.
 * @param wrapper A middleware function to wrap other middleware
 */
function createGSSPWrapper(wrapper: GetServerSidePropsMiddleware): GSSPWrapper {
    return (...middleware) => gssp(wrapper, ...middleware);
}

export const createWrapper = {
    static: createGSPWrapper,
    serverSide: createGSSPWrapper,
};
