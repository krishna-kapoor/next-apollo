import {
    GetServerSidePropsMiddleware,
    GetStaticPropsMiddleware,
    GSPWrapper,
    GSSPWrapper,
} from '../types';
import { gsp } from './gsp';
import { gssp } from './gssp';

/**
 * This creates a function that wraps other middleware for `getStaticProps`.
 * @param wrapper A middleware function to wrap other middleware
 */
function createGSPWrapper(wrapper: GetStaticPropsMiddleware): GSPWrapper {
    return (...middleware) => gsp(wrapper, ...middleware);
}

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
