import { GetServerSideProps, GetStaticProps } from "next";
import { gsp } from "./gsp";
import { gssp } from "./gssp";
import { GetServerSidePropsMiddleware, GetStaticPropsMiddleware } from "./middleware";

export type Wrapper<T, R> = (...middleware: T[]) => R;

function createGSPWrapper(
    wrapper: GetStaticPropsMiddleware
): Wrapper<GetStaticPropsMiddleware, GetStaticProps> {
    return (...middleware) => gsp(wrapper, ...middleware);
}

function createGSSPWrapper(
    wrapper: GetServerSidePropsMiddleware
): Wrapper<GetServerSidePropsMiddleware, GetServerSideProps> {
    return (...middleware) => gssp(wrapper, ...middleware);
}

export const createWrapper = {
    static: createGSPWrapper,
    serverSide: createGSSPWrapper,
};
