import {
    GetServerSidePropsMiddleware,
    GetStaticPropsMiddleware,
} from '../types';

/**
 * Create a middleware function for `getServerSideProps`.
 */
function createGetServerSidePropsMiddleware(
    middleware: GetServerSidePropsMiddleware
) {
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
