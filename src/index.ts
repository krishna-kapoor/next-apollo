import {
    ApolloClient,
    ApolloClientOptions,
    DocumentNode,
    NormalizedCacheObject,
} from "@apollo/client";
import merge from "deepmerge";
import { GetServerSidePropsContext, Redirect } from "next";
import { ParsedUrlQuery } from "querystring";
import { useMemo } from "react";
import { createGSSPMiddleware } from "./utils/createGSSPMiddleware";

export type NextFunction = () => void;
export interface PageProps {
    props: {
        initialApolloState: NormalizedCacheObject;
        [key: string]: any;
    };
    redirect: Redirect;
}

export type GSSPMiddleware = (
    context: GetServerSidePropsContext,
    pageProps: PageProps,
    next: NextFunction
) => void | Promise<void> | undefined;
export type NonEmptyArray<T> = [T, ...T[]];
export type ValueOrCallback<V, P> = V | ((parameter: P) => V);
export type NextApolloClientOptions = Omit<ApolloClientOptions<NormalizedCacheObject>, "ssrMode">;
export interface ApolloFetchOptions<V = never> {
    query: DocumentNode;
    variables?: ValueOrCallback<V, ParsedUrlQuery>;
}

let apolloClient: ApolloClient<NormalizedCacheObject>;

const ssrMode = typeof window === "undefined";

export default class NextApolloClient {
    options: NextApolloClientOptions;

    constructor(options: NextApolloClientOptions) {
        this.options = options;
    }

    createClient() {
        return new ApolloClient({
            ...this.options,
            ssrMode,
        });
    }

    initializeApollo(initialState?: NormalizedCacheObject) {
        const _apolloClient = apolloClient ?? this.createClient();

        if (initialState) {
            const existingCache = _apolloClient.extract();

            const data = merge(initialState, existingCache);

            _apolloClient.cache.restore(data);
        }

        if (ssrMode) {
            return _apolloClient;
        }

        apolloClient = apolloClient ?? _apolloClient;

        return apolloClient;
    }

    useNextApollo(initialState?: NormalizedCacheObject) {
        return useMemo(() => this.initializeApollo(initialState), [initialState]);
    }

    apolloFetch<V = never>({ query, variables }: ApolloFetchOptions<V>) {
        return createGSSPMiddleware(async (context, pageProps, next) => {
            const client = this.initializeApollo();

            await client.query({
                query,
                variables: variables instanceof Function ? variables(context.query) : variables,
            });

            pageProps.props.initialApolloState = client.cache.extract();

            return next();
        });
    }
}
